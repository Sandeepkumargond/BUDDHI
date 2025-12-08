import express from 'express';
import dotenv from 'dotenv';
import connectDB from './db/index.js';
import cors from 'cors';
import cookieParser from 'cookie-parser';

dotenv.config();

const app = express();

const PORT = process.env.PORT || 5000;

// Allow multiple origins via comma-separated env; default to localhost:3000 for dev
const allowedOrigins = (process.env.CORS_ORIGIN || 'http://localhost:3000')
    .split(',')
    .map(o => o.trim())
    .filter(Boolean);

app.use(cors({
        origin: allowedOrigins,
        credentials: true,
}));

app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
app.use(express.static("public"));
app.use(cookieParser());

import healthCheckRoutes from "./routes/healthCheck.route.js";
import superAdminRoutes from "./routes/superAdmin.route.js";
import adminRoutes from "./routes/admin.route.js";
import studentRoutes from "./routes/student.route.js";
import facultyRoutes from "./routes/faculty.route.js";
import subAdminRoutes from "./routes/subAdmin.route.js";
import gradeCardRoutes from "./routes/gradeCard.route.js";
import noticeRoutes from "./routes/notice.route.js";
import studyMaterialRoutes from "./routes/studyMaterial.route.js";
import hostelRoutes from "./routes/hostel.route.js";
import razorpayRoutes from "./routes/razorpay.route.js";
import feedbackFormRoutes from "./routes/feedbackForm.route.js";
import alumniRoutes from "./routes/alumni.route.js";
import leaveRoutes from "./routes/leave.route.js";
import scholarshipRoutes from "./routes/scholarship.route.js";
import bonafideRoutes from "./routes/bonafide.route.js";
import ApiError from "./utils/ApiError.js";

// route declarations
app.use("/api/v1/health", healthCheckRoutes);
app.use("/api/v1/super-admin", superAdminRoutes);
app.use("/api/v1/admin", adminRoutes);
app.use("/api/v1/student", studentRoutes);
app.use("/api/v1/faculty", facultyRoutes);
app.use("/api/v1/sub-admin", subAdminRoutes);
app.use("/api/v1/grades", gradeCardRoutes);
app.use("/api/v1/notices", noticeRoutes);
app.use("/api/v1/study-materials", studyMaterialRoutes);
app.use("/api/v1/hostel", hostelRoutes);
app.use("/api/v1/razorpay", razorpayRoutes);
app.use("/api/v1/feedback", feedbackFormRoutes);
app.use("/api/v1/alumni", alumniRoutes);
app.use("/api/v1/leaves", leaveRoutes);
app.use("/api/v1/scholarships", scholarshipRoutes);
app.use("/api/v1/bonafide", bonafideRoutes);

// Centralized error handler to ensure JSON responses instead of default HTML
app.use((err, req, res, next) => {
    console.error("Error:", err);
    if (err instanceof ApiError) {
        return res.status(err.statusCode).json({
            success: false,
            message: err.message,
            errors: err.errors || [],
            data: err.data || null
        });
    }
    return res.status(err.statusCode && Number.isInteger(err.statusCode) ? err.statusCode : 500).json({
        success: false,
        message: err.message || "Internal Server Error",
        errors: [],
        data: null
    });
});

connectDB().then(() => {
    app.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`);
    });
}).catch((error) => {
    console.error("Failed to start server:", error.message);
});