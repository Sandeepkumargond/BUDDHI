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
      docType: "payment",
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

// ================= Fee Structure APIs =================

export const adminCreateFeeStructure = asyncHandler(async (req, res) => {
  const adminId = req.user?._id;
  if (!adminId) throw new ApiError(401, "Unauthorized");

  const { program, branch, semester, session, category, feeHeads, published } = req.body || {};

  // Create a stable structure id
  const normCategory = String(category).toLowerCase();
  const code = `FS-${branch}-${semester}-${session}-${normCategory}-${Date.now()}`;

  const doc = await FeePayment.create({
    docType: 'structure',
    id: code,
    program: program || undefined,
    branch: String(branch).trim().toUpperCase(),
    semester,
    session,
    category: normCategory,
    feeHeads,
    published: !!published,
    createdBy: adminId,
  });

  const statusStr = doc.published ? 'published' : 'saved as draft';
  return res.status(201).json(new ApiResponse(201, doc, `Fee structure created (${statusStr})`));
});

export const adminListFeeStructures = asyncHandler(async (req, res) => {
  const q = req.query || {};
  const query = { docType: 'structure' };
  if (q.program) query.program = String(q.program);
  if (q.branch) query.branch = String(q.branch);
  if (q.session) query.session = String(q.session);
  if (q.category) query.category = String(q.category).toLowerCase();
  if (q.semester !== undefined) query.semester = Number(q.semester);
  if (q.published !== undefined) query.published = String(q.published) === 'true';

  const page = Math.max(parseInt(String(q.page) || '1', 10), 1);
  const limit = Math.min(Math.max(parseInt(String(q.limit) || '20', 10), 1), 200);
  const skip = (page - 1) * limit;

  const [items, total] = await Promise.all([
    FeePayment.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit),
    FeePayment.countDocuments(query),
  ]);

  return res.status(200).json(new ApiResponse(200, { items, page, limit, total, pages: Math.ceil(total / limit) }, 'Fee structures fetched'));
});

export const adminGetFeeStructureById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const doc = await FeePayment.findById(id);
  if (!doc || doc.docType !== 'structure') throw new ApiError(404, 'Fee structure not found');
  return res.status(200).json(new ApiResponse(200, doc, 'Fee structure fetched'));
});

export const adminPublishFeeStructure = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const doc = await FeePayment.findById(id);
  if (!doc || doc.docType !== 'structure') throw new ApiError(404, 'Fee structure not found');
  doc.published = true;
  await doc.save();
  return res.status(200).json(new ApiResponse(200, doc, 'Fee structure published'));
});

export const getMyApplicableFeeStructure = asyncHandler(async (req, res) => {
  const student = req.user; // loaded via authenticateStudent
  if (!student) throw new ApiError(401, 'Unauthorized');
  const q = req.query || {};

  // If session not provided, pick the latest published one
  const normalizeCategory = (raw) => {
    const c = String(raw || '').toLowerCase();
    if (c.includes('obc')) return 'obc';
    if (c === 'gen' || c === 'general' || c === 'ur') return 'general';
    if (c === 'sc') return 'sc';
    if (c === 'st') return 'st';
    return 'general';
  };

  const normCat = normalizeCategory(student.category);
  const branchVals = [String(student.branch || '')];
  const ub = branchVals[0].toUpperCase();
  const lb = branchVals[0].toLowerCase();
  if (!branchVals.includes(ub)) branchVals.push(ub);
  if (!branchVals.includes(lb)) branchVals.push(lb);

  const base = {
    docType: 'structure',
    branch: { $in: branchVals },
    semester: student.semester,
    published: true,
  };
  if (q.session) base.session = String(q.session);

  let matchedBy = 'branch+semester+category';

  // Try exact category for branch+semester
  let doc = await FeePayment.findOne({ ...base, category: normCat }).sort({ createdAt: -1 });
  // Fallback to general for branch+semester
  if (!doc && normCat !== 'general') {
    doc = await FeePayment.findOne({ ...base, category: 'general' }).sort({ createdAt: -1 });
    if (doc) matchedBy = 'branch+semester+general';
  }
  // Fallback to any category for branch+semester
  if (!doc) {
    doc = await FeePayment.findOne(base).sort({ createdAt: -1 });
    if (doc) matchedBy = 'branch+semester+any';
  }

  // If nothing on same semester, relax to branch-only
  if (!doc) {
    const branchOnly = { docType: 'structure', branch: { $in: branchVals }, published: true };
    if (q.session) branchOnly.session = String(q.session);

    doc = await FeePayment.findOne({ ...branchOnly, category: normCat }).sort({ createdAt: -1 });
    if (doc) matchedBy = 'branch+category';

    if (!doc && normCat !== 'general') {
      doc = await FeePayment.findOne({ ...branchOnly, category: 'general' }).sort({ createdAt: -1 });
      if (doc) matchedBy = 'branch+general';
    }

    if (!doc) {
      doc = await FeePayment.findOne(branchOnly).sort({ createdAt: -1 });
      if (doc) matchedBy = 'branch+any';
    }
  }

  if (!doc) throw new ApiError(404, 'No applicable fee structure found');

  // compute totals
  const heads = Array.isArray(doc.feeHeads) ? doc.feeHeads : [];
  const total = heads.reduce((s, h) => s + (Number(h.amount) || 0), 0);

  return res.status(200).json(
    new ApiResponse(200, { structure: doc, total, _matchedBy: matchedBy }, 'Applicable fee structure')
  );
});

export const getMyApplicableFeeStructures = asyncHandler(async (req, res) => {
  const student = req.user;
  if (!student) throw new ApiError(401, 'Unauthorized');

  const normalizeCategory = (raw) => {
    const c = String(raw || '').toLowerCase();
    if (c.includes('obc')) return 'obc';
    if (c === 'gen' || c === 'general' || c === 'ur') return 'general';
    if (c === 'sc') return 'sc';
    if (c === 'st') return 'st';
    return 'general';
  };
  const normCat = normalizeCategory(student.category);
  const branchVals = [String(student.branch || '')];
  const ub = branchVals[0].toUpperCase();
  const lb = branchVals[0].toLowerCase();
  if (!branchVals.includes(ub)) branchVals.push(ub);
  if (!branchVals.includes(lb)) branchVals.push(lb);

  const items = await FeePayment.find({
    docType: 'structure',
    published: true,
    branch: { $in: branchVals },
  }).sort({ createdAt: -1 });

  const shaped = items.map((doc) => {
    const heads = Array.isArray(doc.feeHeads) ? doc.feeHeads : [];
    const total = heads.reduce((s, h) => s + (Number(h.amount) || 0), 0);
    const isSemesterMatch = Number(doc.semester) === Number(student.semester);
    const isCategoryMatch = String(doc.category) === normCat;
    const isGeneral = String(doc.category) === 'general';
    const score = (isSemesterMatch ? 4 : 0) + (isCategoryMatch ? 2 : 0) + (isGeneral ? 1 : 0);
    return { structure: doc, total, score };
  });

  return res.status(200).json(new ApiResponse(200, { items: shaped, count: shaped.length }, 'Published fee structures'));
});
