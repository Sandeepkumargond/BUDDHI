import mongoose, { Schema } from "mongoose";

const sessionDetailsSchema = new Schema(
  {
    examType: String,
    session: String,
    examCenter: String,
    centerCode: String,
    reportingTime: String,
    gateClose: String,
  },
  { _id: false }
);

const scheduleItemSchema = new Schema(
  {
    courseId: { type: Schema.Types.ObjectId, ref: "Course" },
    code: String,
    name: String,
    date: String, // keep as display string per requirements
    time: String, // e.g., "10:00 AM – 1:00 PM"
  },
  { _id: false }
);

const coordinatorSchema = new Schema(
  {
    name: String,
    phone: String,
    email: String,
    office: String,
    signatureUrl: String,
  },
  { _id: false }
);

const admitCardSchema = new Schema(
  {
    departmentCode: { type: String, required: true, index: true },
    semester: { type: Number, required: true, index: true },
    instituteName: { type: String },
    instituteAbbreviation: { type: String },
    sessionDetails: sessionDetailsSchema,
    schedule: [scheduleItemSchema],
    coordinator: coordinatorSchema,
    published: { type: Boolean, default: false, index: true },
    publishedAt: { type: Date },
    createdBy: { type: Schema.Types.ObjectId, ref: "Admin" },
  },
  { timestamps: true }
);

admitCardSchema.index({ departmentCode: 1, semester: 1, published: 1 });

export const AdmitCard = mongoose.model("AdmitCard", admitCardSchema);
