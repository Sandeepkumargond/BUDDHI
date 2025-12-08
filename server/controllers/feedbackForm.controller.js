import mongoose from "mongoose";
import { FeedbackForm } from "../models/feedbackForm.model.js";
import { FeedbackSubmission } from "../models/feedbackSubmission.model.js";
import { MonthlyAttendance } from "../models/monthlyAttendance.model.js";
import asyncHandler from "../utils/asyncHandler.js";
import ApiResponse from "../utils/ApiResponse.js";
import ApiError from "../utils/ApiError.js";

// Create feedback form
export const createFeedbackForm = asyncHandler(async (req, res) => {
  const { title, description, department, branch, batch, semester, section, academicYear, startDate, endDate, questions } = req.body;

  if (!title || !department || !batch || !semester || !academicYear || !startDate || !endDate || !questions || questions.length === 0) {
    throw new ApiError(400, "Missing required fields for feedback form");
  }

  const feedbackForm = await FeedbackForm.create({
    title,
    description,
    department,
    branch,
    batch,
    semester,
    section,
    academicYear,
    startDate,
    endDate,
    questions,
    createdBy: req.user?._id,
  });

  res.status(201).json(new ApiResponse(201, feedbackForm, "Feedback form created successfully"));
});

// Get all feedback forms
export const getAllFeedbackForms = asyncHandler(async (req, res) => {
  const { status, department, batch, semester, academicYear, page = 1, limit = 10 } = req.query;
  const skip = (page - 1) * limit;

  const query = {};
  if (status) query.status = status;
  if (department) query.department = department;
  if (batch) query.batch = batch;
  if (semester) query.semester = Number(semester);
  if (academicYear) query.academicYear = academicYear;

  const forms = await FeedbackForm.find(query)
    .populate("createdBy", "firstName lastName email")
    .skip(skip)
    .limit(limit)
    .sort({ createdAt: -1 });

  const total = await FeedbackForm.countDocuments(query);

  res.status(200).json(new ApiResponse(200, { forms, total, page, limit }, "Feedback forms retrieved successfully"));
});

// Get feedback form by ID
export const getFeedbackFormById = asyncHandler(async (req, res) => {
  const { formId } = req.params;

  const form = await FeedbackForm.findById(formId).populate("createdBy", "firstName lastName email");

  if (!form) {
    throw new ApiError(404, "Feedback form not found");
  }

  res.status(200).json(new ApiResponse(200, form, "Feedback form retrieved successfully"));
});

