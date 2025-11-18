import mongoose, { Schema } from "mongoose";

const feePaymentSchema = new Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Student",
      required: true,
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
      required: true,
      index: true,
    },
    rollNo: {
      type: Number,
      required: true,
      index: true,
    },
    session: {
      type: String,
      required: true,
      trim: true,
    },
    studentName: {
      type: String,
      required: true,
      trim: true,
    },
    feeHead: {
      type: String,
      required: true,
      trim: true,
    },
    transactionId: {
      type: String,
      required: true,
      unique: true,
      index: true,
      trim: true,
    },
    transactionDate: {
      type: Date,
      required: true,
    },
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
    paymentMode: {
      type: String,
      required: true,
      enum: ["cash", "card", "upi", "netbanking", "cheque", "bank-transfer", "wallet", "other"],
      lowercase: true,
      trim: true,
    },
    transactionStatus: {
      type: String,
      required: true,
      enum: ["pending", "success", "failed", "refunded"],
      lowercase: true,
      trim: true,
    },
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
  },
  { timestamps: true }
);

// Prevent duplicate fee entries for the same student, session, and head
feePaymentSchema.index({ student: 1, session: 1, feeHead: 1 }, { unique: true });

export const FeePayment = mongoose.model("FeePayment", feePaymentSchema);
