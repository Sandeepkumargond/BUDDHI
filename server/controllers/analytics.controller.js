import asyncHandler from "../utils/asyncHandler.js";
import ApiResponse from "../utils/ApiResponse.js";
import ApiError from "../utils/ApiError.js";
import { Student } from "../models/student.model.js";
import { GradeCard } from "../models/gradeCard.model.js";
import { FeePayment } from "../models/feePayment.model.js";
import { RiskPrediction } from "../models/riskPrediction.model.js";
import axios from "axios";
import axiosRetry from "axios-retry";

// Configure axios to retry on failures (for Render cold starts)
axiosRetry(axios, {
    retries: 3, // Retry up to 3 times
    retryDelay: (retryCount) => {
        return retryCount * 5000; // Wait 5s, 10s, 15s between retries
    },
    retryCondition: (error) => {
        // Retry on network errors or 5xx server errors
        return axiosRetry.isNetworkOrIdempotentRequestError(error) ||
            (error.response && error.response.status >= 500);
    }
});

// Helper to calculate aggregate CGPA from GradeCards
const calculateAggregateCGPA = async (studentId) => {
    const gradeCards = await GradeCard.find({ student: studentId });
    if (!gradeCards.length) return 7.0; // Default average if no records

    // Logic: Average of SGPA across semesters
    const totalSgpa = gradeCards.reduce((sum, card) => sum + (card.sgpa || 0), 0);
    return parseFloat((totalSgpa / gradeCards.length).toFixed(2));
};

// Helper to get Fees Status
const getFeesStatus = async (studentId) => {
    // Check for any pending payments or dues
    // Simplify: If last payment was successful -> Paid, else Pending
    const lastPayment = await FeePayment.findOne({ student: studentId }).sort({ createdAt: -1 });
    if (!lastPayment) return "Pending";
    return lastPayment.status === "captured" ? "Paid" : "Pending";
};

// Helper to estimate Attendance (Mock logic if real attendance model isn't populated efficiently yet)
// In real prod, query Attendance model. For now, referencing the key requirement: "fetch actual data"
// If Attendance model exists, use it. Based on file list, `attendance.model.js` exists.
import { Attendance } from "../models/attendance.model.js";
const getAttendancePercentage = async (studentId) => {
    // Count 'Present' vs Total days
    const attendanceRecords = await Attendance.find({ student: studentId });
    if (!attendanceRecords.length) return 75; // Default safe value

    const presentCount = attendanceRecords.filter(r => r.status === 'Present').length;
    const total = attendanceRecords.length;
    return Math.round((presentCount / total) * 100);
};


