import asyncHandler from "../utils/asyncHandler.js";
import ApiResponse from "../utils/ApiResponse.js";
import ApiError from "../utils/ApiError.js";
import { Course } from "../models/course.model.js";
import { RegistrationForm, StudentRegistration } from "../models/registrationForm.model.js";

// ADMIN: Create a registration form (draft) and attach courses auto by dept+sem
export const adminCreateRegistrationForm = asyncHandler(async (req, res) => {
  const { departmentId, departmentCode, semester, session, opensAt, closesAt, title, attachedCourses } = req.body || {};

  if (!semester) throw new ApiError(400, "semester is required");
  if (!session) throw new ApiError(400, "session is required");

  // Determine numeric departmentId if not provided, using a centralized mapping for codes
  let deptIdNumeric = (departmentId || departmentId === 0) ? Number(departmentId) : null;
  if ((deptIdNumeric === null || Number.isNaN(deptIdNumeric)) && departmentCode) {
    const deptCodeToId = { CSE: 1, EE: 2, ME: 3, CE: 4, ECE: 5 };
    deptIdNumeric = deptCodeToId[departmentCode] ?? null;
  }

  // Try to load courses from DB; if none, proceed with empty and allow attachedCourses fallback
  const dbQuery = { semester: Number(semester) };
  if (deptIdNumeric !== null) dbQuery.departmentId = Number(deptIdNumeric);
  const courses = await Course.find(dbQuery)
    .sort({ code: 1 })
    .select({ _id: 1 });

  // Sanitize attachedCourses from payload if provided (no DB creation)
  const safeAttached = Array.isArray(attachedCourses)
    ? attachedCourses
        .filter((c) => c && (c.code || c.name))
        .map((c) => ({
          code: String(c.code || ""),
          name: String(c.name || ""),
          credits: Number.isFinite(Number(c.credits)) ? Number(c.credits) : 0,
        }))
    : [];

  const form = await RegistrationForm.create({
    docType: 'form',
    title: title || `Semester ${semester} Registration (${session})`,
    departmentId: deptIdNumeric !== null ? Number(deptIdNumeric) : null,
    departmentCode: departmentCode || null,
    semester: Number(semester),
    session: String(session),
    courses: courses.map((c) => c._id),
    attachedCourses: safeAttached,
    published: false,
    opensAt: opensAt ? new Date(opensAt) : null,
    closesAt: closesAt ? new Date(closesAt) : null,
    createdBy: req.user?._id || null,
  });

  return res.status(201).json(new ApiResponse(201, { form }, "Registration form created (draft)"));
});

// ADMIN: Publish a draft form
export const adminPublishRegistrationForm = asyncHandler(async (req, res) => {
  const { id } = req.params;
  if (!id) throw new ApiError(400, "Form id is required");

  const form = await RegistrationForm.findOneAndUpdate(
    { _id: id, docType: 'form' },
    { $set: { published: true } },
    { new: true }
  );

  if (!form) throw new ApiError(404, "Form not found");
  return res.status(200).json(new ApiResponse(200, { form }, "Registration form published"));
});

// ADMIN: List forms (optional filters)
export const adminListRegistrationForms = asyncHandler(async (req, res) => {
  const { departmentId, semester, session, published } = req.query || {};
  const filter = { docType: 'form' };
  if (departmentId) filter.departmentId = Number(departmentId);
  if (semester) filter.semester = Number(semester);
  if (session) filter.session = String(session);
  if (published !== undefined) filter.published = String(published) === "true";

  const forms = await RegistrationForm.find(filter).sort({ createdAt: -1 });
  return res.status(200).json(new ApiResponse(200, { forms }, "Forms fetched"));
});

