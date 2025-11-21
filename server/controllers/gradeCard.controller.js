import asyncHandler from "../utils/asyncHandler.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import { GradeCard } from "../models/gradeCard.model.js";
import { Student } from "../models/student.model.js";
import { Faculty } from "../models/faculty.model.js";
import { Course } from "../models/course.model.js";

// Get all grade cards for a student
const getStudentGradeCards = asyncHandler(async (req, res) => {
    const { studentId } = req.params;

    const student = await Student.findById(studentId);
    if (!student) {
        throw new ApiError(404, "Student not found");
    }

    const gradeCards = await GradeCard.find({ student: studentId })
        .sort({ semester: 1 })
        .populate('student', 'firstName lastName rollNo enrollmentNo program branch');

    return res.status(200).json(
        new ApiResponse(200, { gradeCards }, "Grade cards retrieved successfully")
    );
});

// Get specific semester grade card for a student
const getStudentSemesterGradeCard = asyncHandler(async (req, res) => {
    const { studentId, semester } = req.params;

    const student = await Student.findById(studentId);
    if (!student) {
        throw new ApiError(404, "Student not found");
    }

    const gradeCard = await GradeCard.findOne({
        student: studentId,
        semester: parseInt(semester)
    }).populate('student', 'firstName lastName rollNo enrollmentNo program branch');

    if (!gradeCard) {
        throw new ApiError(404, "Grade card not found for this semester");
    }

    return res.status(200).json(
        new ApiResponse(200, { gradeCard }, "Grade card retrieved successfully")
    );
});

// Get grade cards for authenticated student
const getMyGradeCards = asyncHandler(async (req, res) => {
    const studentId = req.user._id;

    const gradeCards = await GradeCard.find({ student: studentId })
        .sort({ semester: 1 })
        .populate('student', 'firstName lastName rollNo enrollmentNo program branch');

    // Calculate CGPA
    let totalWeightedPoints = 0;
    let totalCreditsEarned = 0;

    gradeCards.forEach(card => {
        totalWeightedPoints += card.sgpa * card.creditsEarned;
        totalCreditsEarned += card.creditsEarned;
    });

    const cgpa = totalCreditsEarned > 0 ? +(totalWeightedPoints / totalCreditsEarned).toFixed(2) : 0;

    return res.status(200).json(
        new ApiResponse(200, {
            gradeCards,
            cgpa,
            totalCreditsEarned
        }, "Grade cards retrieved successfully")
    );
});

// Create or update grade card (Admin only)
const createOrUpdateGradeCard = asyncHandler(async (req, res) => {
    const { studentId } = req.params;
    const {
        semester,
        academicYear,
        subjects,
        examType = 'Regular'
    } = req.body;

    // Validate student exists
    const student = await Student.findById(studentId);
    if (!student) {
        throw new ApiError(404, "Student not found");
    }

    // Validate required fields
    if (!semester || !academicYear || !subjects || !Array.isArray(subjects)) {
        throw new ApiError(400, "Semester, academic year, and subjects array are required");
    }

    // Validate subjects data
    const validSubjects = subjects.map(subject => {
        if (!subject.code || !subject.name || !subject.type || subject.credits === undefined) {
            throw new ApiError(400, "Each subject must have code, name, type, and credits");
        }

        // Calculate total marks
        const total = (subject.internal || 0) + (subject.external || 0);

        // Determine grade and grade point based on total
        let grade = 'F';
        let gradePoint = 0;
        let status = 'Fail';

        if (total >= 90) {
            grade = 'A+';
            gradePoint = 10;
            status = 'Pass';
        } else if (total >= 80) {
            grade = 'A';
            gradePoint = 9;
            status = 'Pass';
        } else if (total >= 70) {
            grade = 'B+';
            gradePoint = 8;
            status = 'Pass';
        } else if (total >= 60) {
            grade = 'B';
            gradePoint = 7;
            status = 'Pass';
        } else if (total >= 50) {
            grade = 'C+';
            gradePoint = 6;
            status = 'Pass';
        } else if (total >= 40) {
            grade = 'C';
            gradePoint = 5;
            status = 'Pass';
        } else if (total >= 35) {
            grade = 'D';
            gradePoint = 4;
            status = 'Pass';
        } else {
            grade = 'F';
            gradePoint = 0;
            status = 'Fail';
        }

        return {
            code: subject.code,
            name: subject.name,
            type: subject.type,
            credits: subject.credits,
            internal: subject.internal || 0,
            external: subject.external || 0,
            total,
            grade,
            gradePoint,
            status: subject.status || status
        };
    });

    // Check if grade card already exists
    let gradeCard = await GradeCard.findOne({
        student: studentId,
        semester: parseInt(semester)
    });

    if (gradeCard) {
        // Update existing grade card
        gradeCard.academicYear = academicYear;
        gradeCard.subjects = validSubjects;
        gradeCard.examType = examType;
        gradeCard.resultDeclaredOn = new Date();

        await gradeCard.save();
    } else {
        // Create new grade card
        gradeCard = new GradeCard({
            student: studentId,
            semester: parseInt(semester),
            academicYear,
            subjects: validSubjects,
            examType,
            resultDeclaredOn: new Date()
        });

        await gradeCard.save();

        // Add reference to student
        await Student.findByIdAndUpdate(
            studentId,
            { $push: { gradeCard: gradeCard._id } },
            { new: true }
        );
    }

    const populatedGradeCard = await GradeCard.findById(gradeCard._id)
        .populate('student', 'firstName lastName rollNo enrollmentNo program branch');

    return res.status(200).json(
        new ApiResponse(200, { gradeCard: populatedGradeCard },
            gradeCard.isNew ? "Grade card created successfully" : "Grade card updated successfully"
        )
    );
});