// Get feedback forms for a student (based on their enrollment)
export const getFeedbackFormsForStudent = asyncHandler(async (req, res) => {
  const studentId = req.user?._id;

  if (!studentId) {
    throw new ApiError(401, "Unauthorized - Student ID required");
  }

  // Get student's details from their profile
  const { semester, section, batch, branch } = req.user;

  // Use query params as fallback/override
  const querySem = req.query.semester ? Number(req.query.semester) : semester;
  const querySec = req.query.section || section;
  const queryBatch = req.query.batch || batch;
  const queryDept = req.query.department || branch;

  console.log("Student Enrollment Details:", { 
    studentId: studentId.toString(),
    querySem, 
    querySec, 
    queryBatch, 
    queryDept,
  });

  if (!queryDept || !queryBatch || !querySem) {
    throw new ApiError(400, "Department/branch, batch, and semester information not found. Please contact admin.");
  }

  const currentYear = new Date().getFullYear().toString();

  // Step 1: Find base feedback forms for this department/batch/semester/section
  const baseFormQuery = {
    status: "active",
    academicYear: currentYear,
    semester: querySem,
  };

  // Department matching
  baseFormQuery.$or = [
    { department: queryDept },
    { department: { $regex: queryDept, $options: "i" } },
    { branch: queryDept },
    { branch: { $regex: queryDept, $options: "i" } },
  ];

  // Batch matching
  baseFormQuery.batch = { $regex: queryBatch.replace(/-/g, "").substring(0, 4), $options: "i" };

  // Section filtering - match null/empty or specific section
  if (querySec) {
    baseFormQuery.$and = [
      {
        $or: [
          { section: null },
          { section: "" },
          { section: querySec },
          { section: { $regex: querySec, $options: "i" } },
        ],
      },
    ];
  } else {
    baseFormQuery.$or = baseFormQuery.$or || [];
    baseFormQuery.$or.push({ section: null });
    baseFormQuery.$or.push({ section: "" });
  }

  console.log("Base form query:", JSON.stringify(baseFormQuery, null, 2));

  const baseForms = await FeedbackForm.find(baseFormQuery);
  console.log("Base forms found:", baseForms.length);

  if (baseForms.length === 0) {
    return res.status(200).json(
      new ApiResponse(200, { forms: [], debug: { querySem, querySec, queryBatch, queryDept, message: "No feedback forms created for this batch/semester/section yet" } }, "No feedback forms available")
    );
  }

  // Step 2: Get all courses taught in this semester/section
  // Query monthlyAttendance to find all faculty-course combinations for this semester/section
  const currentMonth = new Date().getMonth() + 1;
  const currentYearNum = new Date().getFullYear();

  const courseTeachings = await MonthlyAttendance.find({
    semester: querySem,
    section: querySec || { $in: [null, ""] }, // Match null/empty or specific section
    batch: { $regex: queryBatch.replace(/-/g, "").substring(0, 4), $options: "i" },
  })
    .select('courseId courseName courseCode facultyId')
    .populate('facultyId', 'firstName lastName')
    .lean();

  // Remove duplicates - keep unique course-faculty combinations
  const uniqueCourses = {};
  courseTeachings.forEach(ct => {
    const facultyIdStr = ct.facultyId?._id?.toString() || ct.facultyId?.toString() || ct.facultyId;
    const courseIdStr = ct.courseId?.toString() || ct.courseId;
    const key = `${courseIdStr}_${facultyIdStr}`;
    if (!uniqueCourses[key]) {
      uniqueCourses[key] = {
        courseId: courseIdStr,
        courseName: ct.courseName,
        courseCode: ct.courseCode,
        facultyId: facultyIdStr,  // Store as string
        facultyName: ct.facultyId ? `${ct.facultyId.firstName} ${ct.facultyId.lastName}` : "Unknown",
      };
    }
  });

  const uniqueCoursesList = Object.values(uniqueCourses);
  console.log("Unique courses found for this semester/section:", uniqueCoursesList.length);
  console.log("Courses:", uniqueCoursesList);

  // Step 3: Replicate each base form for each course taught in that semester/section
  let replicatedForms = [];

  for (const baseForm of baseForms) {
    for (const courseTeaching of uniqueCoursesList) {
      // Create a replica of the base form with course and faculty details
      const replicatedForm = {
        ...baseForm.toObject(),
        // Override with specific course and faculty info
        courseId: courseTeaching.courseId,
        courseName: courseTeaching.courseName,
        courseCode: courseTeaching.courseCode,
        facultyId: courseTeaching.facultyId,
        facultyName: courseTeaching.facultyName,
        // Create unique ID for submission tracking: baseFormId---courseId---facultyId (using --- as separator to avoid encoding)
        _id: `${baseForm._id}---${courseTeaching.courseId}---${courseTeaching.facultyId}`,
        baseFormId: baseForm._id, // Keep reference to original form
      };

      replicatedForms.push(replicatedForm);
    }
  }

  console.log("Total replicated forms:", replicatedForms.length);

  // Step 4: Check which forms the student has already completed
  const submissions = await FeedbackSubmission.find({ studentId });
  const completedFormMap = new Set();
  
  submissions.forEach(sub => {
    // Check if submission matches based on form and course-faculty combo
    completedFormMap.add(`${sub.formId}---${sub.courseId}---${sub.facultyId}`);
    completedFormMap.add(`${sub.formId}`); // Also keep base form ID for backward compatibility
  });

  // Step 5: Add completion status and group by subject
  const formsWithStatus = replicatedForms.map((form) => {
    const compositeKey = `${form.baseFormId}---${form.courseId}---${form.facultyId}`;
    const isCompleted = completedFormMap.has(compositeKey) || completedFormMap.has(form.baseFormId?.toString());
    
    return {
      ...form,
      completed: isCompleted,
    };
  });

  // Group by faculty
  const groupedByFaculty = {};
  formsWithStatus.forEach(form => {
    const facultyId = form.facultyId?.toString() || form._id.toString(); // Use faculty ID or form ID as fallback
    const key = facultyId;
    if (!groupedByFaculty[key]) {
      groupedByFaculty[key] = {
        facultyId: form.facultyId,
        facultyName: form.facultyName,
        forms: [],
      };
    }
    groupedByFaculty[key].forms.push(form);
  });

  const formsGrouped = Object.values(groupedByFaculty);

  res.status(200).json(
    new ApiResponse(200, { forms: formsGrouped, debug: { querySem, querySec, queryBatch, queryDept, totalCourses: uniqueCoursesList.length, totalReplicatedForms: replicatedForms.length } }, "Feedback forms retrieved successfully")
  );
});

