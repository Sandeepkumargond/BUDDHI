import mongoose, { Schema } from "mongoose";

const studentSnapshotSchema = new Schema({
  enrollmentNo: Number,
  rollNo: Number,
  firstName: String,
  lastName: String,
  email: String,
  personalMail: String,
  program: String,
  branch: String,
  semester: Number,
  section: String,
  batch: String,
}, { _id: false });

const bonafideSchema = new Schema({
  student: { type: Schema.Types.ObjectId, ref: "Student", required: true, index: true },
  purpose: { type: String, trim: true },
  reason: { type: String, required: true, trim: true },
  status: { type: String, enum: ["pending", "approved", "rejected"], default: "pending", index: true },
  rejectionReason: { type: String, trim: true },
  documentUrl: { type: String, trim: true },
  documentFileId: { type: String, trim: true },
  pdfUrl: { type: String, trim: true },
  pdfFileId: { type: String, trim: true },
  studentSnapshot: studentSnapshotSchema,
  reviewedBy: { type: Schema.Types.ObjectId, ref: "Admin" },
  reviewedAt: { type: Date },
}, { timestamps: true });

bonafideSchema.index({ student: 1, status: 1 });

export const Bonafide = mongoose.model("Bonafide", bonafideSchema);
