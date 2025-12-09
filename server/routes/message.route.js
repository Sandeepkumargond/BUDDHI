import { Router } from "express";
import {
    getMyConversations,
    getConversationMessages,
    sendMessage,
    markMessageAsRead,
    markConversationAsRead,
    deleteMessage,
    searchUsers,
    getUnreadCount,
} from "../controllers/message.controller.js";
import { Alumni } from "../models/alumni.model.js";
import { Student } from "../models/student.model.js";
import jwt from "jsonwebtoken";
import ApiError from "../utils/ApiError.js";

const router = Router();

// Middleware to authenticate either alumni or student
const authenticateUser = async (req, res, next) => {
    try {
        const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ", "");

        if (!token) {
            return res.status(401).json({
                success: false,
                message: "Unauthorized - Please login"
            });
        }

        const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

        // Try to find user as Alumni first
        let user = await Alumni.findById(decodedToken._id).select('-password -refreshToken');

        if (user) {
            req.user = user;
            req.user.role = 'alumni';
            return next();
        }

        // Try to find user as Student
        user = await Student.findById(decodedToken._id).select('-password -refreshToken');

        if (user) {
            req.user = user;
            req.user.role = 'student';
            return next();
        }

        // User not found in either collection
        return res.status(401).json({
            success: false,
            message: "Unauthorized - User not found"
        });

    } catch (error) {
        return res.status(401).json({
            success: false,
            message: error.message || "Unauthorized - Invalid token"
        });
    }
};

// All routes require authentication (alumni or student)
router.use(authenticateUser);

// Conversation routes
router.route("/conversations").get(getMyConversations);
router.route("/conversations/:conversationId").get(getConversationMessages);
router.route("/conversations/:conversationId/read").patch(markConversationAsRead);

// Message routes
router.route("/send").post(sendMessage);
router.route("/:messageId/read").patch(markMessageAsRead);
router.route("/:messageId").delete(deleteMessage);

// Utility routes
router.route("/search-users").get(searchUsers);
router.route("/unread-count").get(getUnreadCount);

export default router;