// Get a single feedback form for student (handles both regular and replicated form IDs)
export const getFeedbackFormForStudent = asyncHandler(async (req, res) => {
  const { formId } = req.params;
  const studentId = req.user?._id;

  if (!studentId) {
    throw new ApiError(401, "Unauthorized - Student ID required");
  }

  // The formId could be:
  // 1. A composite ID: baseFormId---courseId---facultyId (from replicated forms)
  // 2. A regular form ID: actual MongoDB ObjectId
  
  let baseFormId = formId;
  let courseId = null;
  let facultyId = null;

  // If formId contains ---, it's a composite ID from replicated forms
  if (typeof formId === 'string' && formId.includes('---')) {
    const parts = formId.split('---');
    baseFormId = parts[0];
    courseId = parts[1];
    facultyId = parts[2];
  }

  // Fetch the base form
  const form = await FeedbackForm.findById(baseFormId);

  if (!form) {
    throw new ApiError(404, "Feedback form not found");
  }

  // If this was a composite ID, add course and faculty info back
  let responseForm = form.toObject();
  if (courseId && facultyId) {
    responseForm.courseId = courseId;
    responseForm.facultyId = facultyId;
    responseForm._id = formId; // Keep the composite ID
  }

  res.status(200).json(new ApiResponse(200, { form: responseForm }, "Feedback form retrieved successfully"));
});

// Update feedback form
export const updateFeedbackForm = asyncHandler(async (req, res) => {
  const { formId } = req.params;
  const { title, description, startDate, endDate, questions, status } = req.body;

  const form = await FeedbackForm.findByIdAndUpdate(
    formId,
    { title, description, startDate, endDate, questions, status },
    { new: true, runValidators: true }
  );

  if (!form) {
    throw new ApiError(404, "Feedback form not found");
  }

  res.status(200).json(new ApiResponse(200, form, "Feedback form updated successfully"));
});

// Delete feedback form
export const deleteFeedbackForm = asyncHandler(async (req, res) => {
  const { formId } = req.params;

  const form = await FeedbackForm.findByIdAndDelete(formId);

  if (!form) {
    throw new ApiError(404, "Feedback form not found");
  }

  res.status(200).json(new ApiResponse(200, {}, "Feedback form deleted successfully"));
});

// Activate feedback form
export const activateFeedbackForm = asyncHandler(async (req, res) => {
  const { formId } = req.params;

  const form = await FeedbackForm.findByIdAndUpdate(formId, { status: "active" }, { new: true });

  if (!form) {
    throw new ApiError(404, "Feedback form not found");
  }

  res.status(200).json(new ApiResponse(200, form, "Feedback form activated successfully"));
});

