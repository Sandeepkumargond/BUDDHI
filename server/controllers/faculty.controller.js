import asyncHandler from "../utils/asyncHandler.js";
import ApiResponse from "../utils/ApiResponse.js";
import ApiError from "../utils/ApiError.js";
import { Faculty } from "../models/faculty.model.js";
import jwt from "jsonwebtoken";
import { deleteFromImageKit, getFileIdFromUrl, uploadImageOnImageKit } from "../utils/ImageKit.js";

export const getFacultyById = asyncHandler(async (req, res) => {
    const facultyId = req.params.id;

    const faculty = await getFacultyDetailsById(facultyId);

    res.status(200)
        .json(
            new ApiResponse(
                200,
                faculty,
                "Faculty details fetched successfully"
            )
        )
});

export const getFacultyDetailsById = async (facultyId) => {
    if (!facultyId) {
        throw new ApiError(400, "Faculty ID is required");
    }

    const faculty = await Faculty.findById(facultyId).select("-password -refreshToken");

    if (!faculty) {
        throw new ApiError(404, "Faculty not found");
    }

    return faculty;
};

export const changeFacultyPassword = asyncHandler(async (req, res, next) => {
    const facultyId = req.user?._id;

    const faculty = await Faculty.findById(facultyId);

    if (!faculty) {
        throw new ApiError(404, "faculty not found");
    }

    const { currentPassword, newPassword } = req.body;

    const isPasswordCorrect = await faculty.isPasswordCorrect(currentPassword);

    if (!isPasswordCorrect) {
        throw new ApiError(401, "Incorrect Current Password.");
    }

    faculty.password = newPassword;
    await faculty.save({ validateBeforeSave: false });

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

export const generateFacultyAccessAndRefreshToken = async (facultyId) => {
    // console.log(facultyId);
    try {
        const faculty = await getFacultyDetailsById(facultyId);
        // console.log(faculty);

        const accessToken = faculty.generateAccessToken();
        const refreshToken = faculty.generateRefreshToken();

        // console.log(`AccessToken : ${accessToken} refreshToken: ${refreshToken}`);

        faculty.refreshToken = refreshToken;
        await faculty.save({ validateBeforeSave: false });

        return { accessToken, refreshToken };
    } catch (error) {
        throw new ApiError(500, "Something went wrong while generating refresh and access token");
    }
};

export const loginFaculty = asyncHandler(async (req, res, next) => {
    let { email, password } = req.body || {};

    if (!password) {
        throw new ApiError(400, "Password is required");
    }

    if (!email) {
        throw new ApiError(400, "Email is required");
    }

    email = email.toLowerCase();

    const faculty = await Faculty.findOne({ email });

    if (!faculty) {
        throw new ApiError(404, "Faculty doesn't exist");
    }

    const isPasswordValid = await faculty.isPasswordCorrect(password);

    if (!isPasswordValid) {
        throw new ApiError(401, "Incorrect Password.");
    }

    const { accessToken, refreshToken } = await generateFacultyAccessAndRefreshToken(faculty?._id);

    const loggedInFaculty = await getFacultyDetailsById(faculty?._id);

    const options = {
        httpOnly: true,
        secure: true
    }

    return res
        .status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", refreshToken, options)
        .json(
            new ApiResponse(
                200,
                {
                    user: loggedInFaculty,
                    accessToken,
                    refreshToken
                },
                "Faculty logged In Successfully!"
            )
        )
})

export const logoutFaculty = asyncHandler(async (req, res, next) => {
    const faculty = await Faculty.findByIdAndUpdate(req.user?._id,
        {
            $unset: { refreshToken: 1 }
        },
        {
            new: true,
        }
    ).select("-password");

    const options = {
        httpOnly: true,
        secure: true
    }

    return res
        .status(200)
        .clearCookie("accessToken", options)
        .clearCookie("refreshToken", options)
        .json(
            new ApiResponse(
                200,
                {
                    user: faculty,
                },
                "Faculty logged out successfully"
            )
        );
})

export const refreshFacultyAccessToken = asyncHandler(async (req, res) => {
    const incomingRefreshToken = req.cookies?.refreshToken || req.body?.refreshToken;

    if (!incomingRefreshToken) {
        throw new ApiError(401, "Unauthorized Request!");
    }

    try {
        const decodedToken = jwt.verify(incomingRefreshToken, process.env.REFRESH_TOKEN_SECRET);

        const faculty = await Faculty.findById(decodedToken?._id).select("-password");

        if (!faculty) {
            throw new ApiError(401, "Invalid Refresh Token")
        }

        if (incomingRefreshToken !== faculty.refreshToken) {
            throw new ApiError(401, "Refresh Token is expired or used");
        }

        const options = {
            httpOnly: true,
            secure: true
        }

        const { accessToken, refreshToken: newRefreshToken } = await generateFacultyAccessAndRefreshToken(faculty?._id);

        res
            .status(200)
            .cookie("accessToken", accessToken, options)
            .cookie("refreshToken", newRefreshToken, options)
            .json(
                new ApiResponse(
                    200,
                    { accessToken, refreshToken: newRefreshToken },
                    "Access token refreshed"
                )
            )
    } catch (error) {
        throw new ApiError(401, error?.message || "Invalid Refresh Token")
    }
});

export const updateFacultyAccountDetails = asyncHandler(async (req, res, next) => {
    const facultyId = req.user?._id;
    const faculty = await getFacultyDetailsById(facultyId);

    if (!faculty) {
        throw new ApiError(404, "Faculty not found");
    }

    const {
        firstName,
        lastName,
        mobile,
        social
    } = req.body || {};


    const updateData = {
        firstName: firstName !== undefined ? firstName : faculty.firstName,
        lastName: lastName !== undefined ? lastName : faculty.lastName,
        mobile: mobile !== undefined ? mobile : faculty.mobile,
        social: social !== undefined ? social : faculty.social,
    };

    const updatedFaculty = await Faculty.findByIdAndUpdate(
        facultyId,
        { $set: updateData },
        { new: true }
    ).select("-password -refreshToken");

    return res.status(200).json(
        new ApiResponse(
            200,
            {
                updatedFaculty,
            },
            "Faculty account details updated successfully"
        )
    );
});

export const updateFacultyImage = asyncHandler(async (req, res, next) => {
    const facultyId = req.user?._id;

    const faculty = await getFacultyDetailsById(facultyId);

    const oldImageUrl = faculty.imageUrl || "";

    const oldImageFileId = await getFileIdFromUrl(oldImageUrl);

    const imageLocalPath = req.file?.path;

    if (!imageLocalPath) {
        throw new ApiError(400, "Please provide a valid image");
    }

    const image = await uploadImageOnImageKit(imageLocalPath, faculty.firstName);

    if (!image || image.error) {
        throw new ApiError(500, "Failed to upload image image");
    }

    const updatedFaculty = await Faculty.findByIdAndUpdate(
        facultyId,
        {
            $set: { imageUrl: image.url }
        },
        { new: true }
    ).select("-password -refreshToken");

    // Delete old avatar if exists (pass fileId from the response)
    if (updatedFaculty && oldImageUrl) {
        await deleteFromImageKit(oldImageFileId);
    }

    return res.status(200).json(
        new ApiResponse(
            200,
            {
                updatedFaculty,
            },
            "Faculty image updated successfully"
        )
    );
});

export const availableMail = asyncHandler(async (req, res, next) => {
    const { email } = req.body;

    const faculty = await Faculty.findOne({ email });

    if (faculty) {
        return res.status(200).json(
            new ApiResponse(
                200,
                {
                    isAvailable: false,
                },
                "Email is already taken"
            )
        );
    }

    return res.status(200).json(
        new ApiResponse(
            200,
            {
                isAvailable: true,
            },
            "Email is available"
        )
    );
});

