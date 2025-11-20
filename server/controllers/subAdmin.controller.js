import asyncHandler from "../utils/asyncHandler.js";
import ApiResponse from "../utils/ApiResponse.js";
import ApiError from "../utils/ApiError.js";
import { SubAdmin } from "../models/subAdmin.model.js"; 
import jwt from "jsonwebtoken"
import { deleteFromImageKit, getFileIdFromUrl, uploadImageOnImageKit } from "../utils/ImageKit.js";
import { Student } from "../models/student.model.js";
import { getStudentDetailsById } from "./student.controller.js";
import rollPrefixMap from "../configs/rollPrefixMap.js";
import { generateEnrollmentNo, generateFacultyId, generateRollNo } from "../utils/getNextSequence.js";
import { Faculty } from "../models/faculty.model.js";
import { deptartmentMap } from "../configs/maps.js";
import { getFacultyById, getFacultyDetailsById } from "./faculty.controller.js";

export const getSubAdminById = asyncHandler(async (req, res) => {
    const subAdminId = req.params.id;

    const subAdmin = await getSubAdminDetailsById(subAdminId);

    res.status(200)
        .json(
            new ApiResponse(
                200,
                subAdmin,
                "SubAdmin details fetched successfully"
            )
        )
});

export const getSubAdminDetailsById = async (subAdminId) => {
    if (!subAdminId) {
        throw new ApiError(400, "SubAdmin ID is required");
    }

    const subAdmin = await SubAdmin.findById(subAdminId).select("-password -refreshToken");

    if (!subAdmin) {
        throw new ApiError(404, "SubAdmin not found");
    }

    return subAdmin;
};

export const changePassword = asyncHandler(async (req, res, next) => {
    const subAdminId = req.user?._id;

    const subAdmin = await getSubAdminDetailsById(subAdminId);

    if (!subAdmin) {
        throw new ApiError(404, "subAdmin not found");
    }

    const { currentPassword, newPassword } = req.body;

    const isPasswordCorrect = await subAdmin.isPasswordCorrect(currentPassword);

    if (!isPasswordCorrect) {
        throw new ApiError(401, "Incorrect Current Password.");
    }

    subAdmin.password = newPassword;
    await subAdmin.save({ validateBeforeSave: false });

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

export const generateSubAdminAccessAndRefreshToken = async (subAdminId) => {
    try {
        const subAdmin = await getSubAdminDetailsById(subAdminId);

        const accessToken = subAdmin.generateAccessToken();
        const refreshToken = subAdmin.generateRefreshToken();

        subAdmin.refreshToken = refreshToken;

        await subAdmin.save({ validateBeforeSave: false });

        return { accessToken, refreshToken };
    } catch (error) {
        throw new ApiError(500, "Something went wrong while generating refresh and access token");
    }
}

export const loginSubAdmin = asyncHandler(async (req, res, next) => {
    const { email, password } = req.body;

    if (!password) {
        throw new ApiError(400, "Password is required");
    }

    if (!email) {
        throw new ApiError(400, "Email is required");
    }

    const subAdmin = await SubAdmin.findOne({ email });

    if (!subAdmin) {
        throw new ApiError(404, "SubAdmin doesn't exist");
    }

    const isPasswordValid = await subAdmin.isPasswordCorrect(password);

    if (!isPasswordValid) {
        throw new ApiError(401, "Incorrect Password.");
    }

    const { accessToken, refreshToken } = await generateSubAdminAccessAndRefreshToken(subAdmin?._id);

    const loggedInSubAdmin = await getSubAdminDetailsById(subAdmin?._id);

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
                    user: loggedInSubAdmin,
                    accessToken,
                    refreshToken
                },
                "SubAdmin logged In Successfully!"
            )
        )
})

export const logoutSubAdmin = asyncHandler(async (req, res, next) => {
    const subAdmin = await SubAdmin.findOneAndUpdate(req.user?._id,
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
                    user: subAdmin,
                },
                "SubAdmin logged out successfully"
            )
        );
})

