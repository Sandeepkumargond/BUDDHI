import asyncHandler from "../utils/asyncHandler.js";
import ApiResponse from "../utils/ApiResponse.js";
import ApiError from "../utils/ApiError.js";
import { Student } from "../models/student.model.js";

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

export const changePassword = asyncHandler(async (req, res, next) => {
    const studentId = req.student?._id;

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

export const generateAccessAndRefreshToken = async (studentId) => {
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
