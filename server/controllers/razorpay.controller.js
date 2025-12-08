import asyncHandler from "../utils/asyncHandler.js";
import ApiError from "../utils/ApiError.js";
import { RazorpayCredential } from "../models/razorpayCredential.model.js";
import cryptoUtil from "../utils/cryptoUtil.js";
import { RazorpayTransaction } from "../models/razorpayTransaction.model.js";
import { FeePayment } from "../models/feePayment.model.js";
import crypto from "crypto";

// Ensure proper unique index on orderId (ignore nulls) and drop legacy bad index if present
async function ensureOrderIdIndex() {
	try {
		const indexes = await RazorpayTransaction.collection.indexes();
		const hasBadIndex = indexes.some(i => i.name === "razorpayOrderId_1");
		if (hasBadIndex) {
			console.warn("Dropping legacy index 'razorpayOrderId_1' that enforces uniqueness on nulls");
			try {
				await RazorpayTransaction.collection.dropIndex("razorpayOrderId_1");
				console.log("Dropped bad index 'razorpayOrderId_1'");
			} catch (e) {
				console.error("Failed to drop bad index 'razorpayOrderId_1':", e.message);
			}
		}

		// Ensure the correct partial unique index exists
		const hasGoodIndex = indexes.some(i => i.name === "orderId_1" && i.unique);
		if (!hasGoodIndex) {
			console.log("Creating partial unique index on orderId");
			try {
				await RazorpayTransaction.collection.createIndex(
					{ orderId: 1 },
					{ unique: true, partialFilterExpression: { orderId: { $type: "string" } }, name: "orderId_1" }
				);
				console.log("Created partial unique index 'orderId_1'");
			} catch (e) {
				console.error("Failed creating 'orderId_1' index:", e.message);
			}
		}
	} catch (e) {
		console.error("Error ensuring indexes:", e.message);
	}
}

