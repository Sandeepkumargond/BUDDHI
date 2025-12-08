import mongoose, { Schema } from "mongoose";

const razorpayTransactionSchema = new Schema(
  {
    student: { type: mongoose.Schema.Types.ObjectId, ref: "Student", index: true },
    admin: { type: mongoose.Schema.Types.ObjectId, ref: "Admin", index: true },
    orderId: { type: String, index: true, required: true, unique: true },
    paymentId: { type: String, index: true, default: null },
    signature: { type: String, default: null },
    amount: { type: Number, required: true }, // stored in paise
    currency: { type: String, default: "INR" },
    receipt: { type: String },
    status: { type: String, enum: ["created", "authorized", "captured", "failed", "refunded"], default: "created" },
    rawResponse: { type: Schema.Types.Mixed },
    notes: { type: Schema.Types.Mixed },
  },
  { timestamps: true }
);

export const RazorpayTransaction = mongoose.model("RazorpayTransaction", razorpayTransactionSchema);



























































































