// Close feedback form
export const closeFeedbackForm = asyncHandler(async (req, res) => {
  const { formId } = req.params;

  const form = await FeedbackForm.findByIdAndUpdate(formId, { status: "closed" }, { new: true });

  if (!form) {
    throw new ApiError(404, "Feedback form not found");
  }

  res.status(200).json(new ApiResponse(200, form, "Feedback form closed successfully"));
});

// Submit feedback for a form
export const submitFeedbackForm = asyncHandler(async (req, res) => {
  const { formId, responses, courseId, facultyId } = req.body;
  const studentId = req.user?._id;

  console.log("=== FEEDBACK SUBMISSION ===");
  console.log("FormID:", formId);
  console.log("CourseID:", courseId, typeof courseId);
  console.log("FacultyID:", facultyId, typeof facultyId);
  console.log("Responses:", JSON.stringify(responses, null, 2));

  if (!formId || !responses || !Array.isArray(responses)) {
    throw new ApiError(400, "Form ID and responses are required");
  }

  if (!studentId) {
    throw new ApiError(401, "Student ID is required - unauthorized");
  }

  // The formId could be:
  // 1. A composite ID: baseFormId---courseId---facultyId (from replicated forms)
  // 2. A regular form ID: actual MongoDB ObjectId
  
  let baseFormId = formId;
  let submissionCourseId = courseId;
  let submissionFacultyId = facultyId;

  // If formId contains ---, it's a composite ID from replicated forms
  if (typeof formId === 'string' && formId.includes('---')) {
    const parts = formId.split('---');
    baseFormId = parts[0];
    submissionCourseId = parts[1];
    submissionFacultyId = parts[2];
    console.log("Parsed composite ID - Base:", baseFormId, "Course:", submissionCourseId, "Faculty:", submissionFacultyId);
  }

  // Check if base form exists
  const form = await FeedbackForm.findById(baseFormId);
  if (!form) {
    throw new ApiError(404, "Feedback form not found");
  }

  // Check if form is active
  if (form.status !== "active") {
    throw new ApiError(400, "This feedback form is not active");
  }

  // Check if form has expired
  if (new Date() > new Date(form.endDate)) {
    throw new ApiError(400, "This feedback form has expired");
  }

  // For replicated forms, check if student already submitted for this specific course-faculty combo
  // For regular forms, use just formId
  let submissionQuery = { studentId };
  
  if (submissionCourseId && submissionFacultyId) {
    // Validate that submissionCourseId and submissionFacultyId are valid ObjectId strings
    try {
      submissionQuery = {
        formId: baseFormId,
        studentId,
        courseId: submissionCourseId,
        facultyId: submissionFacultyId,
      };
    } catch (e) {
      throw new ApiError(400, "Invalid course or faculty ID format");
    }
  } else {
    submissionQuery.formId = baseFormId;
  }

  const existingSubmission = await FeedbackSubmission.findOne(submissionQuery);

  if (existingSubmission) {
    throw new ApiError(400, "You have already submitted feedback for this form");
  }

  // Create submission with course and faculty info if available
  const submissionData = {
    formId: baseFormId,
    studentId,
    responses,
  };

  // Only add courseId and facultyId if they're provided and are valid strings
  if (submissionCourseId && typeof submissionCourseId === 'string' && submissionCourseId.trim()) {
    submissionData.courseId = submissionCourseId;
  }
  if (submissionFacultyId && typeof submissionFacultyId === 'string' && submissionFacultyId.trim()) {
    submissionData.facultyId = submissionFacultyId;
  }

  const submission = await FeedbackSubmission.create(submissionData);

  res.status(201).json(new ApiResponse(201, submission, "Feedback submitted successfully"));
});

