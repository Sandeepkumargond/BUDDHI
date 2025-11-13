import asyncHandler from "../utils/asyncHandler.js";
import ApiResponse from "../utils/ApiResponse.js";
import ApiError from "../utils/ApiError.js";
import { Admin } from "../models/admin.model.js";

export const getAdminById = asyncHandler(async (req, res) => {
    const adminId = req.params.id;

    const admin = await getAdminDetailsById(adminId);

    res.status(200)
        .json(
            new ApiResponse(
                200,
                admin,
                "Admin details fetched successfully"
            )
        )
});

export const getAdminDetailsById = async (adminId) => {
    if (!adminId) {
        throw new ApiError(400, "Admin ID is required");
    }

    const admin = await Admin.findById(adminId).select("-password -refreshToken");

    if (!admin) {
        throw new ApiError(404, "Admin not found");
    }

    return admin;
};

export const changePassword = asyncHandler(async (req, res, next) => {
    const adminId = req.user?._id;

    const admin = await getAdminDetailsById(adminId);

    if (!admin) {
        throw new ApiError(404, "admin not found");
    }

    const { currentPassword, newPassword } = req.body;

    const isPasswordCorrect = await admin.isPasswordCorrect(currentPassword);

    if (!isPasswordCorrect) {
        throw new ApiError(401, "Incorrect Current Password.");
    }

    admin.password = newPassword;
    await admin.save({ validateBeforeSave: false });

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                {},
                "Password Changed Successfully"
            )
        );
});

export const generateAccessAndRefreshToken = async (adminId) => {
    // console.log(adminId);
    try {
        const admin = await getAdminDetailsById(adminId);
        // console.log(admin);

        const accessToken = admin.generateAccessToken();
        const refreshToken = admin.generateRefreshToken();

        // console.log(`AccessToken : ${accessToken} refreshToken: ${refreshToken}`);

        admin.refreshToken = refreshToken;
        await admin.save({ validateBeforeSave: false });

        return { accessToken, refreshToken };
    } catch (error) {
        throw new ApiError(500, "Something went wrong while generating refresh and access token");
    }
};

