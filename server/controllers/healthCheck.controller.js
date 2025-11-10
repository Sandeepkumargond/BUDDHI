import ApiResponse from "../utils/ApiResponse.js";
import ApiError from "../utils/ApiError.js";
import asyncHandler from "../utils/asyncHandler.js";

export const healthCheck = asyncHandler(async (req, res, next) => {
    return res.status(200).json(new ApiResponse(200,
        {
            timestamp: new Date().toISOString()
        },
        "Server is working fine."
    ));
});