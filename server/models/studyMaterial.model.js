import mongoose from 'mongoose';

const studyMaterialSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true,
    maxLength: [200, 'Title cannot exceed 200 characters']
  },
  
  description: {
    type: String,
    required: [true, 'Description is required'],
    trim: true,
    maxLength: [2000, 'Description cannot exceed 2000 characters']
  },
  
  subject: {
    type: String,
    required: [true, 'Subject is required'],
    trim: true
  },
  
  courseCode: {
    type: String,
    trim: true,
    uppercase: true
  },
  
  semester: {
    type: Number,
    required: [true, 'Semester is required'],
    min: [1, 'Semester must be between 1 and 8'],
    max: [8, 'Semester must be between 1 and 8']
  },
  
  branch: {
    type: String,
    required: [true, 'Branch is required'],
    enum: ['CSE', 'ECE', 'EEE', 'MECH', 'CIVIL', 'IT', 'AIDS']
  },
  
  academicYear: {
    type: String,
    required: [true, 'Academic year is required'],
    match: [/^\d{4}-\d{2}$/, 'Academic year must be in format YYYY-YY (e.g., 2024-25)']
  },
  
  materialType: {
    type: String,
    required: [true, 'Material type is required'],
    enum: ['lecture_notes', 'assignment', 'reference_book', 'question_paper', 'lab_manual', 'presentation', 'other']
  },
  
  // File information
  fileName: {
    type: String,
    required: [true, 'File name is required']
  },
  
  fileUrl: {
    type: String,
    required: [true, 'File URL is required']
  },
  
  fileId: {
    type: String,
    required: [true, 'ImageKit file ID is required']
  },
  
  fileType: {
    type: String,
    required: [true, 'File type is required']
  },
  
  fileSize: {
    type: Number,
    required: [true, 'File size is required'],
    max: [50 * 1024 * 1024, 'File size cannot exceed 50MB'] // 50MB limit
  },
  // Optional: multiple attachments (in addition to primary file fields above)
  attachments: [{
    fileName: { type: String },
    fileUrl: { type: String },
    fileId: { type: String },
    fileType: { type: String },
    fileSize: { type: Number }
  }],
  
  // Faculty who uploaded
  uploadedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Faculty',
    required: [true, 'Uploader reference is required']
  },
  
  // Tags for better searchability
  tags: [{
    type: String,
    trim: true,
    lowercase: true
  }],
  
  // Target audience (for cross-semester/branch sharing)
  targetAudience: {
    semesters: [{
      type: Number,
      min: 1,
      max: 8
    }],
    branches: [{
      type: String,
      enum: ['CSE', 'ECE', 'EEE', 'MECH', 'CIVIL', 'IT', 'AIDS']
    }]
  },
  
  // Additional metadata
  metadata: {
    difficulty: {
      type: String,
      enum: ['beginner', 'intermediate', 'advanced'],
      default: 'intermediate'
    },
    language: {
      type: String,
      default: 'English'
    },
    estimatedReadTime: {
      type: Number, // in minutes
      min: [1, 'Read time must be at least 1 minute']
    }
  },
  
  // Status and visibility
  isActive: {
    type: Boolean,
    default: true
  },
  
  // Statistics
  viewCount: {
    type: Number,
    default: 0,
    min: [0, 'View count cannot be negative']
  },
  
  downloadCount: {
    type: Number,
    default: 0,
    min: [0, 'Download count cannot be negative']
  },
  
  // Expiry date (optional, for time-sensitive materials)
  expiryDate: {
    type: Date
  }
  ,
  // Student submissions (assignment/homework uploads)
  submissions: [{
    studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
    type: { type: String, enum: ['assignment', 'homework'], required: true },
    fileUrl: { type: String, required: true },
    fileName: { type: String },
    fileSize: { type: Number },
    at: { type: Date, default: Date.now }
  }]
}, {
  timestamps: true
});

// Indexes for better query performance
studyMaterialSchema.index({ uploadedBy: 1, createdAt: -1 });
studyMaterialSchema.index({ subject: 1, semester: 1, branch: 1 });
studyMaterialSchema.index({ materialType: 1, isActive: 1 });
studyMaterialSchema.index({ tags: 1 });
// Separate indexes for array fields to avoid parallel array indexing error
studyMaterialSchema.index({ 'targetAudience.semesters': 1 });
studyMaterialSchema.index({ 'targetAudience.branches': 1 });
studyMaterialSchema.index({ title: 'text', description: 'text', tags: 'text' });

// Virtual for checking if material is expired
studyMaterialSchema.virtual('isExpired').get(function() {
  if (!this.expiryDate) return false;
  return new Date() > this.expiryDate;
});

