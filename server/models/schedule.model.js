import mongoose from 'mongoose';

const ScheduleSchema = new mongoose.Schema({
  course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
  faculty: { type: mongoose.Schema.Types.ObjectId, ref: 'Faculty', required: true },
  branch: { type: String, required: true },
  semester: { type: Number, required: true },
  section: { type: String, default: 'A' },
  room: { type: String },
  dayOfWeek: { type: Number, min: 0, max: 6, required: true },
  startMins: { type: Number, required: true },
  endMins: { type: Number, required: true },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Faculty' },
}, { timestamps: true });

ScheduleSchema.index({ dayOfWeek: 1, branch: 1, semester: 1, section: 1 });
ScheduleSchema.index({ dayOfWeek: 1, faculty: 1 });
ScheduleSchema.index({ dayOfWeek: 1, room: 1 });

export const Schedule = mongoose.model('Schedule', ScheduleSchema);
