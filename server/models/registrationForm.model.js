import mongoose, { Schema } from "mongoose";

// Unified model for both admin forms and student submissions
// Use docType to distinguish: 'form' for admin-created forms, 'submission' for student registrations
const registrationSchema = new Schema(
  {
    // Common / form fields
    docType: { type: String, enum: ["form", "submission"], default: "form", index: true },
    title: { type: String, trim: true },
    departmentId: { type: Number, default: null },
    departmentCode: { type: String, trim: true },
    semester: { type: Number, required: true, min: 1 },
    session: { type: String, required: true, trim: true },
    courses: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Course",
      },
    ],
    attachedCourses: [
      {
        code: { type: String, trim: true },
        name: { type: String, trim: true },
        credits: { type: Number, default: 0 },
      },
    ],

    // Form-only fields
    published: { type: Boolean, default: false },
    opensAt: { type: Date, default: null },
    closesAt: { type: Date, default: null },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "Admin", default: null },

    // Submission-only fields
    form: { type: mongoose.Schema.Types.ObjectId, ref: "Registration", default: null }, // reference to form doc in same collection
    student: { type: mongoose.Schema.Types.ObjectId, ref: "Student", default: null },
    status: { type: String, enum: ["submitted"], default: undefined },
    submittedAt: { type: Date, default: undefined },
    // Snapshot of form title for submissions to survive form deletion
    formTitle: { type: String, trim: true, default: undefined },
  },
  { timestamps: true }
);

// Indexes
registrationSchema.index(
  { departmentId: 1, semester: 1, session: 1, published: 1 },
  { partialFilterExpression: { docType: "form" } }
);

registrationSchema.index(
  { form: 1, student: 1 },
  { unique: true, partialFilterExpression: { docType: "submission" } }
);

// Single underlying collection/model name
const Registration = mongoose.models.Registration || mongoose.model("Registration", registrationSchema);

// Export aliases to keep existing imports working
export const RegistrationForm = Registration;
export const StudentRegistration = Registration;
