import asyncHandler from "../utils/asyncHandler.js";
import ApiError from "../utils/ApiError.js";
import { RazorpayCredential } from "../models/razorpayCredential.model.js";
import cryptoUtil from "../utils/cryptoUtil.js";
import { RazorpayTransaction } from "../models/razorpayTransaction.model.js";
import crypto from "crypto";

// Create Razorpay Order (used by students to initiate payment)
export const createRazorpayOrder = asyncHandler(async (req, res) => {
	const student = req.user;
	if (!student) throw new ApiError(401, "Unauthorized");

	const { amount, currency = "INR", receipt, notes = {}, adminId } = req.body || {};

	if (!amount || isNaN(amount) || Number(amount) <= 0) {
		throw new ApiError(400, "Invalid amount")
	}

	// Amount should be in paise for Razorpay
	const amountPaise = Math.round(Number(amount) * 100);

	// Find credentials: prefer adminId if provided, else any credential
	let creds;
	if (adminId) {
		creds = await RazorpayCredential.findOne({ admin: adminId }).lean();
	} else {
		creds = await RazorpayCredential.findOne({}).lean();
	}

	if (!creds || !creds.keyIdEncrypted || !creds.keySecretEncrypted) {
		throw new ApiError(500, "Payment gateway credentials not configured")
	}

	const keyId = cryptoUtil.decrypt(creds.keyIdEncrypted);
	const keySecret = cryptoUtil.decrypt(creds.keySecretEncrypted);
	if (!keyId || !keySecret) throw new ApiError(500, "Invalid payment gateway credentials")

	// Create order via Razorpay REST API
	const orderBody = {
		amount: amountPaise,
		currency,
		receipt: receipt || `rcpt_${Date.now()}_${student._id}`,
		notes: { studentId: String(student._id), ...(notes || {}) }
	};

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
		console.error("Razorpay order creation failed", data);
		throw new ApiError(502, "Failed to create payment order")
	}

	// Persist transaction record
	const tx = await RazorpayTransaction.create({
		student: student._id,
		admin: creds.admin,
		orderId: data.id,
		amount: amountPaise,
		currency: data.currency,
		receipt: data.receipt,
		status: data.status || "created",
		rawResponse: data,
	});

	// Return order details and keyId (public)
	return res.json({ success: true, data: { order: data, keyId } });
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

	const creds = await RazorpayCredential.findOne({ admin: adminId }).lean();
	if (!creds || !creds.keyIdEncrypted || !creds.keySecretEncrypted) {
		throw new ApiError(400, "No credentials configured to test")
	}

	const keyId = cryptoUtil.decrypt(creds.keyIdEncrypted);
	const keySecret = cryptoUtil.decrypt(creds.keySecretEncrypted);
	if (!keyId || !keySecret) throw new ApiError(500, "Invalid payment gateway credentials")

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
		return res.status(502).json({ success: false, message: "Razorpay API error", error: data });
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



















































































































































































































































