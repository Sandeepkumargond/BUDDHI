import mongoose, { Schema } from "mongoose";

const attendanceRecordSchema = new Schema({
  studentId: {
    type: Schema.Types.ObjectId,
    ref: 'Student',
    required: true
  },
  rollNo: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['present', 'absent', 'leave', 'late'],
    required: true,
    default: 'absent'
  },
  remark: {
    type: String,
    trim: true,
    default: ''
  }
});

const attendanceSchema = new Schema(
  {
    facultyId: {
      type: Schema.Types.ObjectId,
      ref: 'Faculty',
      required: true,
      index: true
    },
    courseId: {
      type: Schema.Types.ObjectId,
      ref: 'Course',
      required: true,
      index: true
    },
    courseCode: {
      type: String,
      required: true,
      trim: true
    },
    courseName: {
      type: String,
      required: true,
      trim: true
    },
    semester: {
      type: Number,
      required: true,
      index: true
    },
    section: {
      type: String,
      trim: true,
      default: ''
    },
    batch: {
      type: String,
      trim: true,
      default: ''
    },
    date: {
      type: Date,
      required: true,
      index: true
    },
    period: {
      type: String,
      required: true,
      default: '1'
    },
    mode: {
      type: String,
      enum: ['theory', 'lab'],
      required: true,
      default: 'theory'
    },
    records: [attendanceRecordSchema],
    totalStudents: {
      type: Number,
      default: 0
    },
    presentCount: {
      type: Number,
      default: 0
    },
    absentCount: {
      type: Number,
      default: 0
    },
    leaveCount: {
      type: Number,
      default: 0
    },
    lateCount: {
      type: Number,
      default: 0
    }
  },
  { timestamps: true }
);

// Compound index for unique attendance session
attendanceSchema.index({ facultyId: 1, courseId: 1, date: 1, period: 1, mode: 1 }, { unique: true });

// Calculate counts before saving
attendanceSchema.pre('save', function(next) {
  this.totalStudents = this.records.length;
  this.presentCount = this.records.filter(r => r.status === 'present').length;
  this.absentCount = this.records.filter(r => r.status === 'absent').length;
  this.leaveCount = this.records.filter(r => r.status === 'leave').length;
  this.lateCount = this.records.filter(r => r.status === 'late').length;
  next();
});

export const Attendance = mongoose.model("Attendance", attendanceSchema);
