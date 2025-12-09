import mongoose from 'mongoose';

const pyqSchema = new mongoose.Schema({
  department: {
    type: String,
    required: [true, 'Department is required'],
    enum: ['CSE', 'ECE', 'EEE', 'MECH', 'CIVIL', 'IT', 'AIDS'],
    trim: true
  },
  
  semester: {
    type: Number,
    required: [true, 'Semester is required'],
    min: [1, 'Semester must be between 1 and 8'],
    max: [8, 'Semester must be between 1 and 8']
  },
  
  year: {
    type: String,
    required: [true, 'Year is required'],
    trim: true,
    match: [/^\d{4}$/, 'Year must be a valid 4-digit year (e.g., 2024)']
  },
  
  subject: {
    type: String,
    required: [true, 'Subject name is required'],
    trim: true,
    maxLength: [200, 'Subject name cannot exceed 200 characters']
  },
  
  pdfUrl: {
    type: String,
    required: [true, 'PDF URL is required']
  },
  
  pdfPublicId: {
    type: String,
    required: true
  },
  
  uploadedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'SubAdmin',
    required: true
  },
  
  uploadedByName: {
    type: String,
    required: true
  }
}, {
  timestamps: true
});

// Create indexes for efficient filtering
pyqSchema.index({ department: 1, semester: 1, year: 1, subject: 1 });
pyqSchema.index({ createdAt: -1 });

const PYQ = mongoose.model('PYQ', pyqSchema);

export default PYQ;
