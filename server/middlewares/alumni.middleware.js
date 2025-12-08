import jwt from 'jsonwebtoken';
import ApiError from '../utils/ApiError.js';
import asyncHandler from '../utils/asyncHandler.js';
import { Alumni } from '../models/alumni.model.js';

export const authenticateAlumni = asyncHandler(async (req, res, next) => {
    try {
        const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ", "");
        
        if (!token) {
            throw new ApiError(401, "Unauthorized request");
        }

        const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

        const alumni = await Alumni.findById(decodedToken?._id).select("-password -refreshToken");

        if (!alumni) {
            throw new ApiError(401, "Invalid Access Token");
        }

        if (alumni.accountStatus !== 'active') {
            throw new ApiError(403, "Account is not active");
        }

        req.user = alumni;
        next();
    } catch (error) {
        throw new ApiError(401, error?.message || "Invalid access token");
    }
});
