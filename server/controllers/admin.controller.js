import asyncHandler from "../utils/asyncHandler.js";
import ApiResponse from "../utils/ApiResponse.js";
import ApiError from "../utils/ApiError.js";
import { Admin } from "../models/admin.model.js";
import jwt from "jsonwebtoken"
import { deleteFromImageKit, getFileIdFromUrl, uploadImageOnImageKit } from "../utils/ImageKit.js";
import { Student } from "../models/student.model.js";
import { getStudentDetailsById } from "./student.controller.js";
import rollPrefixMap from "../configs/rollPrefixMap.js";
import { generateEnrollmentNo, generateFacultyId, generateRollNo, generateSubAdminId } from "../utils/getNextSequence.js";
import { Faculty } from "../models/faculty.model.js";
import { deptartmentMap } from "../configs/maps.js";
import { getFacultyById, getFacultyDetailsById } from "./faculty.controller.js";
import { SubAdmin } from "../models/subAdmin.model.js";
import { getSubAdminDetailsById } from "./subAdmin.controller.js";

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

export const getMyProfile = asyncHandler(async (req, res) => {
    const adminId = req.user?._id;

    const admin = await getAdminDetailsById(adminId);

    return res.status(200).json(
        new ApiResponse(
            200,
            {
                user: admin,
            },
            "Admin profile fetched successfully"
        )
    );
});

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
        secure: true,
        sameSite: 'None'
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
        secure: true,
        sameSite: 'None'
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
            secure: true,
            sameSite: 'None'
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
        personalMail,
        social
    } = req.body || {};

    let parsedSocial = social;
    if (typeof parsedSocial === 'string') {
        try { parsedSocial = JSON.parse(parsedSocial); } catch (e) { /* ignore */ }
    }

    const updateData = {
        firstName: firstName !== undefined ? firstName : admin.firstName,
        lastName: lastName !== undefined ? lastName : admin.lastName,
        mobile: mobile !== undefined ? mobile : admin.mobile,
        personalMail: personalMail !== undefined ? personalMail : admin.personalMail,
        social: parsedSocial !== undefined ? parsedSocial : admin.social,
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
    const { firstName, lastName, email, personalMail, gender, program, branch, semester, section, batch, mobile, registrationNumber, dateOfAdmission, password, dateOfBirth } = req.body;

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
        section,
        batch,
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

export const updateStudent = asyncHandler(async (req, res, next) => {
    const { id } = req.params;
    const { firstName, lastName, mobile, personalMail, address, semester, section, batch, fatherName, motherName } = req.body;

    if (!id) {
        throw new ApiError(400, "Student ID is required");
    }

    const student = await Student.findById(id);

    if (!student) {
        throw new ApiError(404, "Student not found");
    }

    const updateData = {};
    if (firstName !== undefined) updateData.firstName = firstName;
    if (lastName !== undefined) updateData.lastName = lastName;
    if (mobile !== undefined) updateData.mobile = mobile;
    if (personalMail !== undefined) updateData.personalMail = personalMail;
    if (address !== undefined) updateData.address = address;
    if (semester !== undefined) updateData.semester = Number(semester);
    if (section !== undefined) updateData.section = section;
    if (batch !== undefined) updateData.batch = batch;
    if (fatherName !== undefined) updateData.fatherName = fatherName;
    if (motherName !== undefined) updateData.motherName = motherName;

    const updatedStudent = await Student.findByIdAndUpdate(
        id,
        { $set: updateData },
        { new: true }
    ).select("-password -refreshToken");

    return res.status(200).json(
        new ApiResponse(
            200,
            { student: updatedStudent },
            "Student updated successfully"
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

export const createSubAdmin = asyncHandler(async (req, res, next) => {
    const { firstName, lastName, email, department, password, personalMail } = req.body;

    if (
        [firstName, lastName, email, department, password, personalMail].some((field) => !field || field?.trim() === "")
    ) {
        throw new ApiError(400, "All fields are required")
    }

    const existedSubAdmin = await SubAdmin.findOne({ personalMail: personalMail.toLowerCase() }).lean();

    if (existedSubAdmin) {
        throw new ApiError(409, "SubAdmin with this email already exists");
    }

    const adminId = req.user?._id;
    const admin = await getAdminDetailsById(adminId);

    // validate department exists in the department map
    if (!deptartmentMap[department]) {
        throw new ApiError(400, `Invalid department code: ${department}`);
    }

    // generate subAdminId like <DEPT><YEAR><SEQ>
    const currentYear = new Date().getFullYear();
    const subAdminId = await generateSubAdminId(department, currentYear, 3);

    const subAdmin = await SubAdmin.create({
        subAdminId,
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        email: email.toLowerCase(),
        personalMail,
        password,
        department,
        collegeName: admin.collegeName,
        collegeRegistartionNo: admin.collegeRegistartionNo,
        abbreviation: admin.abbreviation,
    });

    const createdSubAdmin = await getSubAdminDetailsById(subAdmin?._id);

    if (!createdSubAdmin) {
        throw new ApiError(500, "An Error occured while creating the subAdmin.");
    }

    return res.status(200)
        .json(
            new ApiResponse(
                200,
                createdSubAdmin,
                "College SubAdmin Created Successfully."
            )
        );

});

export const deleteStudent = asyncHandler(async (req, res, next) => {
    const { studentId, email, enrollmentNo, rollNo, registrationNumber } = req.body || {};

    const filters = [];
    if (studentId) filters.push({ _id: studentId });
    if (email) filters.push({ email });
    if (enrollmentNo) filters.push({ enrollmentNo });
    if (rollNo) filters.push({ rollNo });
    if (registrationNumber) filters.push({ registrationNumber });

    if (!filters.length) {
        throw new ApiError(400, "Provide at least one identifier: studentId, email, enrollmentNo, rollNo, or registrationNumber");
    }

    // Fetch to capture any assets before deletion
    const studentToDelete = await Student.findOne({ $or: filters }).select("-password");

    if (!studentToDelete) {
        throw new ApiError(404, "Student not found");
    }

    // Perform deletion
    const deletedStudent = await Student.findOneAndDelete({ $or: filters }).select("-password");

    // Best-effort cleanup of avatar image if stored on ImageKit
    try {
        if (deletedStudent?.imageUrl) {
            const fileId = await getFileIdFromUrl(deletedStudent.imageUrl);
            if (fileId) await deleteFromImageKit(fileId);
        }
    } catch (err) {
        // Non-fatal: log context if a logger exists in the codebase
    }

    return res.status(200).json(
        new ApiResponse(
            200,
            deletedStudent,
            "Student deleted successfully"
        )
    );
});

export const deleteFaculty = asyncHandler(async (req, res, next) => {
    const { facultyId, email, id } = req.body || {};

    const filters = [];
    if (id) filters.push({ _id: id });
    if (email) filters.push({ email });
    if (facultyId) filters.push({ facultyId });

    if (!filters.length) {
        throw new ApiError(400, "Provide at least one identifier: id, email, or facultyId");
    }

    const facultyToDelete = await Faculty.findOne({ $or: filters }).select("-password");
    if (!facultyToDelete) {
        throw new ApiError(404, "Faculty not found");
    }

    const deletedFaculty = await Faculty.findOneAndDelete({ $or: filters }).select("-password");

    try {
        if (deletedFaculty?.imageUrl) {
            const fileId = await getFileIdFromUrl(deletedFaculty.imageUrl);
            if (fileId) await deleteFromImageKit(fileId);
        }
    } catch (err) {
        // ignore image cleanup errors
    }

    return res.status(200).json(
        new ApiResponse(200, deletedFaculty, "Faculty deleted successfully")
    );
});

export const deleteSubAdmin = asyncHandler(async (req, res, next) => {
    const { subAdminId, email, id } = req.body || {};

    const filters = [];
    if (subAdminId) filters.push({ _id: subAdminId });
    if (id) filters.push({ _id: id });
    if (email) filters.push({ email });

    if (!filters.length) {
        throw new ApiError(400, "Provide at least one identifier: subAdminId, id, or email");
    }

    const subAdminToDelete = await SubAdmin.findOne({ $or: filters }).select("-password");
    if (!subAdminToDelete) {
        throw new ApiError(404, "SubAdmin not found");
    }

    const deletedSubAdmin = await SubAdmin.findOneAndDelete({ $or: filters }).select("-password");

    try {
        if (deletedSubAdmin?.imageUrl) {
            const fileId = await getFileIdFromUrl(deletedSubAdmin.imageUrl);
            if (fileId) await deleteFromImageKit(fileId);
        }
    } catch (err) {
        // ignore image cleanup errors
    }

    return res.status(200).json(
        new ApiResponse(200, deletedSubAdmin, "SubAdmin deleted successfully")
    );
});

export const getAllFaculty = asyncHandler(async (req, res, next) => {
    const { department } = req.query || {};
    const filter = department ? { department } : {};
    const facultyList = await Faculty.find(filter)
        .select("-password -refreshToken")
        .populate('assignedCourses.courseId', 'name code semester');

    return res.status(200).json(
        new ApiResponse(
            200,
            {
                faculty: facultyList,
            },
            "Faculty list fetched successfully"
        )
    );
});

export const getAllSubAdmins = asyncHandler(async (req, res, next) => {
    const subAdmins = await SubAdmin.find().select("-password -refreshToken");

    return res.status(200).json(
        new ApiResponse(
            200,
            {
                subAdmins,
            },
            "SubAdmins fetched successfully"
        )
    );
});

export const adminListStudents = asyncHandler(async (req, res) => {
    const { branch, semester, program } = req.query || {};
    const filters = {};
    if (branch) filters.branch = branch;
    if (semester) filters.semester = semester;
    if (program) filters.program = program;

    const students = await Student.find(filters).select("-password -refreshToken");
    return res.status(200).json(
        new ApiResponse(
            200,
            { students },
            "Students fetched successfully"
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