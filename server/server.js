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

// route declarations
app.use("/api/v1/health", healthCheckRoutes);
app.use("/api/v1/super-admin", superAdminRoutes);
app.use("/api/v1/admin", adminRoutes);
app.use("/api/v1/student", studentRoutes);
app.use("/api/v1/faculty", facultyRoutes);
app.use("/api/v1/sub-admin", subAdminRoutes);

connectDB().then(() => {
    app.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`);
    });
}).catch((error) => {
    console.error("Failed to start server:", error.message);
});