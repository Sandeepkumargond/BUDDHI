import mongoose, { Schema } from "mongoose";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const facultySchema = new Schema(
    {
        facultyId: {
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
        mobile: {
            type: String,
            trim: true,
        },
        address: {
            type: String,
            trim: true,
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
        department: {
            type: String,
            required: true,
            trim: true,
        },
        signUrl: {
            type: String,
            default: null,
        },
        educationalInfo: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'EducationalInfo',
        },
        about: {
            type: String,
            trim: true,
        },
        workExperience: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'WorkExperience',
        }],
        memberships: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Membership',
        }],
        journalPapers: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'JournalPaper',
        }],
        conferencePapers: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'ConferencePaper',
        }],
        patents: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Patent',
        }],
        sponsoredProjects: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Project',
        }],
        consultancyProjects: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Project',
        }],
        workshopsAndExperiences: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'WorkshopAndExperience',
        }],
        departmentActivities: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Activity',
        }],
        instituteActivities: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Activity',
        }],
        social: [
            {
                name: { type: String, enum: ['facebook', 'twitter', 'instagram', 'linkedin', 'youtube', 'website', 'other'] },
                url: { type: String, trim: true }
            }
        ],
        specialization: [{
            type: String,
            trim: true,
        }],
        designation: [
            {
                type: String,
                trim: true,
            }
        ],
        refreshToken: {
            type: String,
        },
        joiningDate: {
            type: Date,
        },
        role: {
            type: String,
            enum: ['faculty'],
            default: 'faculty',
        }
    },
    { timestamps: true }
);

facultySchema.pre("save", async function (next) {
    if (!this.isModified("password")) return next();

    this.password = await bcrypt.hash(this.password, 10);
    next();
});

facultySchema.methods.isPasswordCorrect = async function (password) {
    return await bcrypt.compare(password, this.password);
};

facultySchema.methods.generateAccessToken = function () {
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

facultySchema.methods.generateRefreshToken = function () {
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

export const Faculty = mongoose.model("Faculty", facultySchema);
