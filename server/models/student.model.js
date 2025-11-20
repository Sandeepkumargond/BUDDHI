import mongoose, { Schema } from "mongoose";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const studentSchema = new Schema(
    {
        enrollmentNo: {
            type: Number,
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
        dateOfBirth: {
            type: Date,
            required: true,
        },
        email: {
            type: String,
            unique: true,
            required: [true, 'Email is required'],
            lowercase: true,
            trim: true,
            index: true,
        },
        personalMail: {
            type: String,
            unique: true,
            required: [true, 'Email is required'],
            lowercase: true,
            trim: true,
        },
        password: {
            type: String,
            required: [true, 'Password is required'],
        },
        accountStatus: {
            type: String,
            enum: ['approved', 'banned'],
            default: 'approved',
        },
        imageUrl: {
            type: String,
            default: null,
        },
        semester: {
            type: Number,
            required: true,
        },
        section: {
            type: String,
            trim: true,
        },
        batch: {
            type: String,
            trim: true,
            default: '',
        },
        mobile: {
            type: String,
            trim: true,
        },
        address: {
            type: String,
            trim: true,
        },
        rollNo: {
            type: Number,
            required: true,
            index: true,
        },
        fatherName: {
            type: String,
            trim: true,
        },
        motherName: {
            type: String,
            trim: true,
        },
        fatherMobile: {
            type: String,
            trim: true,
        },
        motherMobile: {
            type: String,
            trim: true,
        },
        fatherOccupation: {
            type: String,
            trim: true,
        },
        motherOccupation: {
            type: String,
            trim: true,
        },
        annualIncome: {
            type: Number,
        },
        bloodGroup: {
            type: String,
            trim: true,
        },
        religion: {
            type: String,
            trim: true,
        },
        category: {
            type: String,
            trim: true,
        },
        gender: {
            type: String,
            required: true,
            trim: true,
        },
        aadharNo: {
            type: Number,
        },
        pwd: {
            type: Boolean,
            default: false,
        },
        pwdPercentage: {
            type: Number,
            default: 0,
        },
        pwdCertificateUrl: {
            type: String,
            default: null,
        },
        program: {
            type: String,
            enum: ['B.Tech', 'M.Tech', 'PhD', 'MBA', 'MCA', 'Dual Degree', 'BCA'],
        },
        branch: {
            type: String,
            enum: ['CSE', 'ECE', 'ME', 'CE', 'EE', 'Architecture', 'Chemical', 'Biotech', 'IT']
        },
        educationalInfo: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'EducationalInfo',
        },
        isHosteller: {
            type: Boolean,
            default: false,
        },
        hostelAlloted: {
            type: String,
        },
        roomNo: {
            type: String,
        },
        academicFeePayment: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'FeePayment',
        },
        hostelAndMessFeePayment: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'FeePayment',
        },
        signUrl: {
            type: String,
            default: null,
        },
        abcId: {
            type: String,
            unique: true,
        },
        dateOfAdmission: {
            type: Date,
        },
        passOutYear: {
            type: Number,
        },
        isScholarshipHolder: {
            type: Boolean,
            default: false,
        },
        scholarshipDetails: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Scholarship',
        },
        bookIssued: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'BookIssue',
        }],
        fine: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Fine',
            }
        ],
        gradeCard: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'GradeCard',
            }
        ],
        registrationNumber: {
            type: String,
            unique: true,
        },
        refreshToken: {
            type: String,
        },
        role: {
            type: String,
            enum: ['student'],
            default: 'student',
        }
    },
    { timestamps: true }
);

studentSchema.pre("save", async function (next) {
    if (!this.isModified("password")) return next();

    this.password = await bcrypt.hash(this.password, 10);
    next();
});

studentSchema.methods.isPasswordCorrect = async function (password) {
    return await bcrypt.compare(password, this.password);
};

studentSchema.methods.generateAccessToken = function () {
    return jwt.sign(
        {
            _id: this._id,
            email: this.email,
        },
        process.env.ACCESS_TOKEN_SECRET,
        {
            expiresIn: process.env.ACCESS_TOKEN_EXPIRY,
        }
    );
}

studentSchema.methods.generateRefreshToken = function () {
    return jwt.sign(
        {
            _id: this._id,
        },
        process.env.REFRESH_TOKEN_SECRET,
        {
            expiresIn: process.env.REFRESH_TOKEN_EXPIRY
        }
    );
}

export const Student = mongoose.model("Student", studentSchema);