export const refreshSubAdminAccessToken = asyncHandler(async (req, res) => {
    const incomingRefreshToken = req.cookies?.refreshToken || req.body?.refreshToken;

    if (!incomingRefreshToken) {
        throw new ApiError(401, "Unauthorized Request!");
    }

    try {
        const decodedToken = jwt.verify(incomingRefreshToken, process.env.REFRESH_TOKEN_SECRET);

        const subAdmin = await SubAdmin.findById(decodedToken?._id).select("-password");

        if (!subAdmin) {
            throw new ApiError(401, "Invalid Refresh Token")
        }

        if (incomingRefreshToken !== subAdmin.refreshToken) {
            throw new ApiError(401, "Refresh Token is expired or used");
        }

        const options = {
            httpOnly: true,
            secure: true
        }

        const { accessToken, refreshToken: newRefreshToken } = await generateSubAdminAccessAndRefreshToken(subAdmin._id);

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

export const changeSubAdminPassword = asyncHandler(async (req, res, next) => {
    const subAdminId = req.user?._id;

    const subAdmin = await SubAdmin.findById(subAdminId);

    if (!subAdmin) {
        throw new ApiError(404, "SubAdmin not found");
    }

    const { currentPassword, newPassword } = req.body;

    const isPasswordCorrect = await subAdmin.isPasswordCorrect(currentPassword);

    if (!isPasswordCorrect) {
        throw new ApiError(401, "Incorrect Current Password.");
    }

    subAdmin.password = newPassword;
    await subAdmin.save({ validateBeforeSave: false });

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                {
                },
                "Password Changed Successfully"
            )
        );
});

export const updateSubAdminAccountDetails = asyncHandler(async (req, res, next) => {
    const subAdminId = req.user?._id;
    const subAdmin = await getSubAdminDetailsById(subAdminId);

    if (!subAdmin) {
        throw new ApiError(404, "SubAdmin not found");
    }

    const {
        firstName,
        lastName,
        mobile,
        social
    } = req.body || {};


    const updateData = {
        firstName: firstName !== undefined ? firstName : subAdmin.firstName,
        lastName: lastName !== undefined ? lastName : subAdmin.lastName,
        mobile: mobile !== undefined ? mobile : subAdmin.mobile,
        social: social !== undefined ? social : subAdmin.social,
    };



    const updatedSubAdmin = await SubAdmin.findByIdAndUpdate(
        subAdminId,
        { $set: updateData },
        { new: true }
    ).select("-password -refreshToken");

    return res.status(200).json(
        new ApiResponse(
            200,
            {
                updatedSubAdmin,
            },
            "SubAdmin account details updated successfully"
        )
    );

});

export const updateSubAdminImage = asyncHandler(async (req, res, next) => {
    const subAdminId = req.user?._id;

    const subAdmin = await getSubAdminDetailsById(subAdminId);

    const oldImageUrl = subAdmin.imageUrl || "";

    const oldImageFileId = await getFileIdFromUrl(oldImageUrl);

    const imageLocalPath = req.file?.path;

    if (!imageLocalPath) {
        throw new ApiError(400, "Please provide a valid image");
    }

    const image = await uploadImageOnImageKit(imageLocalPath, subAdmin.abbreviation);

    if (!image || image.error) {
        throw new ApiError(500, "Failed to upload image image");
    }

    const updatedSubAdmin = await SubAdmin.findByIdAndUpdate(
        subAdminId,
        {
            $set: { imageUrl: image.url }
        },
        { new: true }
    ).select("-password -refreshToken");

    // Delete old avatar if exists (pass fileId from the response)
    if (updatedSubAdmin && oldImageUrl) {
        await deleteFromImageKit(oldImageFileId);
    }

    return res.status(200).json(
        new ApiResponse(
            200,
            {
                updatedSubAdmin,
            },
            "SubAdmin image updated successfully"
        )
    );
});

export const createStudent = asyncHandler(async (req, res, next) => {
    const { firstName, lastName, email, personalMail, gender, program, branch, semester, mobile, registrationNumber, dateOfAdmission, password, dateOfBirth } = req.body;

    const values = { firstName, lastName, email, gender, personalMail, program, branch, semester, mobile, registrationNumber, dateOfAdmission, password };
    for (const [k, v] of Object.entries(values)) {
        if (v === undefined) throw new ApiError(400, `${k} is required`);
    }


    const existingStudent = await Student.findOne(
        { $or: [{ email }, { personalMail }, { registrationNumber }] }
    );

    if (existingStudent) {
        throw new ApiError(400, "Student with provided email, personal mail or registration number already exists");
    }

    if (!rollPrefixMap[program] || !rollPrefixMap[program][branch]) {
        throw new Error(`Invalid program/branch mapping for ${program} - ${branch}`);
    }

    const prefix = rollPrefixMap[program][branch];

    const admissionYear = new Date(dateOfAdmission).getFullYear();
    const enrollmentNo = await generateEnrollmentNo();

    const { raw: rollSeq, formatted: rollNo } = await generateRollNo(prefix, admissionYear);

    const student = new Student({
        firstName,
        lastName,
        email,
        enrollmentNo,
        rollNo,
        dateOfBirth,
        dateOfAdmission,
        personalMail,
        program,
        gender,
        branch,
        semester,
        mobile,
        registrationNumber,
        password
    });

    await student.save();

    const createdStudent = await getStudentDetailsById(student?._id);

    if (!createdStudent) {
        throw new ApiError(500, "Failed to create student");
    }

    return res.status(201).json(
        new ApiResponse(
            201,
            {
                student: createdStudent,
            },
            "Student created successfully"
        )
    );
});

export const createFaculty = asyncHandler(async (req, res, next) => {
    const { firstName, lastName, email, personalMail, gender, department, mobile, joiningDate, password, dateOfBirth } = req.body;

    const values = { firstName, lastName, email, personalMail, gender, department, mobile, joiningDate, password, dateOfBirth };
    for (const [k, v] of Object.entries(values)) {
        if (v === undefined) throw new ApiError(400, `${k} is required`);
    }


    const existingFaculty = await Faculty.findOne(
        { $or: [{ email }, { personalMail }] }
    );

    if (existingFaculty) {
        throw new ApiError(400, "Faculty with provided email, personal mail or registration number already exists");
    }

    if (!deptartmentMap[department]) {
        throw new Error(`Invalid department mapping for ${department}`);
    }

    const joiningYear = new Date(joiningDate).getFullYear();
    const facultyId = await generateFacultyId(department, joiningYear);

    const faculty = new Faculty({
        firstName,
        lastName,
        email,
        personalMail,
        facultyId,
        dateOfBirth,
        department,
        gender,
        joiningDate,
        mobile,
        password
    });

    await faculty.save();

    const createdFaculty = await getFacultyDetailsById(faculty?._id);

    if (!createdFaculty) {
        throw new ApiError(500, "Failed to create faculty");
    }

    return res.status(201).json(
        new ApiResponse(
            201,
            {
                faculty: createdFaculty,
            },
            "Faculty created successfully"
        )
    );
});


export const getAllStudents = asyncHandler(async (req, res) => {
    const students = await Student.find().select("-password -refreshToken");

    return res.status(200).json(
        new ApiResponse(
            200,
            { students },
            "All students fetched successfully"
        )
    );
});

