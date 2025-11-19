import asyncHandler from "../utils/asyncHandler.js";
import ApiResponse from "../utils/ApiResponse.js";
import ApiError from "../utils/ApiError.js";
import { AdmitCard } from "../models/admitCard.model.js";
import { Student } from "../models/student.model.js";
import { deptartmentMap } from "../configs/maps.js";
import { uploadImageOnImageKit } from "../utils/ImageKit.js";

// Admin: publish admit card with payload (upsert + set published true and unpublish previous)
export const adminPublishAdmitCard = asyncHandler(async (req, res) => {
  const adminId = req.user?._id;
  // Handle JSON fields possibly sent via multipart/form-data
  const parseMaybeJson = (v) => {
    if (typeof v === 'string') {
      try { return JSON.parse(v); } catch { return v; }
    }
    return v;
  };
  const raw = req.body || {};
  const filters = parseMaybeJson(raw.filters) || {};
  const sessionDetails = parseMaybeJson(raw.sessionDetails) || {};
  let schedule = parseMaybeJson(raw.schedule) || [];
  const coordinatorIn = parseMaybeJson(raw.coordinator) || {};

  const departmentCode = filters.departmentCode || req.body.departmentCode; // support either
  const semester = Number(filters.semester ?? req.body.semester);

  if (!departmentCode) throw new ApiError(400, "departmentCode is required");
  if (!Number.isFinite(semester)) throw new ApiError(400, "semester is required");

  const requiredSessionKeys = ["examType", "session", "examCenter", "centerCode", "reportingTime", "gateClose"];
  const missingSession = requiredSessionKeys.filter((k) => !String(sessionDetails?.[k] || "").trim());
  if (missingSession.length) {
    throw new ApiError(400, `Missing session fields: ${missingSession.join(", ")}`);
  }

  const requiredCoord = ["name", "phone", "email", "office"];
  const missingCoord = requiredCoord.filter((k) => !String(coordinatorIn?.[k] || "").trim());
  if (missingCoord.length) {
    throw new ApiError(400, `Missing coordinator fields: ${missingCoord.join(", ")}`);
  }

  if (!Array.isArray(schedule) || schedule.length === 0) {
    throw new ApiError(400, "Schedule must contain at least one row");
  }
  const invalidRows = schedule.filter((s) => !s?.code || !s?.name || !s?.date || !s?.time);
  if (invalidRows.length) {
    throw new ApiError(400, "All schedule rows must include code, name, date, and time");
  }

  // Optional signature upload via multer temp file and ImageKit
  let signatureUrl;
  if (req.file?.path) {
    const up = await uploadImageOnImageKit(req.file.path, adminId || 'admin');
    if (up && !up.error) signatureUrl = up.url;
  }

  const coordinator = { ...coordinatorIn };
  if (signatureUrl) coordinator.signatureUrl = signatureUrl;

  // Unpublish existing published cards for this dept+sem
  await AdmitCard.updateMany(
    { departmentCode, semester, published: true },
    { $set: { published: false } }
  );

  // Create new card doc
  const doc = await AdmitCard.create({
    departmentCode,
    semester,
    instituteName: req.user?.collegeName || undefined,
    instituteAbbreviation: req.user?.abbreviation || undefined,
    sessionDetails,
    schedule: (schedule || []).map((s) => ({
      courseId: s.courseId || undefined,
      code: s.code,
      name: s.name,
      date: s.date,
      time: s.time,
    })),
    coordinator,
    published: true,
    publishedAt: new Date(),
    createdBy: adminId || undefined,
  });

  return res
    .status(201)
    .json(new ApiResponse(201, { admitCard: doc }, "Admit card published"));
});

// Admin: fetch current published by dept+semester
export const adminGetAdmitCardByDeptSem = asyncHandler(async (req, res) => {
  const { code, semester } = req.params;
  const sem = Number(semester);
  if (!code) throw new ApiError(400, "code is required");
  if (!Number.isFinite(sem)) throw new ApiError(400, "semester is invalid");

  const doc = await AdmitCard.findOne({
    departmentCode: code,
    semester: sem,
    published: true,
  }).sort({ publishedAt: -1, updatedAt: -1 });

  if (!doc) throw new ApiError(404, "No published admit card found");

  return res.status(200).json(new ApiResponse(200, { admitCard: doc }, "Admit card fetched"));
});

// Admin: list admit cards with optional filters
export const adminListAdmitCards = asyncHandler(async (req, res) => {
  const { departmentCode, semester, published } = req.query || {};
  const filter = {};
  if (departmentCode) filter.departmentCode = departmentCode;
  if (semester !== undefined) filter.semester = Number(semester);
  if (published !== undefined) filter.published = String(published) === 'true';

  const cards = await AdmitCard.find(filter).sort({ updatedAt: -1 });
  return res.status(200).json(new ApiResponse(200, { admitCards: cards, count: cards.length }, "Admit cards fetched"));
});

// Admin: delete an admit card by id
export const adminDeleteAdmitCard = asyncHandler(async (req, res) => {
  const { id } = req.params;
  if (!id) throw new ApiError(400, "id is required");
  const doc = await AdmitCard.findById(id);
  if (!doc) throw new ApiError(404, "Admit card not found");
  await doc.deleteOne();
  return res.status(200).json(new ApiResponse(200, { id }, "Admit card deleted"));
});

// Student: fetch my admit card using student auth context
export const studentGetMyAdmitCard = asyncHandler(async (req, res) => {
  const studentId = req.user?._id;
  if (!studentId) throw new ApiError(401, "Unauthorized");

  const me = await Student.findById(studentId).select(
    "firstName lastName enrollmentNo registrationNumber program branch semester dateOfBirth rollNo imageUrl"
  );
  if (!me) throw new ApiError(404, "Student not found");

  const doc = await AdmitCard.findOne({
    departmentCode: me.branch,
    semester: me.semester,
    published: true,
  }).sort({ publishedAt: -1, updatedAt: -1 });

  if (!doc) throw new ApiError(404, "Admit card not available for your semester");

  const courseFullName = `${me.program || ""} - ${deptartmentMap[me.branch] || me.branch}`.trim();

  // Shape data to match client expectations
  const response = {
    student: {
      name: `${me.firstName} ${me.lastName}`,
      rollNo: String(me.rollNo || ""),
      enrolmentNo: String(me.enrollmentNo || ""),
      registrationNo: me.registrationNumber || "",
      course: courseFullName,
      year: undefined, // optional; could be computed from semester
      semester: me.semester,
      dob: me.dateOfBirth ? new Date(me.dateOfBirth).toISOString().slice(0, 10) : "",
      photo: me.imageUrl || "",
    },
    instituteName: doc.instituteName || "",
    instituteAbbreviation: doc.instituteAbbreviation || "",
    session: doc.sessionDetails,
    schedule: doc.schedule,
    coordinator: doc.coordinator,
    instructions: [
      "Bring your College ID & Admit Card compulsorily.",
      "Electronic gadgets are strictly prohibited.",
      "Reach the center at least 30 minutes before reporting time.",
      "Follow seating plan displayed at the exam center.",
      "Avoid any unfair means — strict action will be taken.",
    ],
  };

  return res.status(200).json(new ApiResponse(200, response, "Admit card fetched"));
});
