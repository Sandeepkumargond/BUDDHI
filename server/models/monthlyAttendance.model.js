import mongoose, { Schema } from "mongoose";

const studentAttendanceSchema = new Schema({
  studentId: {
    type: Schema.Types.ObjectId,
    ref: 'Student',
    required: true
  },
  enrolmentNo: {
    type: String,
    required: true
  },
  rollNo: {
    type: String,
    required: true
  },
  name: {
    type: String,
    required: true
  },
  daysPresent: {
    type: Number,
    default: 0,
    min: 0
  },
  percentage: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  }
});

const monthlyAttendanceSchema = new Schema(
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
    month: {
      type: Number,
      required: true,
      min: 1,
      max: 12,
      index: true
    },
    year: {
      type: Number,
      required: true,
      index: true
    },
    totalActiveDays: {
      type: Number,
      required: true,
      default: 0,
      min: 0
    },
    students: [studentAttendanceSchema],
    isFinalized: {
      type: Boolean,
      default: false
    }
  },
  { timestamps: true }
);

// Compound index for unique monthly attendance
monthlyAttendanceSchema.index(
  { facultyId: 1, courseId: 1, semester: 1, section: 1, batch: 1, month: 1, year: 1 },
  { unique: true }
);

// Calculate percentage before saving
monthlyAttendanceSchema.pre('save', function(next) {
  if (this.totalActiveDays > 0) {
    this.students.forEach(student => {
      student.percentage = Math.round((student.daysPresent / this.totalActiveDays) * 100 * 100) / 100;
    });
  }
  next();
});

export const MonthlyAttendance = mongoose.model("MonthlyAttendance", monthlyAttendanceSchema);
