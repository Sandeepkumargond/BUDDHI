import asyncHandler from "../utils/asyncHandler.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import { Schedule } from "../models/schedule.model.js";

const toMins = (hhmm) => {
  const [h, m] = String(hhmm).split(":").map(Number);
  return h * 60 + m;
};

const overlaps = (aStart, aEnd, bStart, bEnd) => aStart < bEnd && bStart < aEnd;

export const createSlot = asyncHandler(async (req, res) => {
  const { course, faculty, branch, semester, section = 'A', room, dayOfWeek, startTime, endTime } = req.body;
  if ([course, faculty, branch, semester, dayOfWeek, startTime, endTime].some(v => v === undefined || v === null || v === '')) {
    throw new ApiError(400, 'Missing required fields');
  }
  const startMins = typeof startTime === 'number' ? startTime : toMins(startTime);
  const endMins = typeof endTime === 'number' ? endTime : toMins(endTime);
  if (startMins >= endMins) throw new ApiError(400, 'Start must be before end');

  // Student group conflicts
  const groupSlots = await Schedule.find({ dayOfWeek, branch, semester, section });
  for (const s of groupSlots) {
    if (overlaps(startMins, endMins, s.startMins, s.endMins)) {
      throw new ApiError(409, 'Conflict for student group');
    }
  }

  // Faculty conflicts
  const facultySlots = await Schedule.find({ dayOfWeek, faculty });
  for (const s of facultySlots) {
    if (overlaps(startMins, endMins, s.startMins, s.endMins)) {
      throw new ApiError(409, 'Conflict for faculty');
    }
  }

  // Room conflicts (optional)
  if (room) {
    const roomSlots = await Schedule.find({ dayOfWeek, room });
    for (const s of roomSlots) {
      if (overlaps(startMins, endMins, s.startMins, s.endMins)) {
        throw new ApiError(409, 'Conflict for room');
      }
    }
  }

  const slot = await Schedule.create({ course, faculty, branch, semester, section, room, dayOfWeek, startMins, endMins, createdBy: req.user?._id });
  return res.status(201).json(new ApiResponse(201, { slot }, 'Slot created'));
});

export const listStudentSchedule = asyncHandler(async (req, res) => {
  let { branch, semester, section } = req.query;
  // Fallback to authenticated student's profile if filters missing
  const user = req.user || {};
  branch = branch || user.branch || user.department || user.dept || '';
  semester = semester || user.semester || user.sem || user.currentSemester || '';
  section = section || user.section || 'A';

  if (!branch || !semester) throw new ApiError(400, 'branch and semester required');

  const filters = { branch: String(branch), semester: Number(semester), section: String(section) };
  const slots = await Schedule.find(filters)
    .populate('course', 'name code')
    .populate('faculty', 'firstName lastName')
    .lean();
  return res.status(200).json(new ApiResponse(200, { slots, filters }, 'Student schedule'));
});

export const listFacultySchedule = asyncHandler(async (req, res) => {
  let { facultyId } = req.params;
  // Fallback to authenticated faculty if param missing or mismatched
  if (!facultyId && req.user?._id) facultyId = String(req.user._id);
  const slots = await Schedule.find({ faculty: facultyId })
    .populate('course', 'name code')
    .lean();
  return res.status(200).json(new ApiResponse(200, { slots, facultyId }, 'Faculty schedule'));
});

export const updateSlot = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const patch = req.body || {};
  // normalize times if provided
  if (patch.startTime) patch.startMins = toMins(patch.startTime);
  if (patch.endTime) patch.endMins = toMins(patch.endTime);
  const slot = await Schedule.findByIdAndUpdate(id, patch, { new: true });
  if (!slot) throw new ApiError(404, 'Slot not found');
  return res.status(200).json(new ApiResponse(200, { slot }, 'Slot updated'));
});

export const deleteSlot = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const slot = await Schedule.findByIdAndDelete(id);
  if (!slot) throw new ApiError(404, 'Slot not found');
  return res.status(200).json(new ApiResponse(200, {}, 'Slot deleted'));
});

// Seed demo schedule for the currently logged-in faculty
export const seedForCurrentFaculty = asyncHandler(async (req, res) => {
  const facultyId = req.user?._id;
  if (!facultyId) throw new ApiError(401, 'Faculty not found');

  // Create/find a demo course
  const { Course } = await import('../models/course.model.js');
  const { Faculty } = await import('../models/faculty.model.js');
  const faculty = await Faculty.findById(facultyId);
  if (!faculty) throw new ApiError(404, 'Faculty not found');

  let course = await Course.findOne({ code: 'CSE501' });
  if (!course) {
    course = await Course.create({ name: 'Algorithms', code: 'CSE501', department: 'CSE' });
  }

  const existing = await Schedule.find({ faculty: facultyId });
  if (existing.length > 0) {
    return res.status(200).json(new ApiResponse(200, { created: 0 }, 'Faculty already has schedule'));
  }

  const base = {
    course: course._id,
    faculty: facultyId,
    branch: 'CSE',
    semester: 5,
    section: 'B',
  };

  const docs = [
    { ...base, room: 'R-201', dayOfWeek: 1, startMins: 9 * 60, endMins: 10 * 60 },
    { ...base, room: 'R-201', dayOfWeek: 3, startMins: 11 * 60, endMins: 12 * 60 },
  ];

  await Schedule.insertMany(docs);
  const slots = await Schedule.find({ faculty: facultyId })
    .populate('course', 'name code')
    .populate('faculty', 'firstName lastName');

  return res.status(201).json(new ApiResponse(201, { slots }, 'Seeded demo schedule for current faculty'));
});
