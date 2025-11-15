import { getFacultyDetailsById } from "../controllers/faculty.controller.js";
import ApiError from "../utils/ApiError.js";
import asyncHandler from "../utils/asyncHandler.js";
import jwt from "jsonwebtoken";

export const authenticateFaculty = asyncHandler(async (req, res, next) => {
    try {
        const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ", "");

        if (!token) {
            throw new ApiError(401, "Unauthorized: No token provided");
        }
        const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

        const faculty = await getFacultyDetailsById(decodedToken?._id);

        if (!faculty) {
            throw new ApiError(401, "Unauthorized: Faculty not found");
        }

        req.user = faculty;
        next();
    } catch (error) {
        throw new ApiError(401, error.message || "Unauthorized: Invalid or expired token");
    }
});