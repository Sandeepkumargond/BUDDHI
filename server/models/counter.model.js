import mongoose, { Schema } from "mongoose";

const counterSchema = new Schema(
    {
        _id: {
            type: String,   // e.g. "collegeReg_2025", "email_counter", etc.
            required: true,
        },
        seq: {
            type: Number,
            default: 0,
        },
    },
    { timestamps: false }
);

export const Counter = mongoose.model("Counter", counterSchema);