// STUDENT: List my applicable forms (by semester, active window)
export const studentListMyRegistrationForms = asyncHandler(async (req, res) => {
  const student = req.user;
  if (!student) throw new ApiError(401, "Unauthorized");

  const now = new Date();
  const baseForms = await RegistrationForm.find({
    published: true,
    semester: Number(student.semester),
    $and: [
      { $or: [{ opensAt: null }, { opensAt: { $lte: now } }] },
      { $or: [{ closesAt: null }, { closesAt: { $gte: now } }] },
    ],
  })
    .sort({ createdAt: -1 })
    .lean();

  // Exclude forms already submitted by this student
  const submitted = await StudentRegistration.find({ student: student._id })
    .select({ form: 1, _id: 0 })
    .lean();
  const submittedIds = new Set(submitted.map((s) => String(s.form)));
  const forms = baseForms.filter((f) => !submittedIds.has(String(f._id)));

  return res.status(200).json(new ApiResponse(200, { forms }, "Available forms fetched"));
});

// STUDENT: Get a form by id (published only)
export const studentGetRegistrationForm = asyncHandler(async (req, res) => {
  const { id } = req.params;
  if (!id) throw new ApiError(400, "Form id is required");

  const form = await RegistrationForm.findOne({ _id: id, docType: 'form', published: true }).populate("courses");
  if (!form) throw new ApiError(404, "Form not found or not published");

  return res.status(200).json(new ApiResponse(200, { form }, "Form details"));
});

// STUDENT: Submit registration (no course selection; submit as-is from form)
export const studentSubmitRegistration = asyncHandler(async (req, res) => {
  const { id } = req.params; // form id
  if (!id) throw new ApiError(400, "Form id is required");

  const student = req.user;
  if (!student) throw new ApiError(401, "Unauthorized");

  const now = new Date();
  const form = await RegistrationForm.findOne({
    _id: id,
    published: true,
    $and: [
      { $or: [{ opensAt: null }, { opensAt: { $lte: now } }] },
      { $or: [{ closesAt: null }, { closesAt: { $gte: now } }] },
    ],
  }).lean();
  if (!form) throw new ApiError(404, "Form not found or not published");

  // Prevent duplicate submission
  const existing = await StudentRegistration.findOne({ form: form._id, student: student._id });
  if (existing) {
    return res
      .status(200)
      .json(new ApiResponse(200, { registration: existing }, "Already submitted"));
  }

  const registration = await StudentRegistration.create({
    docType: 'submission',
    form: form._id,
    student: student._id,
    departmentId: form.departmentId,
    semester: form.semester,
    session: form.session,
    courses: Array.isArray(form.courses) ? form.courses : [],
    attachedCourses: Array.isArray(form.attachedCourses) ? form.attachedCourses : [],
    status: "submitted",
    submittedAt: new Date(),
  });

  return res.status(201).json(new ApiResponse(201, { registration }, "Registration submitted"));
});

// STUDENT: My registrations
export const studentListMyRegistrations = asyncHandler(async (req, res) => {
  const student = req.user;
  if (!student) throw new ApiError(401, "Unauthorized");

  const regs = await StudentRegistration.find({ student: student._id, docType: 'submission' })
    .populate({ path: "form", select: "title semester session departmentId" })
    .sort({ createdAt: -1 });

  return res.status(200).json(new ApiResponse(200, { registrations: regs }, "My registrations"));
});

// ADMIN: List submissions for a specific form
export const adminListFormSubmissions = asyncHandler(async (req, res) => {
  const { id } = req.params; // form id
  if (!id) throw new ApiError(400, "Form id is required");

  const subs = await StudentRegistration.find({ form: id, docType: 'submission' })
    .populate({ path: "student", select: "firstName lastName email rollNo semester branch" })
    .sort({ createdAt: -1 });

  return res.status(200).json(new ApiResponse(200, { submissions: subs }, "Form submissions fetched"));
});

// ADMIN: List all registrations with optional filters
export const adminListAllRegistrations = asyncHandler(async (req, res) => {
  const { departmentId, semester, session, formId } = req.query || {};
  const filter = { docType: 'submission' };
  if (formId) filter.form = formId;
  if (departmentId) filter.departmentId = Number(departmentId);
  if (semester) filter.semester = Number(semester);
  if (session) filter.session = String(session);

  const regs = await StudentRegistration.find(filter)
    .populate({ path: "student", select: "firstName lastName email rollNo semester branch" })
    .populate({ path: "form", select: "title semester session departmentId" })
    .sort({ createdAt: -1 });

  return res.status(200).json(new ApiResponse(200, { registrations: regs }, "Registrations fetched"));
});
