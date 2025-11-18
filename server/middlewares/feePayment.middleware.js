import asyncHandler from "../utils/asyncHandler.js";
import ApiError from "../utils/ApiError.js";

const ALLOWED_PAYMENT_MODES = [
  "cash",
  "card",
  "upi",
  "netbanking",
  "cheque",
  "bank-transfer",
  "wallet",
  "other",
];

const ALLOWED_STATUSES = ["pending", "success", "failed", "refunded"];

export const validateCreateFeePayment = asyncHandler(async (req, res, next) => {
  const body = req.body || {};

  const required = [
    "id",
    "session",
    "feeHead",
    "transactionId",
    "transactionDate",
    "amount",
    "paymentMode",
    "transactionStatus",
  ];

  for (const key of required) {
    const v = body[key];
    if (v === undefined || v === null || (typeof v === "string" && v.trim() === "")) {
      throw new ApiError(400, `${key} is required`);
    }
  }

  const id = String(body.id).trim();
  const session = String(body.session).trim();
  const feeHead = String(body.feeHead).trim();
  const transactionId = String(body.transactionId).trim();

  const amount = Number(body.amount);
  if (!Number.isFinite(amount) || amount < 0) {
    throw new ApiError(400, "amount must be a non-negative number");
  }

  const paymentMode = String(body.paymentMode).toLowerCase().trim();
  if (!ALLOWED_PAYMENT_MODES.includes(paymentMode)) {
    throw new ApiError(400, `paymentMode must be one of: ${ALLOWED_PAYMENT_MODES.join(", ")}`);
  }

  const transactionStatus = String(body.transactionStatus).toLowerCase().trim();
  if (!ALLOWED_STATUSES.includes(transactionStatus)) {
    throw new ApiError(400, `transactionStatus must be one of: ${ALLOWED_STATUSES.join(", ")}`);
  }

  // Date parsing
  const dateVal = new Date(body.transactionDate);
  if (isNaN(dateVal.getTime())) {
    throw new ApiError(400, "transactionDate must be a valid date");
  }

  const bankName = body.bankName !== undefined && body.bankName !== null ? String(body.bankName).trim() : undefined;

  // Normalize body for controller
  req.body = {
    id,
    session,
    feeHead,
    transactionId,
    transactionDate: dateVal,
    amount,
    paymentMode,
    transactionStatus,
    ...(bankName ? { bankName } : {}),
  };

  next();
});

export const validateAdminFeePaymentQuery = asyncHandler(async (req, res, next) => {
  const q = req.query || {};

  const feeQuery = {};
  if (q.studentId) feeQuery.student = String(q.studentId);
  if (q.enrollmentNo !== undefined) feeQuery.enrollmentNo = Number(q.enrollmentNo);
  if (q.rollNo !== undefined) feeQuery.rollNo = Number(q.rollNo);
  if (q.session) feeQuery.session = String(q.session).trim();
  if (q.transactionStatus) feeQuery.transactionStatus = String(q.transactionStatus).toLowerCase().trim();
  if (q.paymentMode) feeQuery.paymentMode = String(q.paymentMode).toLowerCase().trim();
  if (q.feeHead) feeQuery.feeHead = String(q.feeHead).trim();
  if (q.transactionId) feeQuery.transactionId = String(q.transactionId).trim();

  if (q.dateFrom || q.dateTo) {
    feeQuery.transactionDate = {};
    if (q.dateFrom) {
      const d = new Date(q.dateFrom);
      if (!isNaN(d.getTime())) feeQuery.transactionDate.$gte = d;
    }
    if (q.dateTo) {
      const d = new Date(q.dateTo);
      if (!isNaN(d.getTime())) feeQuery.transactionDate.$lte = d;
    }
    if (Object.keys(feeQuery.transactionDate).length === 0) delete feeQuery.transactionDate;
  }

  // Pagination and sorting
  const pageNum = Math.max(parseInt(String(q.page), 10) || 1, 1);
  const limitNum = Math.min(Math.max(parseInt(String(q.limit), 10) || 20, 1), 200);
  const skip = (pageNum - 1) * limitNum;

  const sortStr = q.sort ? String(q.sort) : "-transactionDate,-createdAt";
  const sortObj = sortStr.split(",").reduce((acc, field) => {
    const f = field.trim();
    if (!f) return acc;
    if (f.startsWith("-")) acc[f.slice(1)] = -1; else acc[f] = 1;
    return acc;
  }, {});

  req.feeQuery = feeQuery;
  req.pagination = { pageNum, limitNum, skip };
  req.sortObj = sortObj;
  next();
});
