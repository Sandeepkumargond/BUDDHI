import fs from "fs";
import path from "path";
import PDFDocument from "pdfkit";
import asyncHandler from "../utils/asyncHandler.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import { Bonafide } from "../models/bonafide.model.js";
import { Student } from "../models/student.model.js";
import { uploadDocument } from "../utils/ImageKit.js";
import mongoose from "mongoose";

const buildSnapshot = (student) => ({
  enrollmentNo: student.enrollmentNo,
  rollNo: student.rollNo,
  firstName: student.firstName,
  lastName: student.lastName,
  email: student.email,
  personalMail: student.personalMail,
  program: student.program,
  branch: student.branch,
  semester: student.semester,
  section: student.section,
  batch: student.batch,
});

const generateBonafidePdf = async (bonafide, student) => {
  const tmpPath = path.join("./public/temp", `bonafide_${bonafide._id}.pdf`);
  await fs.promises.mkdir(path.dirname(tmpPath), { recursive: true });

  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ margin: 50 });
    const stream = fs.createWriteStream(tmpPath);
    doc.pipe(stream);

    doc.fontSize(18).text("Bonafide Certificate", { align: "center" });
    doc.moveDown();

    doc.fontSize(12).text(`Date: ${new Date().toLocaleDateString()}`);
    doc.moveDown();

    doc.text(`This is to certify that ${student.firstName} ${student.lastName} (Enrollment No: ${student.enrollmentNo}, Roll No: ${student.rollNo}) is a bonafide student of ${student.program}, ${student.branch}.`);
    doc.moveDown();

    doc.text(`Semester: ${student.semester}${student.section ? ", Section: " + student.section : ""}`);
    if (student.batch) doc.text(`Batch: ${student.batch}`);
    doc.moveDown();

    doc.text(`Purpose: ${bonafide.purpose || "Not specified"}`);
    doc.text(`Reason stated by student: ${bonafide.reason}`);
    doc.moveDown();

    doc.text("This certificate is issued on the request of the student for the stated purpose.");

    doc.moveDown(2);
    doc.text("Authorized Signatory", { align: "right" });

    doc.end();

    stream.on("finish", () => resolve(tmpPath));
    stream.on("error", reject);
  });
};

// Student: apply for bonafide
export const applyBonafide = asyncHandler(async (req, res) => {
  const studentId = req.user._id;
  const { purpose, reason } = req.body;

  if (!reason || reason.trim() === "") {
    throw new ApiError(400, "Reason is required");
  }

  const student = await Student.findById(studentId);
  if (!student) throw new ApiError(404, "Student not found");

  const pendingExists = await Bonafide.findOne({ student: studentId, status: "pending" });
  if (pendingExists) {
    throw new ApiError(400, "You already have a pending bonafide request");
  }

  let documentUrl = "";
  let documentFileId = "";
  if (req.file?.path) {
    const uploadRes = await uploadDocument(req.file.path, { folder: "/Buddhi_archives/bonafide/docs/", fileNamePrefix: `bonafide_doc_${student.enrollmentNo}` });
    if (uploadRes.error) throw new ApiError(500, uploadRes.message || "Failed to upload document");
    documentUrl = uploadRes.url;
    documentFileId = uploadRes.fileId;
  }

  const bonafide = await Bonafide.create({
    student: studentId,
    purpose,
    reason,
    status: "pending",
    documentUrl,
    documentFileId,
    studentSnapshot: buildSnapshot(student),
  });

  return res.status(201).json(new ApiResponse(201, { bonafide }, "Bonafide request submitted"));
});

// Student: list my bonafides
export const getMyBonafides = asyncHandler(async (req, res) => {
  const studentId = req.user._id;
  const { status, page = 1, limit = 20 } = req.query;

  const query = { student: studentId };
  if (status && ["pending", "approved", "rejected"].includes(status)) query.status = status;

  const bonafides = await Bonafide.find(query)
    .sort({ createdAt: -1 })
    .limit(parseInt(limit))
    .skip((parseInt(page) - 1) * parseInt(limit));

  const total = await Bonafide.countDocuments(query);

  return res.status(200).json(new ApiResponse(200, { bonafides, total, page: parseInt(page), limit: parseInt(limit) }, "Bonafides fetched"));
});