// Virtual for file size in human readable format
studyMaterialSchema.virtual('fileSizeFormatted').get(function() {
  const bytes = this.fileSize;
  if (!bytes) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
});

// Pre-save middleware to update targetAudience if not provided
studyMaterialSchema.pre('save', function(next) {
  // If no additional target audience is specified, use the primary semester and branch
  if (!this.targetAudience.semesters || this.targetAudience.semesters.length === 0) {
    this.targetAudience.semesters = [this.semester];
  } else if (!this.targetAudience.semesters.includes(this.semester)) {
    this.targetAudience.semesters.push(this.semester);
  }
  
  if (!this.targetAudience.branches || this.targetAudience.branches.length === 0) {
    this.targetAudience.branches = [this.branch];
  } else if (!this.targetAudience.branches.includes(this.branch)) {
    this.targetAudience.branches.push(this.branch);
  }
  
  next();
});

// Static method to get materials by faculty
studyMaterialSchema.statics.findByFaculty = function(facultyId, options = {}) {
  const {
    page = 1,
    limit = 10,
    subject,
    materialType,
    semester,
    isActive = true,
    sortBy = 'createdAt',
    sortOrder = -1
  } = options;
  
  const query = { uploadedBy: facultyId };
  
  if (subject) query.subject = new RegExp(subject, 'i');
  if (materialType) query.materialType = materialType;
  if (semester) query.semester = semester;
  if (isActive !== undefined) query.isActive = isActive;
  
  const sort = { [sortBy]: sortOrder };
  
  return this.find(query)
    .sort(sort)
    .limit(limit * 1)
    .skip((page - 1) * limit)
    .populate('uploadedBy', 'firstName lastName email')
    .exec();
};

// Static method to get materials for students
studyMaterialSchema.statics.findForStudent = function(criteria, options = {}) {
  const {
    page = 1,
    limit = 10,
    search,
    materialType,
    sortBy = 'createdAt',
    sortOrder = -1
  } = options;
  
  const query = {
    isActive: true,
    $or: [
      { semester: criteria.semester, branch: criteria.branch },
      { 'targetAudience.semesters': criteria.semester },
      { 'targetAudience.branches': criteria.branch }
    ]
  };
  
  // Add expiry filter
  query.$or.push({
    $or: [
      { expiryDate: { $exists: false } },
      { expiryDate: null },
      { expiryDate: { $gt: new Date() } }
    ]
  });
  
  if (search) {
    query.$text = { $search: search };
  }
  
  if (materialType) {
    query.materialType = materialType;
  }
  
  const sort = search ? { score: { $meta: 'textScore' } } : { [sortBy]: sortOrder };
  
  return this.find(query, search ? { score: { $meta: 'textScore' } } : {})
    .sort(sort)
    .limit(limit * 1)
    .skip((page - 1) * limit)
    .populate('uploadedBy', 'firstName lastName')
    .exec();
};

// Static method to get statistics
studyMaterialSchema.statics.getStats = function(facultyId) {
  return this.aggregate([
    { $match: { uploadedBy: new mongoose.Types.ObjectId(facultyId) } },
    {
      $group: {
        _id: null,
        totalMaterials: { $sum: 1 },
        totalDownloads: { $sum: '$downloadCount' },
        totalViews: { $sum: '$viewCount' },
        activeMaterials: {
          $sum: { $cond: [{ $eq: ['$isActive', true] }, 1, 0] }
        },
        subjects: { $addToSet: '$subject' },
        materialTypes: { $addToSet: '$materialType' }
      }
    },
    {
      $project: {
        _id: 0,
        totalMaterials: 1,
        totalDownloads: 1,
        totalViews: 1,
        activeMaterials: 1,
        totalSubjects: { $size: '$subjects' },
        materialTypeBreakdown: '$materialTypes'
      }
    }
  ]);
};

// Instance method to increment view count
studyMaterialSchema.methods.incrementViewCount = function() {
  this.viewCount += 1;
  return this.save();
};

// Instance method to increment download count
studyMaterialSchema.methods.incrementDownloadCount = function() {
  this.downloadCount += 1;
  return this.save();
};

// Instance method to check if user can access this material
studyMaterialSchema.methods.canAccess = function(userSemester, userBranch) {
  if (!this.isActive) return false;
  if (this.isExpired) return false;
  
  return this.targetAudience.semesters.includes(userSemester) || 
         this.targetAudience.branches.includes(userBranch);
};

const StudyMaterial = mongoose.model('StudyMaterial', studyMaterialSchema);

export default StudyMaterial;