// Delete grade card (Admin only)
const deleteGradeCard = asyncHandler(async (req, res) => {
    const { gradeCardId } = req.params;

    const gradeCard = await GradeCard.findById(gradeCardId);
    if (!gradeCard) {
        throw new ApiError(404, "Grade card not found");
    }

    // Remove reference from student
    await Student.findByIdAndUpdate(
        gradeCard.student,
        { $pull: { gradeCard: gradeCardId } }
    );

    // Delete grade card
    await GradeCard.findByIdAndDelete(gradeCardId);

    return res.status(200).json(
        new ApiResponse(200, {}, "Grade card deleted successfully")
    );
});

// Get all students with their latest CGPA (Admin view)
const getAllStudentsWithGrades = asyncHandler(async (req, res) => {
    const { page = 1, limit = 20, branch, semester } = req.query;

    // Build match criteria
    let matchCriteria = {};
    if (branch) {
        matchCriteria.branch = branch;
    }
    if (semester) {
        matchCriteria.semester = parseInt(semester);
    }

    const students = await Student.aggregate([
        { $match: matchCriteria },
        {
            $lookup: {
                from: 'gradecards',
                localField: 'gradeCard',
                foreignField: '_id',
                as: 'gradeCards'
            }
        },
        {
            $addFields: {
                cgpa: {
                    $cond: {
                        if: { $gt: [{ $size: "$gradeCards" }, 0] },
                        then: {
                            $divide: [
                                {
                                    $sum: {
                                        $map: {
                                            input: "$gradeCards",
                                            as: "card",
                                            in: { $multiply: ["$$card.sgpa", "$$card.creditsEarned"] }
                                        }
                                    }
                                },
                                {
                                    $sum: "$gradeCards.creditsEarned"
                                }
                            ]
                        },
                        else: 0
                    }
                },
                totalCredits: { $sum: "$gradeCards.creditsEarned" },
                semestersCompleted: { $size: "$gradeCards" }
            }
        },
        {
            $project: {
                firstName: 1,
                lastName: 1,
                rollNo: 1,
                enrollmentNo: 1,
                program: 1,
                branch: 1,
                semester: 1,
                cgpa: { $round: ["$cgpa", 2] },
                totalCredits: 1,
                semestersCompleted: 1,
                imageUrl: 1
            }
        },
        { $sort: { rollNo: 1 } },
        { $skip: (page - 1) * limit },
        { $limit: parseInt(limit) }
    ]);

    const total = await Student.countDocuments(matchCriteria);

    return res.status(200).json(
        new ApiResponse(200, {
            students,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                pages: Math.ceil(total / limit)
            }
        }, "Students with grades retrieved successfully")
    );
});

// Faculty-specific grade management functions