// Get faculty feedback analytics - averages and statistics
export const getFacultyFeedbackAnalytics = asyncHandler(async (req, res) => {
  const { departmentId, facultyId } = req.query;

  let matchStage = { facultyId: { $ne: null } };

  if (facultyId) {
    // Try to match either as ObjectId or string
    matchStage.$or = [
      { facultyId: new mongoose.Types.ObjectId(facultyId) },
      { facultyId: facultyId }
    ];
    delete matchStage.facultyId;
  }

  console.log("[Analytics] Query Stage:", JSON.stringify(matchStage));
  console.log("[Analytics] Admin User ID:", req.user?._id);

  // Fetch all submissions for the specified faculty/faculties
  const submissions = await FeedbackSubmission.find(matchStage).lean();

  console.log(`[Analytics] Found ${submissions.length} feedback submissions`);
  if (submissions.length === 0) {
    console.log("[Analytics] WARNING: No submissions found! Checking total submissions in DB...");
    const totalCount = await FeedbackSubmission.countDocuments();
    console.log(`[Analytics] Total FeedbackSubmission documents in DB: ${totalCount}`);
    if (totalCount > 0) {
      const sample = await FeedbackSubmission.find().limit(1).lean();
      console.log("[Analytics] Sample submission:", JSON.stringify(sample, null, 2));
    }
  }

  // Group submissions by facultyId and calculate analytics in-memory
  const analyticsMap = {};

  submissions.forEach((submission) => {
    const fId = submission.facultyId?.toString() || submission.facultyId;
    
    if (!analyticsMap[fId]) {
      analyticsMap[fId] = {
        facultyId: fId,
        totalSubmissions: 0,
        ratings: [],
        courseIds: new Set(),
      };
    }

    analyticsMap[fId].totalSubmissions += 1;

    // Extract numeric ratings from responses
    if (submission.responses && Array.isArray(submission.responses)) {
      let numericCount = 0;
      submission.responses.forEach((response) => {
        console.log(`Response: answer=${response.answer}, type=${typeof response.answer}`);
        if (typeof response.answer === 'number') {
          analyticsMap[fId].ratings.push(response.answer);
          numericCount++;
        }
      });
      console.log(`Found ${numericCount} numeric ratings in submission ${submission._id}`);
    }

    // Track courses
    if (submission.courseId) {
      analyticsMap[fId].courseIds.add(submission.courseId?.toString() || submission.courseId);
    }
  });

  // Convert to array and calculate averages
  const analytics = Object.values(analyticsMap).map((entry) => {
    const averageRating = entry.ratings.length > 0 
      ? entry.ratings.reduce((a, b) => a + b, 0) / entry.ratings.length 
      : 0;

    return {
      facultyId: entry.facultyId,
      totalSubmissions: entry.totalSubmissions,
      ratingCount: entry.ratings.length,
      averageRating: parseFloat(averageRating.toFixed(2)),
      coursesFeedback: Array.from(entry.courseIds).map(courseId => ({
        courseId,
        courseName: "Unknown",
      })),
    };
  });

  // Sort by average rating
  analytics.sort((a, b) => b.averageRating - a.averageRating);

  // Fetch faculty and course details separately for each analytics entry
  const enrichedAnalytics = await Promise.all(
    analytics.map(async (entry) => {
      let facultyName = "Unknown Faculty";
      let email = "";
      let department = "";

      // Try to find faculty by ID - try both as ObjectId and as string
      try {
        let faculty = null;
        
        // First try as direct ObjectId if it's a valid ObjectId
        if (mongoose.Types.ObjectId.isValid(entry.facultyId)) {
          faculty = await mongoose.model("Faculty").findById(entry.facultyId);
        }
        
        // If not found as ObjectId, try as string ID (could be _id or facultyId field)
        if (!faculty) {
          faculty = await mongoose.model("Faculty").findOne({ 
            $or: [
              { _id: entry.facultyId },
              { facultyId: entry.facultyId }
            ]
          });
        }
        
        if (faculty) {
          facultyName = `${faculty.firstName} ${faculty.lastName}`;
          email = faculty.email;
          department = faculty.department;
        }
      } catch (e) {
        // If not found, keep defaults
        console.error(`Could not find faculty with ID: ${entry.facultyId}`, e.message);
      }

      // Fetch course names for the coursesFeedback array
      const enrichedCourses = await Promise.all(
        entry.coursesFeedback.map(async (courseInfo) => {
          try {
            let courseName = "Unknown Course";
            
            // Try to find course by ID
            if (mongoose.Types.ObjectId.isValid(courseInfo.courseId)) {
              const course = await mongoose.model("Course").findById(courseInfo.courseId);
              if (course) {
                courseName = course.name || course.courseName || "Unknown Course";
              }
            }
            
            return {
              courseId: courseInfo.courseId,
              courseName: courseName,
            };
          } catch (e) {
            return courseInfo;
          }
        })
      );

      return {
        facultyId: entry.facultyId,
        facultyName,
        email,
        department,
        totalSubmissions: entry.totalSubmissions,
        ratingCount: entry.ratingCount,
        coursesFeedback: enrichedCourses,
        averageRating: entry.averageRating,
      };
    })
  );

  console.log(`[Analytics] Returning ${enrichedAnalytics.length} faculty analytics`);
  if (enrichedAnalytics.length > 0) {
    console.log("[Analytics] First entry:", JSON.stringify(enrichedAnalytics[0], null, 2));
  }

  res.status(200).json(
    new ApiResponse(200, { analytics: enrichedAnalytics }, "Faculty feedback analytics retrieved successfully")
  );
});

