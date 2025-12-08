import mongoose, { Schema } from "mongoose";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const internshipOpportunitySchema = new Schema({
    companyName: {
        type: String,
        required: true,
        trim: true,
    },
    position: {
        type: String,
        required: true,
        trim: true,
    },
    description: {
        type: String,
        required: true,
        trim: true,
    },
    duration: {
        type: String,
        trim: true,
    },
    stipend: {
        type: String,
        trim: true,
    },
    location: {
        type: String,
        trim: true,
    },
    requirements: {
        type: String,
        trim: true,
    },
    applyLink: {
        type: String,
        trim: true,
    },
    deadline: {
        type: Date,
    },
    isActive: {
        type: Boolean,
        default: true,
    },
    isApproved: {
        type: Boolean,
        default: false,
    },
    applicationsReceived: {
        type: Number,
        default: 0,
    },
}, { timestamps: true });

const referralSchema = new Schema({
    companyName: {
        type: String,
        required: true,
        trim: true,
    },
    position: {
        type: String,
        required: true,
        trim: true,
    },
    description: {
        type: String,
        trim: true,
    },
    requirements: {
        type: String,
        trim: true,
    },
    contactEmail: {
        type: String,
        trim: true,
    },
    referralType: {
        type: String,
        enum: ['direct', 'indirect', 'networking'],
        default: 'direct',
    },
    isApproved: {
        type: Boolean,
        default: false,
    },
    isActive: {
        type: Boolean,
        default: true,
    },
    interestedStudents: [{
        studentId: {
            type: Schema.Types.ObjectId,
            ref: 'Student',
        },
        appliedAt: {
            type: Date,
            default: Date.now,
        },
    }],
}, { timestamps: true });

const donationSchema = new Schema({
    amount: {
        type: Number,
        required: true,
        min: 0,
    },
    currency: {
        type: String,
        default: 'INR',
        trim: true,
    },
    purpose: {
        type: String,
        required: true,
        enum: ['scholarship', 'infrastructure', 'research', 'general', 'event', 'other'],
    },
    description: {
        type: String,
        trim: true,
    },
    transactionId: {
        type: String,
        trim: true,
    },
    paymentMethod: {
        type: String,
        enum: ['upi', 'netbanking', 'card', 'cheque', 'other'],
    },
    status: {
        type: String,
        enum: ['pending', 'completed', 'failed'],
        default: 'pending',
    },
    receiptUrl: {
        type: String,
        trim: true,
    },
    donatedAt: {
        type: Date,
        default: Date.now,
    },
}, { timestamps: true });

const alumniSchema = new Schema({
    alumniId: {
        type: String,
        unique: true,
        required: true,
        index: true,
    },
    firstName: {
        type: String,
        required: true,
        trim: true,
    },
    lastName: {
        type: String,
        required: true,
        trim: true,
    },
    email: {
        type: String,
        unique: true,
        required: [true, 'Email is required'],
        lowercase: true,
        trim: true,
        index: true,
    },
    password: {
        type: String,
        required: [true, 'Password is required'],
    },
    dateOfBirth: {
        type: Date,
    },
    gender: {
        type: String,
        enum: ['male', 'female', 'other'],
    },
    mobile: {
        type: String,
        trim: true,
    },
    alternateEmail: {
        type: String,
        lowercase: true,
        trim: true,
    },
    imageUrl: {
        type: String,
        default: null,
    },
    
    // Academic Information
    department: {
        type: String,
        required: true,
        trim: true,
    },
    degree: {
        type: String,
        required: true,
        trim: true,
    },
    batch: {
        type: String,
        required: true,
        trim: true,
    },
    graduationYear: {
        type: Number,
        required: true,
    },
    rollNumber: {
        type: String,
        trim: true,
    },
    
    // Professional Information
    currentCompany: {
        type: String,
        trim: true,
    },
    currentDesignation: {
        type: String,
        trim: true,
    },
    industry: {
        type: String,
        trim: true,
    },
    workExperience: [{
        company: String,
        designation: String,
        startDate: Date,
        endDate: Date,
        isCurrent: Boolean,
        description: String,
    }],
    linkedinUrl: {
        type: String,
        trim: true,
    },
    
    // Address
    currentAddress: {
        street: String,
        city: String,
        state: String,
        country: String,
        pincode: String,
    },
    
    // Alumni Contributions
    internshipOpportunities: [internshipOpportunitySchema],
    referrals: [referralSchema],
    donations: [donationSchema],
    
    // Engagement
    isActive: {
        type: Boolean,
        default: true,
    },
    isVerified: {
        type: Boolean,
        default: false,
    },
    willingToMentor: {
        type: Boolean,
        default: false,
    },
    areasOfExpertise: [{
        type: String,
        trim: true,
    }],
    bio: {
        type: String,
        trim: true,
    },
    achievements: [{
        title: String,
        description: String,
        date: Date,
    }],
    
    // System fields
    accountStatus: {
        type: String,
        enum: ['active', 'inactive', 'suspended'],
        default: 'active',
    },
    refreshToken: {
        type: String,
    },
    role: {
        type: String,
        enum: ['alumni'],
        default: 'alumni',
    },
}, { timestamps: true });

// Indexes for better query performance
alumniSchema.index({ graduationYear: 1, department: 1 });
alumniSchema.index({ currentCompany: 1 });
alumniSchema.index({ isVerified: 1, isActive: 1 });

// Hash password before saving
alumniSchema.pre("save", async function (next) {
    if (!this.isModified("password")) return next();
    this.password = await bcrypt.hash(this.password, 10);
    next();
});

// Compare password
alumniSchema.methods.isPasswordCorrect = async function (password) {
    return await bcrypt.compare(password, this.password);
};

// Generate access token
alumniSchema.methods.generateAccessToken = function () {
    return jwt.sign(
        {
            _id: this._id,
            email: this.email,
            role: this.role,
        },
        process.env.ACCESS_TOKEN_SECRET,
        {
            expiresIn: process.env.ACCESS_TOKEN_EXPIRY,
        }
    );
};

// Generate refresh token
alumniSchema.methods.generateRefreshToken = function () {
    return jwt.sign(
        {
            _id: this._id,
        },
        process.env.REFRESH_TOKEN_SECRET,
        {
            expiresIn: process.env.REFRESH_TOKEN_EXPIRY
        }
    );
};

// Virtual for full name
alumniSchema.virtual('fullName').get(function() {
    return `${this.firstName} ${this.lastName}`;
});

// Virtual for total donations
alumniSchema.virtual('totalDonations').get(function() {
    return this.donations
        .filter(d => d.status === 'completed')
        .reduce((sum, d) => sum + d.amount, 0);
});

export const Alumni = mongoose.model("Alumni", alumniSchema);
