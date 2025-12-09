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
import { generateOTP, storeOTP, verifyOTP, clearOTP, sendOTPEmail } from "../utils/otp.js";
import { generateUniqueEmail, generateSecurePassword, sendCredentialsEmail } from "../utils/credentialsGenerator.js";

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
            // Clear the invalid refresh token
            await Admin.findByIdAndUpdate(admin._id, { $unset: { refreshToken: 1 } });
            throw new ApiError(401, "Refresh Token is expired or used. Please log in again.");
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
        // Clear cookies on token refresh failure
        const options = { httpOnly: true, secure: true, sameSite: 'None' };
        res.clearCookie("accessToken", options);
        res.clearCookie("refreshToken", options);
        throw new ApiError(401, error?.message || "Invalid Refresh Token. Please log in again.")
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

    // Check required fields (email and password are now optional - will be auto-generated)
    const values = { firstName, lastName, gender, personalMail, program, branch, semester, mobile, registrationNumber, dateOfAdmission };
    for (const [k, v] of Object.entries(values)) {
        if (v === undefined) throw new ApiError(400, `${k} is required`);
    }

    // Generate unique university email if not provided
    let universityEmail = email;
    if (!universityEmail) {
        universityEmail = await generateUniqueEmail(firstName);
    } else {
        // Check if provided email already exists
        const existingEmail = await Student.findOne({ email: universityEmail.toLowerCase() });
        if (existingEmail) {
            throw new ApiError(400, "Student with provided email already exists");
        }
    }

    // Check if personal email already exists
    const existingStudent = await Student.findOne(
        { $or: [{ personalMail }, { registrationNumber }] }
    );

    if (existingStudent) {
        throw new ApiError(400, "Student with provided personal mail or registration number already exists");
    }

    // Generate secure password if not provided
    let studentPassword = password;
    if (!studentPassword) {
        studentPassword = generateSecurePassword(14);
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
        email: universityEmail,
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
        password: studentPassword
    });

    await student.save();

    // Send credentials email to personal mail
    try {
        await sendCredentialsEmail({
            recipientEmail: personalMail,
            firstName,
            lastName,
            universityEmail,
            password: studentPassword,
            userType: 'Student'
        });
    } catch (emailError) {
        console.error('Warning: Failed to send credentials email:', emailError.message);
        // Continue even if email fails - student account is already created
    }

    const createdStudent = await getStudentDetailsById(student?._id);

    if (!createdStudent) {
        throw new ApiError(500, "Failed to create student");
    }

    return res.status(201).json(
        new ApiResponse(
            201,
            {
                student: createdStudent,
                message: "Student created successfully. Credentials have been sent to personal email."
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

    // Check required fields (email and password are now optional - will be auto-generated)
    const values = { firstName, lastName, personalMail, gender, department, mobile, joiningDate, dateOfBirth };
    for (const [k, v] of Object.entries(values)) {
        if (v === undefined) throw new ApiError(400, `${k} is required`);
    }

    // Generate unique university email if not provided
    let universityEmail = email;
    if (!universityEmail) {
        universityEmail = await generateUniqueEmail(firstName);
    } else {
        // Check if provided email already exists
        const existingEmail = await Faculty.findOne({ email: universityEmail.toLowerCase() });
        if (existingEmail) {
            throw new ApiError(400, "Faculty with provided email already exists");
        }
    }

    // Check if personal email already exists
    const existingFaculty = await Faculty.findOne(
        { personalMail }
    );

    if (existingFaculty) {
        throw new ApiError(400, "Faculty with provided personal mail already exists");
    }

    // Generate secure password if not provided
    let facultyPassword = password;
    if (!facultyPassword) {
        facultyPassword = generateSecurePassword(14);
    }

    if (!deptartmentMap[department]) {
        throw new Error(`Invalid department mapping for ${department}`);
    }

    const joiningYear = new Date(joiningDate).getFullYear();
    const facultyId = await generateFacultyId(department, joiningYear);

    const faculty = new Faculty({
        firstName,
        lastName,
        email: universityEmail,
        personalMail,
        facultyId,
        dateOfBirth,
        department,
        gender,
        joiningDate,
        mobile,
        password: facultyPassword
    });

    await faculty.save();

    // Send credentials email to personal mail
    try {
        await sendCredentialsEmail({
            recipientEmail: personalMail,
            firstName,
            lastName,
            universityEmail,
            password: facultyPassword,
            userType: 'Faculty'
        });
    } catch (emailError) {
        console.error('Warning: Failed to send credentials email:', emailError.message);
        // Continue even if email fails - faculty account is already created
    }

    const createdFaculty = await getFacultyDetailsById(faculty?._id);

    if (!createdFaculty) {
        throw new ApiError(500, "Failed to create faculty");
    }

    return res.status(201).json(
        new ApiResponse(
            201,
            {
                faculty: createdFaculty,
                message: "Faculty created successfully. Credentials have been sent to personal email."
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

    const students = await Student.find(filters).select("-password -refreshToken").lean();
    
    // Import models at the top if not already imported
    const { Attendance } = await import("../models/attendance.model.js");
    const { GradeCard } = await import("../models/gradeCard.model.js");
    
    // Fetch attendance and grade data for all students
    const enrichedStudents = await Promise.all(students.map(async (student) => {
        // Calculate attendance percentage
        let attendancePercentage = 0;
        try {
            const attendanceRecords = await Attendance.find({
                'records.studentId': student._id
            });
            
            let totalClasses = 0;
            let presentCount = 0;
            
            attendanceRecords.forEach(record => {
                const studentRecord = record.records.find(r => r.studentId.toString() === student._id.toString());
                if (studentRecord) {
                    totalClasses++;
                    if (studentRecord.status === 'present') {
                        presentCount++;
                    }
                }
            });
            
            if (totalClasses > 0) {
                attendancePercentage = Math.round((presentCount / totalClasses) * 100);
            }
        } catch (err) {
            console.error(`Error calculating attendance for student ${student._id}:`, err);
        }
        
        // Calculate CGPA from grade cards
        let cgpa = 0;
        try {
            const gradeCards = await GradeCard.find({
                studentId: student._id
            }).sort({ semester: -1 });
            
            if (gradeCards.length > 0) {
                // Use the most recent grade card's SGPA or calculate from all cards
                const latestCard = gradeCards[0];
                cgpa = latestCard.sgpa || 0;
                
                // If multiple semesters, calculate cumulative CGPA
                if (gradeCards.length > 1) {
                    const totalSGPA = gradeCards.reduce((sum, card) => sum + (card.sgpa || 0), 0);
                    cgpa = parseFloat((totalSGPA / gradeCards.length).toFixed(2));
                }
            }
        } catch (err) {
            console.error(`Error calculating CGPA for student ${student._id}:`, err);
        }
        
        return {
            ...student,
            attendance: attendancePercentage,
            cgpa: cgpa
        };
    }));

    return res.status(200).json(
        new ApiResponse(
            200,
            { students: enrichedStudents },
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

export const getDashboardStats = asyncHandler(async (req, res) => {
  try {
    // Get basic counts
    const [studentCount, facultyCount, subAdminCount, adminCount] = await Promise.all([
      Student.countDocuments(),
      Faculty.countDocuments(),
      SubAdmin.countDocuments(),
      Admin.countDocuments()
    ]);

    // Get detailed student statistics
    const [maleStudentCount, femaleStudentCount] = await Promise.all([
      Student.countDocuments({ 
        gender: { $in: ['Male', 'male', 'M', 'm'] } 
      }),
      Student.countDocuments({ 
        gender: { $in: ['Female', 'female', 'F', 'f'] } 
      })
    ]);

    // Get students by semester distribution
    const semesterStats = await Student.aggregate([
      {
        $group: {
          _id: "$semester",
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    // Get students by branch distribution
    const branchStats = await Student.aggregate([
      {
        $group: {
          _id: "$branch",
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } }
    ]);

    const stats = {
      student: studentCount,
      faculty: facultyCount,
      subAdmin: subAdminCount,
      admin: adminCount,
      staff: subAdminCount + adminCount, // Combining subAdmins and admins as staff
      studentGender: {
        male: maleStudentCount,
        female: femaleStudentCount,
        total: studentCount
      },
      studentDistribution: {
        semester: semesterStats,
        branch: branchStats
      }
    };

    return res.status(200).json(
      new ApiResponse(
        200,
        stats,
        "Dashboard statistics fetched successfully"
      )
    );
  } catch (error) {
    console.error("Dashboard stats error:", error);
    throw new ApiError(500, "Failed to fetch dashboard statistics");
  }
});

// (duplicate removed) adminListStudents defined earlier with filters

// Bulk create students from Excel/CSV
export const bulkCreateStudents = asyncHandler(async (req, res, next) => {
    const { students } = req.body;

    if (!students || !Array.isArray(students) || students.length === 0) {
        throw new ApiError(400, "Students array is required and must not be empty");
    }

    const results = {
        success: [],
        failed: []
    };

    for (let i = 0; i < students.length; i++) {
        const studentData = students[i];
        const rowNumber = i + 2; // Excel row (header is row 1)

        try {
            const { firstName, lastName, email, personalMail, gender, program, branch, semester, section, batch, mobile, registrationNumber, dateOfAdmission, password, dateOfBirth } = studentData;

            // Validate required fields (email and password are now optional)
            const required = { firstName, lastName, gender, personalMail, program, branch, semester, mobile, registrationNumber, dateOfAdmission };
            for (const [k, v] of Object.entries(required)) {
                if (v === undefined || v === null || v === '') {
                    throw new Error(`${k} is required`);
                }
            }

            // Generate unique university email if not provided
            let universityEmail = email;
            if (!universityEmail) {
                universityEmail = await generateUniqueEmail(firstName);
            }

            // Check for existing student
            const existingStudent = await Student.findOne(
                { $or: [{ email: universityEmail }, { personalMail }, { registrationNumber }] }
            );

            if (existingStudent) {
                throw new Error("Student with provided email, personal mail or registration number already exists");
            }

            // Generate secure password if not provided
            let studentPassword = password;
            if (!studentPassword) {
                studentPassword = generateSecurePassword(14);
            }

            // Validate program/branch mapping
            if (!rollPrefixMap[program] || !rollPrefixMap[program][branch]) {
                const validPrograms = Object.keys(rollPrefixMap).join(', ');
                const validBranches = program && rollPrefixMap[program] 
                    ? Object.keys(rollPrefixMap[program]).join(', ') 
                    : 'CSE, ECE, EEE, ME, CE';
                throw new Error(`Invalid program/branch: "${program}" - "${branch}". Valid programs: ${validPrograms}. Valid branches for ${program || 'B.Tech'}: ${validBranches}`);
            }

            const prefix = rollPrefixMap[program][branch];
            const admissionYear = new Date(dateOfAdmission).getFullYear();
            const enrollmentNo = await generateEnrollmentNo();
            const { raw: rollSeq, formatted: rollNo } = await generateRollNo(prefix, admissionYear);

            const student = new Student({
                firstName,
                lastName,
                email: universityEmail,
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
                password: studentPassword
            });

            await student.save();

            // Send credentials email (non-blocking - don't fail bulk operation if email fails)
            try {
                await sendCredentialsEmail({
                    recipientEmail: personalMail,
                    firstName,
                    lastName,
                    universityEmail,
                    password: studentPassword,
                    userType: 'Student'
                });
            } catch (emailError) {
                console.error(`Warning: Failed to send email for ${firstName} ${lastName}:`, emailError.message);
            }

            results.success.push({
                row: rowNumber,
                name: `${firstName} ${lastName}`,
                email: universityEmail,
                rollNo,
                registrationNumber,
                message: "Student created and credentials email sent"
            });

        } catch (error) {
            results.failed.push({
                row: rowNumber,
                name: `${studentData.firstName || ''} ${studentData.lastName || ''}`.trim() || 'Unknown',
                email: studentData.personalMail || studentData.email || 'N/A',
                error: error.message
            });
        }
    }

    return res.status(200).json(
        new ApiResponse(
            200,
            {
                total: students.length,
                successCount: results.success.length,
                failedCount: results.failed.length,
                success: results.success,
                failed: results.failed
            },
            `Bulk upload completed: ${results.success.length} succeeded, ${results.failed.length} failed`
        )
    );
});

// Forgot Password - Send OTP
export const forgotPassword = asyncHandler(async (req, res) => {
    const { email } = req.body;

    if (!email) {
        throw new ApiError(400, "Email is required");
    }

    // Check if admin exists
    const admin = await Admin.findOne({ email: email.toLowerCase() });
    if (!admin) {
        throw new ApiError(404, "Admin not found with this email");
    }

    // Generate and store OTP
    const otp = generateOTP();
    storeOTP(email, otp);

    // Send OTP via email
    await sendOTPEmail(email, otp);

    res.status(200).json(
        new ApiResponse(200, {}, "OTP sent successfully to your email")
    );
});

// Verify OTP
export const verifyPasswordResetOTP = asyncHandler(async (req, res) => {
    const { email, otp } = req.body;

    if (!email || !otp) {
        throw new ApiError(400, "Email and OTP are required");
    }

    // Verify OTP
    const verification = verifyOTP(email, otp);
    if (!verification.valid) {
        throw new ApiError(400, verification.message);
    }

    res.status(200).json(
        new ApiResponse(200, {}, "OTP verified successfully")
    );
});

// Reset Password
export const resetPassword = asyncHandler(async (req, res) => {
    const { email, otp, newPassword } = req.body;

    if (!email || !otp || !newPassword) {
        throw new ApiError(400, "Email, OTP, and new password are required");
    }

    // Verify OTP again
    const verification = verifyOTP(email, otp);
    if (!verification.valid) {
        throw new ApiError(400, verification.message);
    }

    // Find admin and update password
    const admin = await Admin.findOne({ email: email.toLowerCase() });
    if (!admin) {
        throw new ApiError(404, "Admin not found");
    }

    admin.password = newPassword;
    await admin.save();

    // Clear OTP
    clearOTP(email);

    res.status(200).json(
        new ApiResponse(200, {}, "Password reset successfully")
    );
});