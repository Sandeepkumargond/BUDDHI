import mongoose, { Schema } from "mongoose";

const departmentSchema = new Schema(
  {
    code: { type: String, required: true, unique: true, trim: true },
    name: { type: String, required: true, trim: true },
    description: { type: String, default: "", trim: true },
    hod: { type: mongoose.Schema.Types.ObjectId, ref: "Faculty", default: null },
    established: { type: Number, default: 2000 },
    status: { type: String, default: "Active" },
  },
  { timestamps: true }
);

export const Department = mongoose.model("Department", departmentSchema);
