import mongoose, { Schema } from "mongoose";

const riskPredictionSchema = new Schema(
    {
        student: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Student',
            required: true,
            index: true
        },
        enrollmentNo: {
            type: String,
            required: true,
            index: true
        },
        risk_level: {
            type: String,
            enum: ['no_risk', 'moderate_risk', 'on_the_verge_of_drop', 'critical'],
            required: true
        },
        is_at_risk: {
            type: Boolean,
            required: true
        },
        prediction_date: {
            type: Date,
            default: Date.now,
            index: true
        },
        input_data: {
            cgpa: Number,
            attendance_pct: Number,
            books_issued: Number,
            book_genre_preference: String,
            fees_status: String
        }
    },
    { timestamps: true }
);

// Index for querying latest prediction for a student
riskPredictionSchema.index({ student: 1, prediction_date: -1 });

export const RiskPrediction = mongoose.model("RiskPrediction", riskPredictionSchema);