export const getStudentRiskAnalytics = asyncHandler(async (req, res) => {
    // 1. Fetch All Students (or filter by batch/branch if needed)
    const students = await Student.find({}).select("enrollmentNo firstName lastName");
    // Optimization: limit to 50 or pagination in future if slow

    const mlPayload = [];
    const studentMap = {}; // Map enrollmentNo to Student for joining later

    // 2. Aggregate Data for each student
    for (const student of students) {
        studentMap[student.enrollmentNo] = student;

        const cgpa = await calculateAggregateCGPA(student._id);
        const attendancePct = await getAttendancePercentage(student._id);
        const feesStatus = await getFeesStatus(student._id);

        // Mocking Book Data/Genre as it might not be in a simple model yet, 
        // or check bookIssued ref. Using intelligent defaults based on real fields if possible.
        // `bookIssued` is in Student model.
        const booksIssuedCount = student.bookIssued ? student.bookIssued.length : 0;

        // Model expects: CGPA, Attendance_Pct, Books_Issued, Book_Genre_Preference, Fees_Status, Enrollment_ID
        mlPayload.push({
            CGPA: cgpa,
            Attendance_Pct: attendancePct,
            Books_Issued: booksIssuedCount,
            Book_Genre_Preference: "Technical", // Default/Placeholder as genre might not be tracked in `BookIssue` model easily without deep population
            Fees_Status: feesStatus,
            Enrollment_ID: String(student.enrollmentNo)
        });
    }

    if (mlPayload.length === 0) {
        return res.status(200).json(new ApiResponse(200, [], "No students found for analysis"));
    }

    // 3. Call ML Service
    const ML_SERVICE_URL = process.env.ML_SERVICE_URL || 'http://localhost:8000';

    // console.log(`[INFO] Calling ML Service at: ${ML_SERVICE_URL}/predict_risk`);
    // console.log(`[INFO] Payload size: ${mlPayload.length} students`);
    // console.log(`[INFO] Retry policy: 3 retries with 5s/10s/15s delays`);

    try {
        const mlResponse = await axios.post(`${ML_SERVICE_URL}/predict_risk`, mlPayload, {
            headers: {
                'Content-Type': 'application/json'
            },
            timeout: 90000 // 90 second timeout for cold starts
        });
        const predictions = mlResponse.data; // List of { Enrollment_ID, risk_level, is_at_risk }

        // 4. Save predictions to database
        // console.log(`[DEBUG] Starting to save ${predictions.length} predictions to database...`);
        const savedPredictions = [];
        for (const pred of predictions) {
            const studentInfo = studentMap[pred.Enrollment_ID];
            if (!studentInfo) {
                console.warn(`[WARN] No student found for Enrollment ID: ${pred.Enrollment_ID}`);
                continue;
            }

            const inputData = mlPayload.find(p => p.Enrollment_ID === pred.Enrollment_ID);

            // console.log(`[DEBUG] Saving prediction for ${studentInfo.firstName} ${studentInfo.lastName}`);
            try {
                const saved = await RiskPrediction.create({
                    student: studentInfo._id,
                    enrollmentNo: pred.Enrollment_ID,
                    risk_level: pred.risk_level,
                    is_at_risk: pred.is_at_risk,
                    input_data: {
                        cgpa: inputData?.CGPA,
                        attendance_pct: inputData?.Attendance_Pct,
                        books_issued: inputData?.Books_Issued,
                        book_genre_preference: inputData?.Book_Genre_Preference,
                        fees_status: inputData?.Fees_Status
                    }
                });
                savedPredictions.push(saved);
                // console.log(`[DEBUG] ✓ Saved prediction for ${pred.Enrollment_ID}`);
            } catch (saveError) {
                console.error(`[ERROR] Failed to save prediction for ${pred.Enrollment_ID}:`, saveError.message);
            }
        }

        // console.log(`[SUCCESS] Saved ${savedPredictions.length}/${predictions.length} predictions to database`);

        // 5. Merge ML result with Student Details
        const finalResult = predictions.map(pred => {
            const studentInfo = studentMap[pred.Enrollment_ID];
            return {
                enrollmentNo: pred.Enrollment_ID,
                name: studentInfo ? `${studentInfo.firstName} ${studentInfo.lastName}` : "Unknown",
                risk_level: pred.risk_level,
                is_at_risk: pred.is_at_risk,
                details: { // Return input factors for UI tooltips
                    cgpa: mlPayload.find(p => p.Enrollment_ID === pred.Enrollment_ID)?.CGPA
                }
            };
        });

        // 5. Return JSON
        return res.status(200).json(
            new ApiResponse(200, finalResult, "Risk analytics generated successfully")
        );

    } catch (error) {
        console.error("=".repeat(80));
        console.error("[ERROR] ML Service Call Failed");
        console.error("URL:", `${ML_SERVICE_URL}/predict_risk`);

        if (error.response) {
            // Server responded with error status
            console.error("Status Code:", error.response.status);
            console.error("Response Data:", JSON.stringify(error.response.data, null, 2));
            console.error("Response Headers:", error.response.headers);
        } else if (error.request) {
            // Request made but no response received
            console.error("No response received from ML service");
            console.error("Request details:", error.request.path);
        } else {
            // Error in setting up request
            console.error("Error Message:", error.message);
        }
        console.error("=".repeat(80));

        throw new ApiError(500, `ML Service Failed: ${error.response?.statusText || error.message}`);
    }
});

// Get Monthly Finance Analytics - Income from fee payments
export const getMonthlyFinanceAnalytics = asyncHandler(async (req, res) => {
    const currentYear = new Date().getFullYear();
    const { year = currentYear } = req.query;

    // Aggregate successful fee payments by month
    const monthlyData = await FeePayment.aggregate([
        {
            $match: {
                docType: "payment",
                transactionStatus: { $in: ["success", "completed"] },
                transactionDate: {
                    $gte: new Date(`${year}-01-01`),
                    $lte: new Date(`${year}-12-31`)
                }
            }
        },
        {
            $group: {
                _id: { $month: "$transactionDate" },
                income: { $sum: "$amount" },
                count: { $sum: 1 }
            }
        },
        {
            $sort: { _id: 1 }
        }
    ]);

    // Create array for all 12 months
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const chartData = months.map((name, index) => {
        const monthData = monthlyData.find(m => m._id === index + 1);
        return {
            name,
            income: monthData ? monthData.income : 0,
            expense: 0, // Placeholder - can be extended with actual expense tracking
            count: monthData ? monthData.count : 0
        };
    });

    return res.status(200).json(
        new ApiResponse(200, {
            year: parseInt(year),
            data: chartData,
            totalIncome: chartData.reduce((sum, m) => sum + m.income, 0),
            totalTransactions: chartData.reduce((sum, m) => sum + m.count, 0)
        }, "Monthly finance analytics fetched successfully")
    );
});
