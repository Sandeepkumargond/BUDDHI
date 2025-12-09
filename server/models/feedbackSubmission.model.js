import mongoose from "mongoose";

const feedbackSubmissionSchema = new mongoose.Schema(
  {
    formId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "FeedbackForm",
      required: true,
    },
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Student",
      required: true,
    },
    courseId: {
      type: String, // Store as string from composite ID, can also be ObjectId
      default: null,
    },
    facultyId: {
      type: String, // Store as string from composite ID, can also be ObjectId
      default: null,
    },
    responses: [
      {
        questionId: {
          type: Number,
          required: true,
        },
        answer: {
          type: mongoose.Schema.Types.Mixed,
          required: true,
        },
      },
    ],
    submittedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

// Compound indexes to prevent duplicate submissions
// For forms with course-faculty info (replicated forms)
feedbackSubmissionSchema.index({ formId: 1, studentId: 1, courseId: 1, facultyId: 1 });
// For forms without course-faculty info (regular forms)
feedbackSubmissionSchema.index({ formId: 1, studentId: 1 });

export const FeedbackSubmission = mongoose.model(
  "FeedbackSubmission",
  feedbackSubmissionSchema
);
