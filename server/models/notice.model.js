import mongoose from "mongoose";

const noticeSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 200
  },
  content: {
    type: String,
    required: true,
    trim: true
  },
  audience: {
    type: String,
    required: true,
    enum: ['all', 'students', 'faculty', 'staff', 'parents'],
    default: 'all'
  },
  priority: {
    type: String,
    required: true,
    enum: ['low', 'normal', 'high', 'urgent'],
    default: 'normal'
  },
  publishDate: {
    type: Date,
    required: true,
    default: Date.now
  },
  expiryDate: {
    type: Date,
    default: null
  },
  isActive: {
    type: Boolean,
    default: true
  },
  attachmentUrl: {
    type: String,
    default: null
  },
  attachmentName: {
    type: String,
    default: null
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    refPath: 'createdByModel'
  },
  createdByModel: {
    type: String,
    required: true,
    enum: ['Admin', 'SubAdmin', 'SuperAdmin', 'Faculty']
  },
  createdByName: {
    type: String,
    required: true
  },
  courseId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
    default: null,
  },
  courseCode: {
    type: String,
    trim: true,
    default: null,
  },
  courseName: {
    type: String,
    trim: true,
    default: null,
  },
  section: {
    type: String,
    trim: true,
    default: null,
  },
  semester: {
    type: Number,
    min: 1,
    max: 8,
    default: null,
  },
  academicYear: {
    type: String,
    trim: true,
    default: null,
  },
  batch: {
    type: String,
    trim: true,
    default: null,
  },
  branch: {
    type: String,
    trim: true,
    default: null,
  },
  viewCount: {
    type: Number,
    default: 0
  },
  category: {
    type: String,
    enum: ['general', 'academic', 'examination', 'event', 'holiday', 'urgent', 'admission'],
    default: 'general'
  },
  targetSemesters: [{
    type: Number,
    min: 1,
    max: 8
  }],
  targetBranches: [String],
  isPinned: {
    type: Boolean,
    default: false
  },
  tags: [String]
}, {
  timestamps: true
});

// Indexes for better query performance
noticeSchema.index({ publishDate: -1 });
noticeSchema.index({ audience: 1 });
noticeSchema.index({ isActive: 1 });
noticeSchema.index({ priority: 1 });
noticeSchema.index({ isPinned: -1, publishDate: -1 });
noticeSchema.index({ createdBy: 1, createdByModel: 1 });
noticeSchema.index({ courseId: 1, semester: 1, section: 1 });

// Virtual for determining if notice is expired
noticeSchema.virtual('isExpired').get(function() {
  return this.expiryDate && new Date() > this.expiryDate;
});

// Method to increment view count
noticeSchema.methods.incrementViewCount = function() {
  this.viewCount += 1;
  return this.save();
};

// Static method to get active notices
noticeSchema.statics.getActiveNotices = function(audience = null, limit = 20, skip = 0) {
  const query = {
    isActive: true,
    $or: [
      { expiryDate: null },
      { expiryDate: { $gt: new Date() } }
    ]
  };

  if (audience && audience !== 'all') {
    query.$or = [
      { audience: 'all' },
      { audience: audience }
    ];
  }

  return this.find(query)
    .sort({ isPinned: -1, publishDate: -1 })
    .limit(limit)
    .skip(skip)
    .populate('createdBy', 'firstName lastName email')
    .exec();
};

export const Notice = mongoose.model("Notice", noticeSchema);