import mongoose from "mongoose";

const courseSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    code: { type: String, required: true, trim: true },
    credits: { type: Number, required: true, min: 0 },
    semester: { type: Number, required: true, min: 1 },
    departmentId: { type: Number, required: true },
  },
  { timestamps: true }
);

// Non-unique index for faster queries; allow multiple courses with same code in a department
courseSchema.index({ departmentId: 1, code: 1 });

export const Course = mongoose.model("Course", courseSchema);
