import mongoose, { Schema } from "mongoose";

// Subject schema for individual subject marks
const subjectSchema = new Schema({
    code: {
        type: String,
        required: true,
        trim: true,
    },
    name: {
        type: String,
        required: true,
        trim: true,
    },
    type: {
        type: String,
        enum: ['Theory', 'Lab', 'Practical'],
        required: true,
    },
    credits: {
        type: Number,
        required: true,
        min: 0,
    },
    internal: {
        type: Number,
        min: 0,
        max: 100,
        default: 0,
    },
    external: {
        type: Number,
        min: 0,
        max: 100,
        default: 0,
    },
    total: {
        type: Number,
        min: 0,
        max: 100,
        default: 0,
    },
    grade: {
        type: String,
        enum: ['A+', 'A', 'B+', 'B', 'C+', 'C', 'D', 'F'],
        default: 'F',
    },
    gradePoint: {
        type: Number,
        min: 0,
        max: 10,
        default: 0,
    },
    status: {
        type: String,
        enum: ['Pass', 'Fail', 'Absent', 'Reappear'],
        default: 'Fail',
    }
});

// Grade card schema for each semester
const gradeCardSchema = new Schema(
    {
        student: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Student',
            required: true,
            index: true,
        },
        semester: {
            type: Number,
            required: true,
            min: 1,
            max: 10,
        },
        academicYear: {
            type: String,
            required: true,
            trim: true,
        },
        subjects: [subjectSchema],
        sgpa: {
            type: Number,
            min: 0,
            max: 10,
            default: 0,
        },
        creditsAttempted: {
            type: Number,
            min: 0,
            default: 0,
        },
        creditsEarned: {
            type: Number,
            min: 0,
            default: 0,
        },
        status: {
            type: String,
            enum: ['Pass', 'Fail', 'Pending'],
            default: 'Pending',
        },
        resultDeclaredOn: {
            type: Date,
        },
        examType: {
            type: String,
            enum: ['Regular', 'Supplementary', 'Improvement'],
            default: 'Regular',
        }
    },
    { timestamps: true }
);

// Index for faster queries
gradeCardSchema.index({ student: 1, semester: 1 }, { unique: true });

// Methods to calculate SGPA automatically
gradeCardSchema.methods.calculateSGPA = function() {
    if (!this.subjects || this.subjects.length === 0) {
        this.sgpa = 0;
        return 0;
    }
    
    let totalPoints = 0;
    let totalCredits = 0;
    
    this.subjects.forEach(subject => {
        if (subject.status === 'Pass') {
            totalPoints += subject.gradePoint * subject.credits;
            totalCredits += subject.credits;
        }
    });
    
    this.sgpa = totalCredits > 0 ? +(totalPoints / totalCredits).toFixed(2) : 0;
    this.creditsEarned = totalCredits;
    
    return this.sgpa;
};

// Calculate credits attempted
gradeCardSchema.methods.calculateCreditsAttempted = function() {
    this.creditsAttempted = this.subjects.reduce((total, subject) => total + subject.credits, 0);
    return this.creditsAttempted;
};

// Update status based on subjects
gradeCardSchema.methods.updateStatus = function() {
    if (!this.subjects || this.subjects.length === 0) {
        this.status = 'Pending';
        return;
    }
    
    const hasFailures = this.subjects.some(subject => subject.status === 'Fail' || subject.status === 'Absent');
    const hasPending = this.subjects.some(subject => subject.status === 'Reappear');
    
    if (hasFailures || hasPending) {
        this.status = 'Fail';
    } else {
        this.status = 'Pass';
    }
};

// Pre-save middleware to auto-calculate SGPA and status
gradeCardSchema.pre('save', function(next) {
    this.calculateCreditsAttempted();
    this.calculateSGPA();
    this.updateStatus();
    next();
});

export const GradeCard = mongoose.model("GradeCard", gradeCardSchema);