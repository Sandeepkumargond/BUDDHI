import { Router } from "express";
import {
	getRazorpayCredentials,
	upsertRazorpayCredentials,
	deleteRazorpayCredentials,
	testRazorpayCredentials,
	createRazorpayOrder,
	handleRazorpayWebhook,
	verifyAndRecordPayment,
	getTransactionStatus,
	getStudentFeePayments,
	getAllFeePayments,
} from "../controllers/razorpay.controller.js";
import { authenticateAdmin } from "../middlewares/admin.middleware.js";
import { authenticateStudent } from "../middlewares/student.middleware.js";

const router = Router();

// Admin routes to manage Razorpay credentials
router.route('/credentials').get(
	authenticateAdmin,
	getRazorpayCredentials
);

router.route('/credentials').post(
	authenticateAdmin,
	upsertRazorpayCredentials
);

router.route('/credentials').delete(
	authenticateAdmin,
	deleteRazorpayCredentials
);

router.route('/credentials/test').post(
	authenticateAdmin,
	testRazorpayCredentials
);

// Webhook route - use raw body parser so signature can be verified
import express from "express";
router.post('/webhook', express.raw({ type: 'application/json' }), handleRazorpayWebhook);

// Student-facing endpoint to create an order
router.route('/order').post(
	authenticateStudent,
	createRazorpayOrder
);

// Student-facing endpoints to verify and record payment
router.route('/verify').post(
	authenticateStudent,
	verifyAndRecordPayment
);

router.route('/transaction-status').get(
	authenticateStudent,
	getTransactionStatus
);

router.route('/payments').get(
	authenticateStudent,
	getStudentFeePayments
);

// Admin route to get all payments
router.route('/admin/all-payments').get(
	authenticateAdmin,
	getAllFeePayments
);

export default router;































































