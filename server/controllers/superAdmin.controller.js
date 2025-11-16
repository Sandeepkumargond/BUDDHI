import asyncHandler from "../utils/asyncHandler.js";
import ApiResponse from "../utils/ApiResponse.js";
import ApiError from "../utils/ApiError.js";
import jwt from "jsonwebtoken";
import { SuperAdmin } from "../models/superAdmin.model.js";
import { uploadImageOnImageKit, deleteFromImageKit, getFileIdFromUrl } from "../utils/ImageKit.js";
import { Admin } from "../models/admin.model.js";
import { getAdminDetailsById } from "./admin.controller.js";

export const getSuperAdminById = asyncHandler(async (req, res, next) => {
    // console.log(req.params);
    const superAdminId = req.params.id;

    const superAdmin = await getSuperAdminDetailsById(superAdminId);

    return res.status(200).json(
        new ApiResponse(
            200,
            {
                superAdmin,
            },
            "SuperAdmin fetched successfully"
        )
    );
});

export const getMyProfile = asyncHandler(async (req, res, next) => {
    const superAdminId = req.user?._id;

    const superAdmin = await getSuperAdminDetailsById(superAdminId);

    return res.status(200).json(
        new ApiResponse(
            200,
            {
                superAdmin,
            },
            "User fetched successfully"
        )
    );
});

export const getSuperAdminDetailsById = async (superAdminId) => {
    // console.log(`Getting superAdmin by ID: ${superAdminId}`);
    if (!superAdminId) {
        throw new ApiError(400, "SuperAdmin ID is required");
    }

    const superAdmin = await SuperAdmin.findById(superAdminId).select("-password -refreshToken");

    if (!superAdmin) {
        throw new ApiError(404, "SuperAdmin not found");
    }

    // console.log(superAdmin);

    return superAdmin;
};

const generateSuperAdminAccessAndRefreshToken = async (superAdminId) => {
    // console.log(superAdminId);
    try {
        const superAdmin = await getSuperAdminDetailsById(superAdminId);
        // console.log(superAdmin);

        const accessToken = superAdmin.generateAccessToken();
        const refreshToken = superAdmin.generateRefreshToken();

        // console.log(`AccessToken : ${accessToken} refreshToken: ${refreshToken}`);

        superAdmin.refreshToken = refreshToken;
        await superAdmin.save({ validateBeforeSave: false });

        return { accessToken, refreshToken };
    } catch (error) {
        throw new ApiError(500, "Something went wrong while generating refresh and access token");
    }
};

export const registerSuperAdmin = asyncHandler(async (req, res, next) => {
    // console.log(req.body);
    const { firstName, lastName, email, username, password } = req.body;
    // console.log(`email: ${email}`);

    if (
        [firstName, lastName, email, password, username].some((field) => !field || field?.trim() === "")
    ) {
        throw new ApiError(400, "All fields are required")
    }

    email = email?.toLowerCase();
    username = username?.toLowerCase();

    const existedSuperAdmin = await SuperAdmin.findOne({
        $or: [{ email }, { username }]
    });

    if (existedSuperAdmin) {
        throw new ApiError(409, "SuperAdmin with username or email already exists");
    }

    const superAdmin = await SuperAdmin.create({
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        email: email.toLowerCase(),
        username: username.toLowerCase(),
        password
    });

    const createdSuperAdmin = await getSuperAdminDetailsById(superAdmin?._id);
    // console.log(createdSuperAdmin);

    if (!createdSuperAdmin) {
        throw new ApiError(500, "Something Went Wrong while creating a new superAdmin.")
    }

    return res.status(201).json(
        new ApiResponse(
            201,
            {
                createdSuperAdmin,
            },
            "SuperAdmin Created Successfully"
        )
    )
});