// Create Razorpay Order (used by students to initiate payment)
export const createRazorpayOrder = asyncHandler(async (req, res) => {
	const student = req.user;
	if (!student) {
		console.error("No student found in request");
		throw new ApiError(401, "Unauthorized");
	}

	// Attempt to fix legacy index before any transaction writes
	await ensureOrderIdIndex();

	const { amount, currency = "INR", receipt, notes = {}, adminId } = req.body || {};

	console.log("Order request:", { amount, currency, receipt, adminId });

	if (!amount || isNaN(amount) || Number(amount) <= 0) {
		console.error("Invalid amount:", amount);
		throw new ApiError(400, "Invalid amount. Must be a positive number.");
	}

	// Validate amount doesn't exceed Razorpay limit (₹50,00,000 / 50 lakhs)
	const numAmount = Number(amount);
	const RAZORPAY_MAX_AMOUNT = 5000000; // ₹50,00,000
	if (numAmount > RAZORPAY_MAX_AMOUNT) {
		console.error("Amount exceeds Razorpay limit:", numAmount);
		throw new ApiError(400, `Amount exceeds maximum limit of ₹${RAZORPAY_MAX_AMOUNT.toLocaleString('en-IN')}. Please split the payment or contact admin.`);
	}

	// Amount should be in paise for Razorpay
	const amountPaise = Math.round(numAmount * 100);
	console.log("Amount in paise:", amountPaise);

	// Find credentials: prefer adminId if provided, else any credential
	let creds;
	if (adminId) {
		creds = await RazorpayCredential.findOne({ admin: adminId }).lean();
		console.log("Looking for credentials for admin:", adminId, "Found:", !!creds);
	} else {
		creds = await RazorpayCredential.findOne({}).lean();
		console.log("Looking for any credentials. Found:", !!creds);
	}

	if (!creds || !creds.keyIdEncrypted || !creds.keySecretEncrypted) {
		console.error("Razorpay credentials not found or incomplete");
		throw new ApiError(500, "Payment gateway credentials not configured. Ask admin to configure Razorpay credentials.");
	}

	// Ensure admin field exists and is valid
	if (!creds.admin) {
		console.error("Credentials found but admin field is missing:", creds._id);
		throw new ApiError(500, "Credential record is malformed. Ask admin to reconfigure Razorpay.");
	}

	const keyId = cryptoUtil.decrypt(creds.keyIdEncrypted);
	const keySecret = cryptoUtil.decrypt(creds.keySecretEncrypted);
	if (!keyId || !keySecret) {
		console.error("Failed to decrypt credentials");
		throw new ApiError(500, "Invalid payment gateway credentials");
	}

	console.log("Credentials found. KeyID:", keyId.substring(0, 5) + "***");
	console.log("Admin ObjectId:", creds.admin);

	// Generate unique receipt for idempotency
	// Format: rcpt_TIMESTAMP_RANDOM_STUDENTID
	const receiptKey = receipt || `rcpt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}_${String(student._id).slice(-8)}`;
	
	console.log("Generated receipt key:", receiptKey);

	// Check if order already exists with this receipt (idempotency)
	const existingOrder = await RazorpayTransaction.findOne({ 
		receipt: receiptKey,
		student: student._id 
	}).lean();
	
	if (existingOrder) {
		console.log("Idempotent request: returning existing order", existingOrder.orderId);
		return res.status(200).json({
			success: true,
			data: {
				order: {
					id: existingOrder.orderId,
					amount: existingOrder.amount,
					currency: existingOrder.currency,
					status: existingOrder.status,
				},
				keyId: keyId,
			},
			message: "Using existing order (idempotent request)",
		});
	}

	// Create order via Razorpay REST API
	const orderBody = {
		amount: amountPaise,
		currency,
		receipt: receiptKey,
		notes: { studentId: String(student._id), ...(notes || {}) }
	};

	console.log("Creating Razorpay order with body:", { amount: amountPaise, currency, receipt: orderBody.receipt });

	try {
		const basicAuth = Buffer.from(`${keyId}:${keySecret}`).toString("base64");
		const response = await fetch("https://api.razorpay.com/v1/orders", {
			method: "POST",
			headers: {
				Authorization: `Basic ${basicAuth}`,
				"Content-Type": "application/json",
			},
			body: JSON.stringify(orderBody),
		});

		const data = await response.json();
		console.log("Razorpay API response status:", response.status);
		console.log("Razorpay API response:", data);

		if (!response.ok) {
			console.error("Razorpay order creation failed", data);
			throw new ApiError(502, `Razorpay API error: ${data.error?.description || "Unknown error"}`);
		}

		if (!data || !data.id) {
			console.error("No order ID in response:", data);
			throw new ApiError(502, "Invalid response from Razorpay - no order ID. Please verify your Razorpay credentials are correct.");
		}

		console.log("Order created successfully:", data.id);

		// Validate order object before saving
		if (!data.id || typeof data.id !== 'string') {
			console.error("Invalid order ID format:", data.id);
			throw new ApiError(502, "Razorpay returned invalid order ID format");
		}

		// Persist transaction record using idempotent upsert to avoid duplicate insert races
		const txData = {
			student: student._id,
			amount: amountPaise,
			currency: data.currency || "INR",
			receipt: data.receipt,
			status: data.status || "created",
			rawResponse: data,
		};

		// Only add admin if it exists and is valid
		if (creds.admin) {
			txData.admin = creds.admin;
		}

		console.log("Upserting transaction with orderId:", data.id);
		const tx = await RazorpayTransaction.findOneAndUpdate(
			{ orderId: data.id },
			{ $setOnInsert: { orderId: data.id, ...txData } },
			{ upsert: true, new: true }
		);
		console.log("Transaction record upserted:", tx._id);

		// Return order details and keyId (public)
		return res.json({ success: true, data: { order: data, keyId } });
	} catch (error) {
		console.error("Error in createRazorpayOrder:", error.message);
		if (error.statusCode) {
			throw error;
		}
		throw new ApiError(502, `Payment service error: ${error.message}`);
	}
});

export const getRazorpayCredentials = asyncHandler(async (req, res) => {
	const adminId = req.user?._id;
	if (!adminId) throw new ApiError(401, "Unauthorized");

	const creds = await RazorpayCredential.findOne({ admin: adminId }).lean();
	if (!creds) {
		return res.json({ success: true, data: null });
	}

	const data = {
		keyId: cryptoUtil.decrypt(creds.keyIdEncrypted),
		// Do not return secrets by default in production; here we return masked values
		keySecret: creds.keySecretEncrypted ? "********" : null,
		webhookSecret: creds.webhookSecretEncrypted ? "********" : null,
		mode: creds.mode,
	};

	return res.json({ success: true, data });
});

