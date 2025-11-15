import { getSubAdminDetailsById } from "../controllers/subAdmin.controller.js";
import ApiError from "../utils/ApiError.js";
import asyncHandler from "../utils/asyncHandler.js";
import jwt from "jsonwebtoken";

export const authenticateSubAdmin = asyncHandler(async (req, res, next) => {
    try {
        const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ", "");

        if (!token) {
            throw new ApiError(401, "Unauthorized: No token provided");
        }
        const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

        const subAdmin = await getSubAdminDetailsById(decodedToken?._id);

        if (!subAdmin) {
            throw new ApiError(401, "Unauthorized: Student not found");
        }

        req.user = subAdmin;
        next();
    } catch (error) {
        throw new ApiError(401, error.message || "Unauthorized: Invalid or expired token");
    }
});