// Get courses assigned to faculty
const getFacultyAssignedCourses = asyncHandler(async (req, res) => {
    const facultyId = req.user._id;

    const faculty = await Faculty.findById(facultyId)
        .populate('assignedCourses.courseId', 'name code credits semester')
        .select('assignedCourses firstName lastName department');

    if (!faculty) {
        throw new ApiError(404, "Faculty not found");
    }

    // Filter active courses
    const activeCourses = faculty.assignedCourses
        .filter(course => course.isActive)
        .map(course => ({
            _id: course._id,
            courseId: course.courseId._id,
            courseName: course.courseId.name,
            courseCode: course.courseId.code,
            credits: course.courseId.credits,
            semester: course.semester,
            section: course.section,
            batch: course.batch,
            academicYear: course.academicYear
        }));

    return res.status(200).json(
        new ApiResponse(200, { courses: activeCourses }, "Faculty assigned courses retrieved successfully")
    );
});

// Get students for a specific course taught by faculty
const getStudentsForFacultyCourse = asyncHandler(async (req, res) => {
    const facultyId = req.user._id;
    const { courseAssignmentId } = req.params;
    const { page = 1, limit = 50 } = req.query;

    // Verify faculty has this course assignment
    const faculty = await Faculty.findById(facultyId)
        .populate('assignedCourses.courseId', 'name code credits semester');

    if (!faculty) {
        throw new ApiError(404, "Faculty not found");
    }

    const courseAssignment = faculty.assignedCourses.id(courseAssignmentId);
    if (!courseAssignment || !courseAssignment.isActive) {
        throw new ApiError(404, "Course assignment not found or inactive");
    }

    // Find students in the same semester, section, and batch
    const matchCriteria = {
        semester: courseAssignment.semester
    };

    if (courseAssignment.section) {
        matchCriteria.section = courseAssignment.section;
    }
    if (courseAssignment.batch) {
        matchCriteria.batch = courseAssignment.batch;
    }

    const students = await Student.find(matchCriteria)
        .select('firstName lastName rollNo enrollmentNo imageUrl semester section batch')
        .populate({
            path: 'gradeCard',
            match: { semester: courseAssignment.semester },
            populate: {
                path: 'subjects',
                match: { code: courseAssignment.courseId.code }
            }
        })
        .sort({ rollNo: 1 })
        .limit(limit * 1)
        .skip((page - 1) * limit);

    const total = await Student.countDocuments(matchCriteria);

    // Add current subject grade info for each student
    const studentsWithGrades = students.map(student => {
        let subjectGrade = null;
        
        if (student.gradeCard && student.gradeCard.length > 0) {
            const gradeCard = student.gradeCard[0];
            if (gradeCard && gradeCard.subjects) {
                subjectGrade = gradeCard.subjects.find(
                    subject => subject.code === courseAssignment.courseId.code
                );
            }
        }

        return {
            _id: student._id,
            firstName: student.firstName,
            lastName: student.lastName,
            rollNo: student.rollNo,
            enrollmentNo: student.enrollmentNo,
            imageUrl: student.imageUrl,
            semester: student.semester,
            section: student.section,
            batch: student.batch,
            currentGrade: subjectGrade
        };
    });

    return res.status(200).json(
        new ApiResponse(200, {
            students: studentsWithGrades,
            course: {
                name: courseAssignment.courseId.name,
                code: courseAssignment.courseId.code,
                credits: courseAssignment.courseId.credits,
                semester: courseAssignment.semester,
                section: courseAssignment.section,
                batch: courseAssignment.batch,
                academicYear: courseAssignment.academicYear
            },
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                pages: Math.ceil(total / limit)
            }
        }, "Students for course retrieved successfully")
    );
});

