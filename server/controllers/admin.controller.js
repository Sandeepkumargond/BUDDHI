import asyncHandler from "../utils/asyncHandler.js";
import ApiResponse from "../utils/ApiResponse.js";
import ApiError from "../utils/ApiError.js";
import { Admin } from "../models/admin.model.js";
import jwt from "jsonwebtoken"
import { deleteFromImageKit, getFileIdFromUrl, uploadImageOnImageKit } from "../utils/ImageKit.js";
import { Student } from "../models/student.model.js";
import { getStudentDetailsById } from "./student.controller.js";
import rollPrefixMap from "../configs/rollPrefixMap.js";
import { generateEnrollmentNo, generateFacultyId, generateRollNo } from "../utils/getNextSequence.js";
import { Faculty } from "../models/faculty.model.js";
import { deptartmentMap } from "../configs/maps.js";
import { getFacultyById, getFacultyDetailsById } from "./faculty.controller.js";

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

export const generateAdminAccessAndRefreshToken = async (adminId) => {
    try {
        const admin = await getAdminDetailsById(adminId);

        const accessToken = admin.generateAccessToken();
        const refreshToken = admin.generateRefreshToken();

        admin.refreshToken = refreshToken;

        await admin.save({ validateBeforeSave: false });

        return { accessToken, refreshToken };
    } catch (error) {
        throw new ApiError(500, "Something went wrong while generating refresh and access token");
    }
}

export const loginAdmin = asyncHandler(async (req, res, next) => {
    const { email, password } = req.body;

    if (!password) {
        throw new ApiError(400, "Password is required");
    }

    if (!email) {
        throw new ApiError(400, "Email is required");
    }

    const admin = await Admin.findOne({ email });

    if (!admin) {
        throw new ApiError(404, "Admin doesn't exist");
    }

    const isPasswordValid = await admin.isPasswordCorrect(password);

    if (!isPasswordValid) {
        throw new ApiError(401, "Incorrect Password.");
    }

    const { accessToken, refreshToken } = await generateAdminAccessAndRefreshToken(admin?._id);

    const loggedInAdmin = await getAdminDetailsById(admin?._id);

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
                    user: loggedInAdmin,
                    accessToken,
                    refreshToken
                },
                "Admin logged In Successfully!"
            )
        )
})

export const logoutAdmin = asyncHandler(async (req, res, next) => {
    const admin = await Admin.findOneAndUpdate(req.user?._id,
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
                    user: admin,
                },
                "Admin logged out successfully"
            )
        );
})

export const refreshAdminAccessToken = asyncHandler(async (req, res) => {
    const incomingRefreshToken = req.cookies?.refreshToken || req.body?.refreshToken;

    if (!incomingRefreshToken) {
        throw new ApiError(401, "Unauthorized Request!");
    }

    try {
        const decodedToken = jwt.verify(incomingRefreshToken, process.env.REFRESH_TOKEN_SECRET);

        const admin = await Admin.findById(decodedToken?._id).select("-password");

        if (!admin) {
            throw new ApiError(401, "Invalid Refresh Token")
        }

        if (incomingRefreshToken !== admin.refreshToken) {
            throw new ApiError(401, "Refresh Token is expired or used");
        }

        const options = {
            httpOnly: true,
            secure: true
        }

        const { accessToken, refreshToken: newRefreshToken } = await generateAdminAccessAndRefreshToken(admin._id);

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

export const changeAdminPassword = asyncHandler(async (req, res, next) => {
    const adminId = req.user?._id;

    const admin = await Admin.findById(adminId);

    if (!admin) {
        throw new ApiError(404, "Admin not found");
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
                {
                },
                "Password Changed Successfully"
            )
        );
});

export const updateAdminAccountDetails = asyncHandler(async (req, res, next) => {
    const adminId = req.user?._id;
    const admin = await getAdminDetailsById(adminId);

    if (!admin) {
        throw new ApiError(404, "Admin not found");
    }

    const {
        firstName,
        lastName,
        mobile,
        social
    } = req.body || {};


    const updateData = {
        firstName: firstName !== undefined ? firstName : admin.firstName,
        lastName: lastName !== undefined ? lastName : admin.lastName,
        mobile: mobile !== undefined ? mobile : admin.mobile,
        social: social !== undefined ? social : admin.social,
    };



    const updatedAdmin = await Admin.findByIdAndUpdate(
        adminId,
        { $set: updateData },
        { new: true }
    ).select("-password -refreshToken");

    return res.status(200).json(
        new ApiResponse(
            200,
            {
                updatedAdmin,
            },
            "Admin account details updated successfully"
        )
    );

});

export const updateAdminImage = asyncHandler(async (req, res, next) => {
    const adminId = req.user?._id;

    const admin = await getAdminDetailsById(adminId);

    const oldImageUrl = admin.imageUrl || "";

    const oldImageFileId = await getFileIdFromUrl(oldImageUrl);

    const imageLocalPath = req.file?.path;

    if (!imageLocalPath) {
        throw new ApiError(400, "Please provide a valid image");
    }

    const image = await uploadImageOnImageKit(imageLocalPath, admin.abbreviation);

    if (!image || image.error) {
        throw new ApiError(500, "Failed to upload image image");
    }

    const updatedAdmin = await Admin.findByIdAndUpdate(
        adminId,
        {
            $set: { imageUrl: image.url }
        },
        { new: true }
    ).select("-password -refreshToken");

    // Delete old avatar if exists (pass fileId from the response)
    if (updatedAdmin && oldImageUrl) {
        await deleteFromImageKit(oldImageFileId);
    }

    return res.status(200).json(
        new ApiResponse(
            200,
            {
                updatedAdmin,
            },
            "Admin image updated successfully"
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