import asyncHandler from "../utils/asyncHandler.js";
import ApiResponse from "../utils/ApiResponse.js";
import ApiError from "../utils/ApiError.js";
import { FeePayment } from "../models/feePayment.model.js";
import { getStudentDetailsById } from "./student.controller.js";
import { uploadImageOnImageKit } from "../utils/ImageKit.js";

export const createFeePayment = asyncHandler(async (req, res) => {
  // Student must be authenticated via authenticateStudent
  const studentId = req.user?._id;
  if (!studentId) {
    throw new ApiError(401, "Unauthorized");
  }

  const student = await getStudentDetailsById(studentId);

  const {
    id,
    session,
    feeHead,
    transactionId,
    transactionDate,
    amount,
    paymentMode,
    transactionStatus,
    bankName,
  } = req.body || {};

  const required = { id, session, feeHead, transactionId, transactionDate, amount, paymentMode, transactionStatus };
  for (const [k, v] of Object.entries(required)) {
    if (v === undefined || v === null || (typeof v === "string" && v.trim() === "")) {
      throw new ApiError(400, `${k} is required`);
    }
  }

  let imageUrl = null;
  const imageLocalPath = req.file?.path;
  if (imageLocalPath) {
    const upload = await uploadImageOnImageKit(imageLocalPath, `${student.firstName}_${student.rollNo || student.enrollmentNo}`);
    if (upload && !upload.error) {
      imageUrl = upload.url;
    }
  }

  try {
    const doc = await FeePayment.create({
      student: student._id,
      id,
      enrollmentNo: student.enrollmentNo,
      rollNo: student.rollNo,
      session,
      studentName: `${student.firstName} ${student.lastName}`.trim(),
      feeHead,
      transactionId,
      transactionDate,
      amount,
      paymentMode,
      transactionStatus,
      bankName: bankName || null,
      imageUrl,
    });

    const receipt = {
      receiptNo: doc.id,
      session: doc.session,
      feeHead: doc.feeHead,
      amount: doc.amount,
      paymentMode: doc.paymentMode,
      transaction: {
        id: doc.transactionId,
        date: doc.transactionDate,
        status: doc.transactionStatus,
        bankName: doc.bankName || null,
      },
      student: {
        name: `${student.firstName} ${student.lastName}`.trim(),
        enrollmentNo: student.enrollmentNo,
        rollNo: student.rollNo,
        semester: student.semester,
        program: student.program,
        branch: student.branch,
      },
      imageUrl: doc.imageUrl,
      createdAt: doc.createdAt,
    };

    return res.status(201).json(new ApiResponse(201, { payment: doc, receipt }, "Fee payment recorded"));
  } catch (err) {
    if (err && err.code === 11000) {
      return res.status(409).json(new ApiResponse(409, {}, "Duplicate entry: payment already exists for this fee head and session"));
    }
    throw err;
  }
});

export const listMyFeePayments = asyncHandler(async (req, res) => {
  const studentId = req.user?._id;
  if (!studentId) {
    throw new ApiError(401, "Unauthorized");
  }

  const payments = await FeePayment.find({ student: studentId }).sort({ transactionDate: -1, createdAt: -1 });
  return res.status(200).json(new ApiResponse(200, payments, "Fee payments fetched"));
});

export const getMyFeePaymentReceipt = asyncHandler(async (req, res) => {
  const studentId = req.user?._id;
  const { id } = req.params;
  const doc = await FeePayment.findById(id);
  if (!doc || String(doc.student) !== String(studentId)) {
    throw new ApiError(404, "Fee payment not found");
  }

  const student = req.user; // already loaded by authenticateStudent

  const receipt = {
    receiptNo: doc.id,
    session: doc.session,
    feeHead: doc.feeHead,
    amount: doc.amount,
    paymentMode: doc.paymentMode,
    transaction: {
      id: doc.transactionId,
      date: doc.transactionDate,
      status: doc.transactionStatus,
      bankName: doc.bankName || null,
    },
    student: {
      name: `${student.firstName} ${student.lastName}`.trim(),
      enrollmentNo: student.enrollmentNo,
      rollNo: student.rollNo,
      semester: student.semester,
      program: student.program,
      branch: student.branch,
    },
    imageUrl: doc.imageUrl,
    createdAt: doc.createdAt,
  };

  return res.status(200).json(new ApiResponse(200, receipt, "Receipt generated"));
});

// Admin endpoints
export const adminListFeePayments = asyncHandler(async (req, res) => {
  // Prefer sanitized values from middleware; fall back to raw parsing if absent
  const query = req.feeQuery || {};
  const pageNum = req.pagination?.pageNum ?? 1;
  const limitNum = req.pagination?.limitNum ?? 20;
  const skip = req.pagination?.skip ?? 0;
  const sortObj = req.sortObj || { transactionDate: -1, createdAt: -1 };

  const [items, total] = await Promise.all([
    FeePayment.find(query).sort(sortObj).skip(skip).limit(limitNum),
    FeePayment.countDocuments(query),
  ]);

  return res.status(200).json(
    new ApiResponse(200, { items, page: pageNum, limit: limitNum, total, pages: Math.ceil(total / limitNum) }, "Fee payments fetched")
  );
});

export const adminGetFeePaymentById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const doc = await FeePayment.findById(id);
  if (!doc) throw new ApiError(404, "Fee payment not found");
  return res.status(200).json(new ApiResponse(200, doc, "Fee payment fetched"));
});

export const adminGetReceiptRedirect = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const doc = await FeePayment.findById(id).select("imageUrl");
  if (!doc) throw new ApiError(404, "Fee payment not found");
  if (!doc.imageUrl) throw new ApiError(404, "Receipt image not available");
  // 302 redirect to the hosted receipt image
  return res.redirect(doc.imageUrl);
});
