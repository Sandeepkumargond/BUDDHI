import mongoose, { Schema } from "mongoose";

const feePaymentSchema = new Schema(
  {
    docType: {
      type: String,
      enum: ["payment", "structure"],
      default: "payment",
      index: true,
    },
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Student",
      required: function () {
        return this.docType === "payment";
      },
      index: true,
    },
    id: {
      type: String,
      required: true,
      unique: true,
      index: true,
      trim: true,
    },
    enrollmentNo: {
      type: Number,
      required: function () {
        return this.docType === "payment";
      },
      index: true,
    },
    rollNo: {
      type: Number,
      required: function () {
        return this.docType === "payment";
      },
      index: true,
    },
    session: {
      type: String,
      required: true,
      trim: true,
    },
    studentName: {
      type: String,
      required: function () {
        return this.docType === "payment";
      },
      trim: true,
    },
    feeHead: {
      type: String,
      required: function () {
        return this.docType === "payment";
      },
      trim: true,
    },
    transactionId: {
      type: String,
      required: function () {
        return this.docType === "payment";
      },
      index: true,
      trim: true,
    },
    transactionDate: {
      type: Date,
      required: function () {
        return this.docType === "payment";
      },
    },
    amount: {
      type: Number,
      required: function () {
        return this.docType === "payment";
      },
      min: 0,
    },
    paymentMode: {
      type: String,
      required: function () {
        return this.docType === "payment";
      },
      enum: ["cash", "card", "upi", "netbanking", "cheque", "bank-transfer", "wallet", "Razorpay", "other"],
      lowercase: false,
      trim: true,
    },
    transactionStatus: {
      type: String,
      required: function () {
        return this.docType === "payment";
      },
      enum: ["pending", "success", "failed", "refunded"],
      lowercase: true,
      trim: true,
    },
    // Receipt fields for payments
    receiptNumber: { type: String, index: true },
    generatedAt: { type: Date },
    bankName: {
      type: String,
      trim: true,
      default: null,
    },
    imageUrl: {
      type: String,
      default: null,
      trim: true,
    },
    razorpayData: {
      orderId: { type: String, default: null },
      paymentId: { type: String, default: null },
      signature: { type: String, default: null },
    },

    // Fields for fee structure (docType === 'structure')
    program: {
      type: String,
      enum: ['B.Tech', 'M.Tech', 'PhD', 'MBA', 'MCA', 'Dual Degree', 'BCA'],
    },
    branch: {
      type: String,
      enum: ['CSE', 'ECE', 'ME', 'CE', 'EE', 'Architecture', 'Chemical', 'Biotech', 'IT'],
      index: true,
    },
    semester: {
      type: Number,
      index: true,
    },
    category: {
      type: String,
      enum: ['sc', 'st', 'obc', 'general'],
      lowercase: true,
      index: true,
    },
    published: {
      type: Boolean,
      default: false,
      index: true,
    },
    feeHeads: [
      new Schema(
        {
          name: { type: String, required: true, trim: true },
          amount: { type: Number, required: true, min: 0 },
        },
        { _id: false }
      ),
    ],
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Admin',
    },
  },
  { timestamps: true }
);

// Prevent duplicate fee entries for the same student, session, and head (only for payments)
feePaymentSchema.index(
  { student: 1, session: 1, feeHead: 1 },
  { unique: true, partialFilterExpression: { docType: 'payment' } }
);

// Index for querying structures by scope (not unique)
feePaymentSchema.index(
  { branch: 1, semester: 1, session: 1, category: 1 },
  { partialFilterExpression: { docType: 'structure' } }
);

// Unique transactionId only for payment docs
feePaymentSchema.index(
  { transactionId: 1 },
  {
    name: 'transactionId_1_payment_unique',
    unique: true,
    partialFilterExpression: { docType: 'payment', transactionId: { $type: 'string' } }
  }
);

export const FeePayment = mongoose.model("FeePayment", feePaymentSchema);