// Update subject grades for students in faculty's course
const updateSubjectGradesByFaculty = asyncHandler(async (req, res) => {
    const facultyId = req.user._id;
    const { courseAssignmentId } = req.params;
    const { studentGrades, academicYear } = req.body;

    if (!Array.isArray(studentGrades) || studentGrades.length === 0) {
        throw new ApiError(400, "Student grades array is required");
    }

    // Verify faculty has this course assignment
    const faculty = await Faculty.findById(facultyId)
        .populate('assignedCourses.courseId', 'name code credits semester');

    if (!faculty) {
        throw new ApiError(404, "Faculty not found");
    }

    const courseAssignment = faculty.assignedCourses.id(courseAssignmentId);
    if (!courseAssignment || !courseAssignment.isActive) {
        throw new ApiError(404, "Course assignment not found or inactive");
    }

    const course = courseAssignment.courseId;
    const semester = courseAssignment.semester;
    const defaultAcademicYear = academicYear || courseAssignment.academicYear || 
        `${new Date().getFullYear()}-${new Date().getFullYear() + 1}`;

    const results = [];
    const errors = [];

    // Process each student's grade
    for (const gradeData of studentGrades) {
        try {
            const { studentId, internal = 0, external = 0 } = gradeData;

            if (!studentId) {
                errors.push({ studentId: 'unknown', error: 'Student ID is required' });
                continue;
            }

            // Verify student exists
            const student = await Student.findById(studentId);
            if (!student) {
                errors.push({ studentId, error: 'Student not found' });
                continue;
            }

            // Calculate grade
            const total = (parseInt(internal) || 0) + (parseInt(external) || 0);
            let grade = 'F';
            let gradePoint = 0;
            let status = 'Fail';

            if (total >= 90) { grade = 'A+'; gradePoint = 10; status = 'Pass'; }
            else if (total >= 80) { grade = 'A'; gradePoint = 9; status = 'Pass'; }
            else if (total >= 70) { grade = 'B+'; gradePoint = 8; status = 'Pass'; }
            else if (total >= 60) { grade = 'B'; gradePoint = 7; status = 'Pass'; }
            else if (total >= 50) { grade = 'C+'; gradePoint = 6; status = 'Pass'; }
            else if (total >= 40) { grade = 'C'; gradePoint = 5; status = 'Pass'; }
            else if (total >= 35) { grade = 'D'; gradePoint = 4; status = 'Pass'; }

            const subjectData = {
                code: course.code,
                name: course.name,
                type: 'Theory', // Default, could be made configurable
                credits: course.credits,
                internal: parseInt(internal) || 0,
                external: parseInt(external) || 0,
                total,
                grade,
                gradePoint,
                status
            };

            // Find or create grade card for this semester
            let gradeCard = await GradeCard.findOne({
                student: studentId,
                semester: semester
            });

            if (gradeCard) {
                // Update existing subject or add new one
                const existingSubjectIndex = gradeCard.subjects.findIndex(
                    subject => subject.code === course.code
                );

                if (existingSubjectIndex !== -1) {
                    gradeCard.subjects[existingSubjectIndex] = subjectData;
                } else {
                    gradeCard.subjects.push(subjectData);
                }

                gradeCard.academicYear = defaultAcademicYear;
                gradeCard.resultDeclaredOn = new Date();
            } else {
                // Create new grade card
                gradeCard = new GradeCard({
                    student: studentId,
                    semester: semester,
                    academicYear: defaultAcademicYear,
                    subjects: [subjectData],
                    resultDeclaredOn: new Date()
                });
            }

            await gradeCard.save();

            // Add reference to student if new grade card
            if (!gradeCard.student || !student.gradeCard.includes(gradeCard._id)) {
                await Student.findByIdAndUpdate(
                    studentId,
                    { $addToSet: { gradeCard: gradeCard._id } }
                );
            }

            results.push({
                studentId,
                studentName: `${student.firstName} ${student.lastName}`,
                rollNo: student.rollNo,
                grade: subjectData.grade,
                total: subjectData.total,
                status: 'updated'
            });

        } catch (error) {
            errors.push({
                studentId: gradeData.studentId || 'unknown',
                error: error.message
            });
        }
    }

    return res.status(200).json(
        new ApiResponse(200, {
            results,
            errors,
            courseInfo: {
                name: course.name,
                code: course.code,
                semester: semester
            },
            summary: {
                total: studentGrades.length,
                successful: results.length,
                failed: errors.length
            }
        }, "Student grades updated successfully")
    );
});

export {
    getStudentGradeCards,
    getStudentSemesterGradeCard,
    getMyGradeCards,
    createOrUpdateGradeCard,
    deleteGradeCard,
    getAllStudentsWithGrades,
    getFacultyAssignedCourses,
    getStudentsForFacultyCourse,
    updateSubjectGradesByFaculty
};