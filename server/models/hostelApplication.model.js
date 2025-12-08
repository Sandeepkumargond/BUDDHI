import mongoose from "mongoose";

const choiceSchema = new mongoose.Schema(
  {
    hostelName: { type: String, required: true },
    roomNumber: { type: String },
    floor: { type: Number },
    priority: { type: Number, default: 1 },
  },
  { _id: false }
);

const hostelApplicationSchema = new mongoose.Schema(
  {
    student: { type: mongoose.Schema.Types.ObjectId, ref: "Student" },
    studentId: { type: String, required: true },
    studentName: { type: String, required: true },
    email: { type: String },
    phone: { type: String },
    course: { type: String },
    semester: { type: String },
    cgpa: { type: Number },
    roomType: { type: String, enum: ["Single", "Shared", "Triple", "Double"], default: "Shared" },
    reason: { type: String },
    emergencyContact: { type: String },
    parentName: { type: String },
    address: { type: String },
    choices: { type: [choiceSchema], default: [] },
    status: { type: String, enum: ["pending", "approved", "rejected", "removed"], default: "pending" },
    rejectionReason: { type: String },
    allottedHostel: { type: String },
    allottedRoom: { type: String },
    allocationType: { type: String, enum: ["auto", "manual"], default: "auto" },
    requestDate: { type: Date, default: Date.now },
    allottedDate: { type: Date },
  },
  { timestamps: true }
);

export const HostelApplication = mongoose.model("HostelApplication", hostelApplicationSchema);
