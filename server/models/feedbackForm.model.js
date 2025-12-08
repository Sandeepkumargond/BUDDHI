import mongoose from "mongoose";

const feedbackFormSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      default: "",
    },
    department: {
      type: String,
      required: true,
    },
    branch: {
      type: String,
      default: null,
    },
    batch: {
      type: String,
      required: true,
    },
    semester: {
      type: Number,
      required: true,
    },
    section: {
      type: String,
      default: null,
    },
    academicYear: {
      type: String,
      required: true,
    },
    startDate: {
      type: Date,
      required: true,
    },
    endDate: {
      type: Date,
      required: true,
    },
    courseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
      default: null,
    },
    courseName: {
      type: String,
      default: null,
    },
    courseCode: {
      type: String,
      default: null,
    },
    facultyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Faculty",
      default: null,
    },
    facultyName: {
      type: String,
      default: null,
    },
    questions: [
      {
        questionId: Number,
        question: String,
        type: {
          type: String,
          enum: ["rating", "text"],
          default: "rating",
        },
      },
    ],
    status: {
      type: String,
      enum: ["draft", "active", "closed"],
      default: "draft",
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Admin",
    },
  },
  { timestamps: true }
);

// Index for faster queries
feedbackFormSchema.index({ department: 1, batch: 1, semester: 1, academicYear: 1 });
feedbackFormSchema.index({ status: 1, academicYear: 1 });
feedbackFormSchema.index({ courseId: 1, facultyId: 1, semester: 1, section: 1 });

export const FeedbackForm =
  mongoose.models.FeedbackForm || mongoose.model("FeedbackForm", feedbackFormSchema);
