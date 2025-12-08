import mongoose from "mongoose";

const complaintSchema = new mongoose.Schema(
  {
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Student",
      required: true,
    },
    studentName: {
      type: String,
      required: true,
    },
    studentEmail: {
      type: String,
      required: true,
    },
    hostelId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Hostel",
    },
    hostelName: {
      type: String,
    },
    roomNumber: {
      type: String,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    category: {
      type: String,
      enum: ["Maintenance", "Cleanliness", "Noise", "Roommate", "Safety", "Other"],
      default: "Other",
    },
    priority: {
      type: String,
      enum: ["Low", "Medium", "High", "Urgent"],
      default: "Medium",
    },
    status: {
      type: String,
      enum: ["Pending", "In Progress", "Resolved", "Closed"],
      default: "Pending",
    },
    adminNotes: {
      type: String,
      default: "",
    },
    resolvedDate: {
      type: Date,
    },
    attachments: [
      {
        url: String,
        filename: String,
      },
    ],
  },
  { timestamps: true }
);

export const HostelComplaint = mongoose.model("HostelComplaint", complaintSchema);
