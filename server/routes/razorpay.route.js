import { Router } from "express";
import {
	getRazorpayCredentials,
	upsertRazorpayCredentials,
	deleteRazorpayCredentials,
	testRazorpayCredentials,
	createRazorpayOrder,
	handleRazorpayWebhook,
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

export default router;































































