import mongoose from "mongoose";

const feedbackSchema = new mongoose.Schema(
  {
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Student",
      required: true,
    },
    facultyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Faculty",
      required: true,
    },
    courseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
      required: true,
    },
    semester: {
      type: Number,
      required: true,
    },
    academicYear: {
      type: String,
      required: true,
    },
    ratings: [
      {
        questionId: Number,
        question: String,
        rating: {
          type: Number,
          min: 1,
          max: 5,
          required: true,
        },
      },
    ],
    averageRating: {
      type: Number,
      min: 1,
      max: 5,
      default: null,
    },
    comments: {
      type: String,
      default: "",
    },
  },
  { timestamps: true }
);

// Index for faster queries
feedbackSchema.index({ facultyId: 1, academicYear: 1 });
feedbackSchema.index({ studentId: 1, courseId: 1 });

export const Feedback =
  mongoose.models.Feedback || mongoose.model("Feedback", feedbackSchema);
