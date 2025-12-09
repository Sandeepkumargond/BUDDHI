import mongoose, { Schema } from "mongoose";

const scholarshipSchema = new Schema(
  {
    student: {
      type: Schema.Types.ObjectId,
      ref: "Student",
      required: true,
      index: true,
    },
    scholarshipName: {
      type: String,
      required: true,
      trim: true,
    },
    scholarshipType: {
      type: String,
      enum: ["merit", "need", "sports", "research", "alumni", "other"],
      default: "merit",
    },
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
    duration: {
      type: String,
      trim: true,
    },
    statement: {
      type: String,
      trim: true,
    },
    documentUrl: {
      type: String,
      trim: true,
    },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
      index: true,
    },
    adminRemarks: {
      type: String,
      trim: true,
    },
    reviewedBy: {
      type: Schema.Types.ObjectId,
      ref: "Admin",
    },
    reviewedAt: {
      type: Date,
    },
  },
  { timestamps: true }
);

scholarshipSchema.index({ student: 1, status: 1 });

export const Scholarship = mongoose.model("Scholarship", scholarshipSchema);