export const loginSuperAdmin = asyncHandler(async (req, res, next) => {
    let { username, email, password } = req.body;
    // console.log(`username: ${username}, email: ${email}`)

    if (!password) {
        throw new ApiError(400, "Password is required");
    }

    username = username?.toLowerCase();
    email = email?.toLowerCase();

    if (!username && !email) {
        throw new ApiError(400, "Username or Email is required");
    }


    const superAdmin = await SuperAdmin.findOne({
        $or: [{ email }, { username }]
    });

    if (!superAdmin) {
        throw new ApiError(404, "SuperAdmin doesn't exist");
    }

    const isPasswordValid = await superAdmin.isPasswordCorrect(password);

    if (!isPasswordValid) {
        throw new ApiError(401, "Incorrect Password.");
    }

    const { accessToken, refreshToken } = await generateSuperAdminAccessAndRefreshToken(superAdmin?._id);

    // console.log(`AccessToken : ${accessToken} refreshToken: ${refreshToken}`);

    const loggedInSuperAdmin = await getSuperAdminDetailsById(superAdmin._id);

    const options = {
        httpOnly: true,
        secure: true
    }

    return res
        .status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", refreshToken, options)
        .json(
            new ApiResponse(
                200,
                {
                    user: loggedInSuperAdmin,
                    accessToken,
                    refreshToken
                },
                "SuperAdmin logged In Successfully!"
            )
        )
});

export const logoutSuperAdmin = asyncHandler(async (req, res, next) => {
    const superAdmin = await SuperAdmin.findByIdAndUpdate(req.user?._id,
        {
            $unset: { refreshToken: 1 }
        },
        {
            new: true,
        }
    ).select("-password");

    const options = {
        httpOnly: true,
        secure: true
    }

    return res
        .status(200)
        .clearCookie("accessToken", options)
        .clearCookie("refreshToken", options)
        .json(
            new ApiResponse(
                200,
                {
                    user: superAdmin,
                },
                "SuperAdmin logged out successfully"
            )
        );
});

export const refreshSuperAdminAccessToken = asyncHandler(async (req, res) => {
    const incomingRefreshToken = req.cookies?.refreshToken || req.body?.refreshToken;

    if (!incomingRefreshToken) {
        throw new ApiError(401, "Unauthorized Request!");
    }

    try {
        const decodedToken = jwt.verify(incomingRefreshToken, process.env.REFRESH_TOKEN_SECRET);

        const superAdmin = await SuperAdmin.findById(decodedToken?._id).select("-password");

        if (!superAdmin) {
            throw new ApiError(401, "Invalid Refresh Token")
        }

        if (incomingRefreshToken !== superAdmin.refreshToken) {
            throw new ApiError(401, "Refresh Token is expired or used");
        }

        const options = {
            httpOnly: true,
            secure: true
        }

        const { accessToken, refreshToken: newRefreshToken } = await generateSuperAdminAccessAndRefreshToken(superAdmin._id);

        res
            .status(200)
            .cookie("accessToken", accessToken, options)
            .cookie("refreshToken", newRefreshToken, options)
            .json(
                new ApiResponse(
                    200,
                    { accessToken, refreshToken: newRefreshToken },
                    "Access token refreshed"
                )
            )
    } catch (error) {
        throw new ApiError(401, error?.message || "Invalid Refresh Token")
    }


});

export const updateSuperAdminImage = asyncHandler(async (req, res, next) => {
    const superAdminId = req.user?._id;

    const superAdmin = await getSuperAdminDetailsById(superAdminId);

    const oldImageUrl = superAdmin.imageUrl || "";

    const oldImageFileId = await getFileIdFromUrl(oldImageUrl);

    const imageLocalPath = req.file?.path;

    if (!imageLocalPath) {
        throw new ApiError(400, "Please provide a valid image");
    }

    const image = await uploadImageOnImageKit(imageLocalPath, superAdmin.username);

    if (!image || image.error) {
        throw new ApiError(500, "Failed to upload image image");
    }

    const updatedSuperAdmin = await SuperAdmin.findByIdAndUpdate(
        superAdminId,
        {
            $set: { imageUrl: image.url }
        },
        { new: true }
    ).select("-password -refreshToken");

    // Delete old avatar if exists (pass fileId from the response)
    if (updatedSuperAdmin && oldImageUrl) {
        await deleteFromImageKit(oldImageFileId);
    }

    return res.status(200).json(
        new ApiResponse(
            200,
            {
                updatedSuperAdmin,
            },
            "SuperAdmin image updated successfully"
        )
    );
});