// Student: get one
export const getMyBonafideById = asyncHandler(async (req, res) => {
  const { bonafideId } = req.params;
  const studentId = req.user._id;

  if (!mongoose.isValidObjectId(bonafideId)) throw new ApiError(400, "Invalid id");

  const bonafide = await Bonafide.findOne({ _id: bonafideId, student: studentId });
  if (!bonafide) throw new ApiError(404, "Bonafide not found");

  return res.status(200).json(new ApiResponse(200, { bonafide }, "Bonafide fetched"));
});

// Admin: list all
export const getAllBonafides = asyncHandler(async (req, res) => {
  const { status, search = "", page = 1, limit = 20 } = req.query;
  const query = {};
  if (status && ["pending", "approved", "rejected"].includes(status)) query.status = status;

  if (search) {
    const regex = new RegExp(search, "i");
    const or = [
      { "studentSnapshot.firstName": regex },
      { "studentSnapshot.lastName": regex },
      { "studentSnapshot.email": regex },
    ];
    const asNumber = Number(search);
    if (!Number.isNaN(asNumber)) {
      or.push({ "studentSnapshot.enrollmentNo": asNumber });
      or.push({ "studentSnapshot.rollNo": asNumber });
    }
    query.$or = or;
  }

  const bonafides = await Bonafide.find(query)
    .sort({ createdAt: -1 })
    .limit(parseInt(limit))
    .skip((parseInt(page) - 1) * parseInt(limit));

  const total = await Bonafide.countDocuments(query);

  return res.status(200).json(new ApiResponse(200, { bonafides, total, page: parseInt(page), limit: parseInt(limit) }, "Bonafides fetched"));
});

// Admin: review
export const reviewBonafide = asyncHandler(async (req, res) => {
  const { bonafideId } = req.params;
  const { status, rejectionReason } = req.body;
  const adminId = req.user?._id;

  if (!mongoose.isValidObjectId(bonafideId)) throw new ApiError(400, "Invalid id");
  if (!status || !["approved", "rejected"].includes(status)) throw new ApiError(400, "Status must be approved or rejected");

  const bonafide = await Bonafide.findById(bonafideId).populate("student");
  if (!bonafide) throw new ApiError(404, "Bonafide not found");
  if (bonafide.status !== "pending") throw new ApiError(400, "Only pending bonafides can be reviewed");

  if (status === "rejected" && (!rejectionReason || rejectionReason.trim() === "")) {
    throw new ApiError(400, "Rejection reason is required");
  }

  let pdfUrl = bonafide.pdfUrl;
  let pdfFileId = bonafide.pdfFileId;

  if (status === "approved") {
    const pdfPath = await generateBonafidePdf(bonafide, bonafide.studentSnapshot || buildSnapshot(bonafide.student));
    const uploadRes = await uploadDocument(pdfPath, { folder: "/Buddhi_archives/bonafide/pdfs/", fileNamePrefix: `bonafide_${bonafide.student?.enrollmentNo || bonafide.studentSnapshot?.enrollmentNo}` });
    if (uploadRes.error) throw new ApiError(500, uploadRes.message || "Failed to upload PDF");
    pdfUrl = uploadRes.url;
    pdfFileId = uploadRes.fileId;
  }

  bonafide.status = status;
  bonafide.rejectionReason = status === "rejected" ? rejectionReason : null;
  bonafide.pdfUrl = pdfUrl;
  bonafide.pdfFileId = pdfFileId;
  bonafide.reviewedBy = adminId;
  bonafide.reviewedAt = new Date();
  await bonafide.save();

  return res.status(200).json(new ApiResponse(200, { bonafide }, "Bonafide updated"));
});