export const upsertRazorpayCredentials = asyncHandler(async (req, res) => {
	const adminId = req.user?._id;
	if (!adminId) throw new ApiError(401, "Unauthorized");

	const { keyId, keySecret, webhookSecret, mode } = req.body || {};

	const payload = {};
	if (typeof keyId !== 'undefined') payload.keyIdEncrypted = keyId ? cryptoUtil.encrypt(keyId) : null;
	if (typeof keySecret !== 'undefined') payload.keySecretEncrypted = keySecret ? cryptoUtil.encrypt(keySecret) : null;
	if (typeof webhookSecret !== 'undefined') payload.webhookSecretEncrypted = webhookSecret ? cryptoUtil.encrypt(webhookSecret) : null;
	if (typeof mode !== 'undefined') payload.mode = mode;

	payload.updatedBy = adminId;

	const updated = await RazorpayCredential.findOneAndUpdate(
		{ admin: adminId },
		{ $set: payload, $setOnInsert: { admin: adminId, createdBy: adminId } },
		{ upsert: true, new: true }
	).lean();

	return res.json({ success: true, data: { id: updated._id } });
});

export const deleteRazorpayCredentials = asyncHandler(async (req, res) => {
	const adminId = req.user?._id;
	if (!adminId) throw new ApiError(401, "Unauthorized");

	const deleted = await RazorpayCredential.findOneAndDelete({ admin: adminId });
	if (!deleted) {
		return res.json({ success: true, message: "No credentials to delete" });
	}

	return res.json({ success: true, message: "Credentials deleted" });
});

export const testRazorpayCredentials = asyncHandler(async (req, res) => {
	const adminId = req.user?._id;
	if (!adminId) throw new ApiError(401, "Unauthorized");

	// Check if credentials are provided in request body (for testing before saving)
	const { keyId: bodyKeyId, keySecret: bodyKeySecret, mode } = req.body || {};
	
	let keyId, keySecret;

	// If credentials provided in body, use them (testing before save)
	if (bodyKeyId && bodyKeySecret) {
		keyId = bodyKeyId;
		keySecret = bodyKeySecret;
	} else {
		// Otherwise, fetch from database (testing after save)
		const creds = await RazorpayCredential.findOne({ admin: adminId }).lean();
		if (!creds || !creds.keyIdEncrypted || !creds.keySecretEncrypted) {
			throw new ApiError(400, "No credentials configured to test. Please enter your Key ID and Key Secret first.")
		}

		keyId = cryptoUtil.decrypt(creds.keyIdEncrypted);
		keySecret = cryptoUtil.decrypt(creds.keySecretEncrypted);
	}

	if (!keyId || !keySecret) {
		throw new ApiError(400, "Invalid credentials. Please provide both Key ID and Key Secret.")
	}

	// Attempt to create a small test order (1 INR) to validate keys
	const orderBody = { amount: 100, currency: "INR", receipt: `test_rcpt_${Date.now()}` };
	const basicAuth = Buffer.from(`${keyId}:${keySecret}`).toString("base64");
	const response = await fetch("https://api.razorpay.com/v1/orders", {
		method: "POST",
		headers: {
			Authorization: `Basic ${basicAuth}`,
			"Content-Type": "application/json",
		},
		body: JSON.stringify(orderBody),
	});

	const data = await response.json();
	if (!response.ok) {
		return res.status(502).json({ 
			success: false, 
			message: "Razorpay API error: " + (data.error?.description || data.message || "Invalid credentials"), 
			error: data 
		});
	}

	// Optionally persist the test order briefly, but we'll not store it as a live txn.
	return res.json({ success: true, message: "Credentials validated: able to create order", data });
});