// Get feedback by faculty - detailed view for a specific faculty
export const getFacultyFeedbackDetails = asyncHandler(async (req, res) => {
  const { facultyId } = req.params;

  if (!facultyId) {
    throw new ApiError(400, "Faculty ID is required");
  }

  // Try to find by facultyId as either ObjectId or string
  const submissions = await FeedbackSubmission.find({
    $or: [
      { facultyId: new mongoose.Types.ObjectId(facultyId) },
      { facultyId: facultyId }
    ]
  })
    .populate("studentId", "name roll email")
    .populate("courseId", "name code")
    .populate("facultyId", "firstName lastName email department")
    .lean()
    .catch(() => []);

  // Calculate statistics
  let totalSubmissions = submissions.length;
  let averageRating = 0;
  let ratingCount = 0;

  const courseStats = {};
  const detailedFeedback = [];

  submissions.forEach((submission) => {
    submission.responses.forEach((response) => {
      // If answer is a number (rating)
      if (typeof response.answer === "number") {
        averageRating += response.answer;
        ratingCount++;
      }
    });

    // Group by course
    if (submission.courseId) {
      if (!courseStats[submission.courseId._id]) {
        courseStats[submission.courseId._id] = {
          courseId: submission.courseId._id,
          courseName: submission.courseId.name,
          courseCode: submission.courseId.code,
          submissions: 0,
          averageRating: 0,
          ratingCount: 0,
        };
      }
      courseStats[submission.courseId._id].submissions++;

      // Calculate per-course average
      submission.responses.forEach((response) => {
        if (typeof response.answer === "number") {
          courseStats[submission.courseId._id].averageRating += response.answer;
          courseStats[submission.courseId._id].ratingCount++;
        }
      });
    }

    detailedFeedback.push({
      studentName: submission.studentId?.name,
      studentRoll: submission.studentId?.roll,
      courseName: submission.courseId?.name,
      submittedAt: submission.submittedAt,
      responses: submission.responses,
    });
  });

  // Calculate final averages
  averageRating = ratingCount > 0 ? (averageRating / ratingCount).toFixed(2) : 0;

  Object.keys(courseStats).forEach((courseId) => {
    const stats = courseStats[courseId];
    stats.averageRating =
      stats.ratingCount > 0 ? (stats.averageRating / stats.ratingCount).toFixed(2) : 0;
  });

  res.status(200).json(
    new ApiResponse(
      200,
      {
        facultyId,
        totalSubmissions,
        averageRating,
        courseStats: Object.values(courseStats),
        detailedFeedback,
      },
      "Faculty feedback details retrieved successfully"
    )
  );
});
