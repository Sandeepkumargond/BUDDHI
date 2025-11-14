import asyncHandler from "../utils/asyncHandler.js";
import ApiResponse from "../utils/ApiResponse.js";
import ApiError from "../utils/ApiError.js";
import { Student } from "../models/student.model.js";
import jwt from "jsonwebtoken";
import { deleteFromImageKit, getFileIdFromUrl, uploadImageOnImageKit } from "../utils/ImageKit.js";

export const getStudentById = asyncHandler(async (req, res) => {
    const studentId = req.params.id;

    const student = await getStudentDetailsById(studentId);

    res.status(200)
        .json(
            new ApiResponse(
                200,
                student,
                "Student details fetched successfully"
            )
        )
});

export const getStudentDetailsById = async (studentId) => {
    if (!studentId) {
        throw new ApiError(400, "Student ID is required");
    }

    const student = await Student.findById(studentId).select("-password -refreshToken");

    if (!student) {
        throw new ApiError(404, "Student not found");
    }

    return student;
};

export const changeStudentPassword = asyncHandler(async (req, res, next) => {
    const studentId = req.user?._id;

    const student = await Student.findById(studentId);

    if (!student) {
        throw new ApiError(404, "student not found");
    }

    const { currentPassword, newPassword } = req.body;

    const isPasswordCorrect = await student.isPasswordCorrect(currentPassword);

    if (!isPasswordCorrect) {
        throw new ApiError(401, "Incorrect Current Password.");
    }

    student.password = newPassword;
    await student.save({ validateBeforeSave: false });

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

export const generateStudentAccessAndRefreshToken = async (studentId) => {
    // console.log(studentId);
    try {
        const student = await getStudentDetailsById(studentId);
        // console.log(student);

        const accessToken = student.generateAccessToken();
        const refreshToken = student.generateRefreshToken();

        // console.log(`AccessToken : ${accessToken} refreshToken: ${refreshToken}`);

        student.refreshToken = refreshToken;
        await student.save({ validateBeforeSave: false });

        return { accessToken, refreshToken };
    } catch (error) {
        throw new ApiError(500, "Something went wrong while generating refresh and access token");
    }
};

export const loginStudent = asyncHandler(async (req, res, next) => {
    let { email, password } = req.body || {};

    if (!password) {
        throw new ApiError(400, "Password is required");
    }

    if (!email) {
        throw new ApiError(400, "Email is required");
    }

    email = email.toLowerCase();

    const student = await Student.findOne({ email });

    if (!student) {
        throw new ApiError(404, "Student doesn't exist");
    }

    const isPasswordValid = await student.isPasswordCorrect(password);

    if (!isPasswordValid) {
        throw new ApiError(401, "Incorrect Password.");
    }

    const { accessToken, refreshToken } = await generateStudentAccessAndRefreshToken(student?._id);

    const loggedInStudent = await getStudentDetailsById(student?._id);

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
                    user: loggedInStudent,
                    accessToken,
                    refreshToken
                },
                "Student logged In Successfully!"
            )
        )
})

export const logoutStudent = asyncHandler(async (req, res, next) => {
    const student = await Student.findByIdAndUpdate(req.user?._id,
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
                    user: student,
                },
                "Student logged out successfully"
            )
        );
})

export const refreshStudentAccessToken = asyncHandler(async (req, res) => {
    const incomingRefreshToken = req.cookies?.refreshToken || req.body?.refreshToken;

    if (!incomingRefreshToken) {
        throw new ApiError(401, "Unauthorized Request!");
    }

    try {
        const decodedToken = jwt.verify(incomingRefreshToken, process.env.REFRESH_TOKEN_SECRET);

        const student = await Student.findById(decodedToken?._id).select("-password");

        if (!student) {
            throw new ApiError(401, "Invalid Refresh Token")
        }

        if (incomingRefreshToken !== student.refreshToken) {
            throw new ApiError(401, "Refresh Token is expired or used");
        }

        const options = {
            httpOnly: true,
            secure: true
        }

        const { accessToken, refreshToken: newRefreshToken } = await generateStudentAccessAndRefreshToken(student?._id);

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

export const updateStudentAccountDetails = asyncHandler(async (req, res, next) => {
    const studentId = req.user?._id;
    const student = await getStudentDetailsById(studentId);

    if (!student) {
        throw new ApiError(404, "Student not found");
    }

    const {
        firstName,
        lastName,
        mobile,
        social
    } = req.body || {};


    const updateData = {
        firstName: firstName !== undefined ? firstName : student.firstName,
        lastName: lastName !== undefined ? lastName : student.lastName,
        mobile: mobile !== undefined ? mobile : student.mobile,
        social: social !== undefined ? social : student.social,
    };

    const updatedStudent = await Student.findByIdAndUpdate(
        studentId,
        { $set: updateData },
        { new: true }
    ).select("-password -refreshToken");

    return res.status(200).json(
        new ApiResponse(
            200,
            {
                updatedStudent,
            },
            "Student account details updated successfully"
        )
    );
});

export const updateStudentImage = asyncHandler(async (req, res, next) => {
    const studentId = req.user?._id;

    const student = await getStudentDetailsById(studentId);

    const oldImageUrl = student.imageUrl || "";

    const oldImageFileId = await getFileIdFromUrl(oldImageUrl);

    const imageLocalPath = req.file?.path;

    if (!imageLocalPath) {
        throw new ApiError(400, "Please provide a valid image");
    }

    const image = await uploadImageOnImageKit(imageLocalPath, student.firstName);

    if (!image || image.error) {
        throw new ApiError(500, "Failed to upload image image");
    }

    const updatedStudent = await Student.findByIdAndUpdate(
        studentId,
        {
            $set: { imageUrl: image.url }
        },
        { new: true }
    ).select("-password -refreshToken");

    // Delete old avatar if exists (pass fileId from the response)
    if (updatedStudent && oldImageUrl) {
        await deleteFromImageKit(oldImageFileId);
    }

    return res.status(200).json(
        new ApiResponse(
            200,
            {
                updatedStudent,
            },
            "Student image updated successfully"
        )
    );
});

export const availableMail = asyncHandler(async (req, res, next) => {
    const { email } = req.body;

    const student = await Student.findOne({ email });

    if (student) {
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