export const updateSuperAdminAccountDetails = asyncHandler(async (req, res, next) => {
    const superAdminId = req.user?._id;
    const superAdmin = await getSuperAdminDetailsById(superAdminId);

    if (!superAdmin) {
        throw new ApiError(404, "SuperAdmin not found");
    }

    const {
        firstName,
        lastName,
        mobile,
        social
    } = req.body || {};


    const updateData = {
        firstName: firstName !== undefined ? firstName : superAdmin.firstName,
        lastName: lastName !== undefined ? lastName : superAdmin.lastName,
        mobile: mobile !== undefined ? mobile : superAdmin.mobile,
        social: social !== undefined ? social : superAdmin.social,
    };



    const updatedSuperAdmin = await SuperAdmin.findByIdAndUpdate(
        superAdminId,
        { $set: updateData },
        { new: true }
    ).select("-password -refreshToken");

    return res.status(200).json(
        new ApiResponse(
            200,
            {
                updatedSuperAdmin,
            },
            "SuperAdmin account details updated successfully"
        )
    );

});

export const changeSuperAdminPassword = asyncHandler(async (req, res, next) => {
    const superAdminId = req.user?._id;

    const superAdmin = await SuperAdmin.findById(superAdminId);

    if (!superAdmin) {
        throw new ApiError(404, "SuperAdmin not found");
    }

    const { currentPassword, newPassword } = req.body;

    const isPasswordCorrect = await superAdmin.isPasswordCorrect(currentPassword);

    if (!isPasswordCorrect) {
        throw new ApiError(401, "Incorrect Current Password.");
    }

    superAdmin.password = newPassword;
    await superAdmin.save({ validateBeforeSave: false });

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                {
                },
                "Password Changed Successfully"
            )
        );
});

export const createAdmin = asyncHandler(async (req, res, next) => {
    const { firstName, lastName, email, password, collegeName, abbreviation, personalMail } = req.body;

    if (
        [firstName, lastName, email, password, collegeName, abbreviation, personalMail].some((field) => !field || field?.trim() === "")
    ) {
        throw new ApiError(400, "All fields are required")
    }

    const existedAdmin = await Admin.findOne({ personalMail: personalMail.toLowerCase() }).lean();

    if (existedAdmin) {
        throw new ApiError(409, "Admin with this email already exists");
    }

    const year = new Date().getFullYear();

    const collegeRegistartionNo = `${abbreviation.trim().toUpperCase()}_${year}`;

    const admin = await Admin.create({
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        email: email.toLowerCase(),
        personalMail,
        password,
        collegeName: collegeName.trim(),
        collegeRegistartionNo,
        abbreviation
    });

    const createdAdmin = await getAdminDetailsById(admin?._id);

    if (!createdAdmin) {
        throw new ApiError(500, "An Error occured while creating the admin.");
    }

    return res.status(200)
        .json(
            new ApiResponse(
                200,
                createdAdmin,
                "College Admin Created Successfully."
            )
        );

});

export const deleteAdmin = asyncHandler(async (req, res, next) => {
    const { adminId, email } = req.body;

    if (!adminId && !email) {
        throw new ApiError(400, "AdminId or Email Id is required");
    }

    const admin = await Admin.findOneAndDelete({
        $or: [{ email }, { id: adminId }]
    }).select("-password");

    if (!admin) {
        throw new ApiError(404, "Admin not found")
    }

    return res.status(200)
        .json(
            new ApiResponse(200,
                admin,
                "Admin Deleted Successfully"
            )
        )
})