export const handleRazorpayWebhook = asyncHandler(async (req, res) => {
	// req.body is a Buffer when route uses express.raw()
	const rawBody = req.body;
	const signature = req.headers["x-razorpay-signature"] || req.headers["x-razorpay-signature".toLowerCase()];

	if (!rawBody) {
		return res.status(400).send("No body");
	}

	let payload;
	try {
		payload = JSON.parse(rawBody.toString());
	} catch (err) {
		return res.status(400).send("Invalid JSON payload");
	}

	// Try to extract order_id from common webhook shapes
	const orderId = payload?.payload?.payment?.entity?.order_id || payload?.payload?.order?.entity?.id || payload?.order_id || null;

	if (!orderId) {
		// nothing to match against; acknowledge
		console.warn("Razorpay webhook received without order_id", payload?.event);
		return res.status(200).json({ success: true });
	}

	// Find transaction to retrieve admin and webhook secret
	const tx = await RazorpayTransaction.findOne({ orderId }).lean();
	if (!tx) {
		console.warn("Razorpay webhook for unknown order", orderId);
		return res.status(200).json({ success: true });
	}

	const creds = await RazorpayCredential.findOne({ admin: tx.admin }).lean();
	const webhookSecret = creds?.webhookSecretEncrypted ? cryptoUtil.decrypt(creds.webhookSecretEncrypted) : null;

	if (!webhookSecret) {
		console.warn("No webhook secret configured for admin", tx.admin);
		return res.status(400).json({ success: false, message: "Webhook secret not configured" });
	}

	// Verify signature
	const expected = crypto.createHmac("sha256", webhookSecret).update(rawBody).digest("hex");
	if (!signature || expected !== signature) {
		console.warn("Invalid Razorpay webhook signature", { expected, signature });
		return res.status(400).json({ success: false, message: "Invalid signature" });
	}

	// Process event
	const event = payload.event;
	if (event === "payment.captured" || event === "payment.authorized" || event === "payment.failed") {
		const payment = payload.payload.payment.entity;
		const paymentId = payment.id;
		const status = payment.status;

		await RazorpayTransaction.findOneAndUpdate(
			{ orderId },
			{
				$set: {
					paymentId,
					status,
					signature,
					rawResponse: payload,
				},
			}
		);
	}

	// respond 200 to acknowledge webhook
	return res.status(200).json({ success: true });
});

// Verify payment and create fee payment record
export const verifyAndRecordPayment = asyncHandler(async (req, res) => {
	const student = req.user;
	if (!student) throw new ApiError(401, "Unauthorized");

	const { orderId, paymentId, signature, feeStructureHeadId, session, notes = {} } = req.body || {};

	if (!orderId || !paymentId || !signature) {
		throw new ApiError(400, "Missing required payment details");
	}

	if (!feeStructureHeadId || !session) {
		throw new ApiError(400, "Missing fee structure details");
	}

	// Find the transaction
	const tx = await RazorpayTransaction.findOne({ orderId }).lean();
	if (!tx) {
		throw new ApiError(404, "Payment order not found");
	}

	if (String(tx.student) !== String(student._id)) {
		throw new ApiError(403, "Payment does not belong to this student");
	}

	// Get admin credentials for signature verification
	const creds = await RazorpayCredential.findOne({ admin: tx.admin }).lean();
	if (!creds || !creds.keySecretEncrypted) {
		throw new ApiError(500, "Payment gateway credentials not found");
	}

	const keySecret = cryptoUtil.decrypt(creds.keySecretEncrypted);
	if (!keySecret) {
		throw new ApiError(500, "Invalid payment gateway credentials");
	}

	// Verify signature: signature should be HMAC-SHA256 of "{orderId}|{paymentId}"
	const signatureData = `${orderId}|${paymentId}`;
	const expectedSignature = crypto
		.createHmac("sha256", keySecret)
		.update(signatureData)
		.digest("hex");

	console.log("Verifying signature:", {
		signatureData,
		providedSignature: signature,
		expectedSignature,
		match: signature === expectedSignature,
	});

	if (signature !== expectedSignature) {
		console.error("Signature mismatch - possible tampering or credentials issue");
		throw new ApiError(400, "Invalid payment signature. Payment verification failed. Please contact support if this persists.");
	}

	// Fetch payment details from Razorpay to double-check
	const keyId = cryptoUtil.decrypt(creds.keyIdEncrypted);
	if (!keyId) {
		throw new ApiError(500, "Invalid payment gateway credentials");
	}

	const basicAuth = Buffer.from(`${keyId}:${keySecret}`).toString("base64");
	const paymentResponse = await fetch(
		`https://api.razorpay.com/v1/payments/${paymentId}`,
		{
			method: "GET",
			headers: {
				Authorization: `Basic ${basicAuth}`,
				"Content-Type": "application/json",
			},
		}
	);

	const paymentData = await paymentResponse.json();
	if (!paymentResponse.ok) {
		console.error("Failed to fetch payment details from Razorpay", paymentData);
		throw new ApiError(502, "Unable to verify payment with Razorpay");
	}

	// Verify the payment status and amount
	if (paymentData.status !== "captured") {
		throw new ApiError(400, "Payment status is not captured");
	}

	if (paymentData.amount !== tx.amount) {
		throw new ApiError(400, "Payment amount mismatch");
	}

	if (paymentData.order_id !== orderId) {
		throw new ApiError(400, "Order ID mismatch");
	}

	// Generate a unique fee payment ID
	const feePaymentId = `FP_${Date.now()}_${paymentId}`;

	// Create fee payment record
	const feePayment = await FeePayment.create({
		docType: "payment",
		student: student._id,
		id: feePaymentId,
		enrollmentNo: student.enrollmentNo,
		rollNo: student.rollNo,
		program: student.branch,
		semester: student.semester,
		session,
		studentName: `${student.firstName} ${student.lastName}`.trim(),
		feeHead: feeStructureHeadId,
		transactionId: paymentId,
		transactionDate: new Date(paymentData.created_at * 1000),
		amount: paymentData.amount / 100, // Convert from paise to rupees
		paymentMode: "Razorpay",
		transactionStatus: "success",
		razorpayData: {
			orderId,
			paymentId,
			signature,
		},
	});

	// Update transaction record
	await RazorpayTransaction.findByIdAndUpdate(tx._id, {
		$set: {
			paymentId,
			status: "captured",
			signature,
		},
	});

	return res.status(201).json({
		success: true,
		data: {
			feePayment: {
				id: feePayment.id,
				session: feePayment.session,
				feeHead: feePayment.feeHead,
				amount: feePayment.amount,
				transactionId: feePayment.transactionId,
				transactionStatus: feePayment.transactionStatus,
				transactionDate: feePayment.transactionDate,
				createdAt: feePayment.createdAt,
			},
			receipt: {
				orderId,
				paymentId,
				amount: paymentData.amount / 100,
				currency: paymentData.currency,
				status: paymentData.status,
			},
		},
		message: "Payment verified and recorded successfully",
	});
});

// Get transaction status by order ID
export const getTransactionStatus = asyncHandler(async (req, res) => {
	const student = req.user;
	if (!student) throw new ApiError(401, "Unauthorized");

	const { orderId } = req.query;
	if (!orderId) {
		throw new ApiError(400, "Order ID is required");
	}

	const tx = await RazorpayTransaction.findOne({ orderId }).lean();
	if (!tx) {
		throw new ApiError(404, "Transaction not found");
	}

	if (String(tx.student) !== String(student._id)) {
		throw new ApiError(403, "You do not have access to this transaction");
	}

	return res.json({
		success: true,
		data: {
			orderId: tx.orderId,
			paymentId: tx.paymentId,
			status: tx.status,
			amount: tx.amount,
			currency: tx.currency,
			createdAt: tx.createdAt,
		},
	});
});

// List student's fee payments
export const getStudentFeePayments = asyncHandler(async (req, res) => {
	const student = req.user;
	if (!student) throw new ApiError(401, "Unauthorized");

	const payments = await FeePayment.find({
		student: student._id,
		docType: "payment",
	})
		.sort({ createdAt: -1 })
		.lean();

	return res.json({
		success: true,
		data: payments.map((p) => ({
			id: p.id,
			session: p.session,
			feeHead: p.feeHead,
			amount: p.amount,
			transactionId: p.transactionId,
			transactionDate: p.transactionDate,
			transactionStatus: p.transactionStatus,
			createdAt: p.createdAt,
		})),
	});
});



















































































































































































































































