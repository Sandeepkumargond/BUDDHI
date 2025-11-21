import asyncHandler from "../utils/asyncHandler.js";
import ApiResponse from "../utils/ApiResponse.js";
import ApiError from "../utils/ApiError.js";
import { Faculty } from "../models/faculty.model.js";
import jwt from "jsonwebtoken";
import { deleteFromImageKit, getFileIdFromUrl, uploadImageOnImageKit } from "../utils/ImageKit.js";

export const getFacultyById = asyncHandler(async (req, res) => {
    const facultyId = req.params.id;

    const faculty = await getFacultyDetailsById(facultyId);

    res.status(200)
        .json(
            new ApiResponse(
                200,
                faculty,
                "Faculty details fetched successfully"
            )
        )
});

export const getFacultyDetailsById = async (facultyId) => {
    if (!facultyId) {
        throw new ApiError(400, "Faculty ID is required");
    }

    const faculty = await Faculty.findById(facultyId).select("-password -refreshToken");

    if (!faculty) {
        throw new ApiError(404, "Faculty not found");
    }

    return faculty;
};

export const getMyProfile = asyncHandler(async (req, res) => {
    const facultyId = req.user?._id;

    const faculty = await getFacultyDetailsById(facultyId);

    return res.status(200).json(
        new ApiResponse(
            200,
            {
                user: faculty,
            },
            "Faculty profile fetched successfully"
        )
    );
});

export const changeFacultyPassword = asyncHandler(async (req, res, next) => {
    const facultyId = req.user?._id;

    const faculty = await Faculty.findById(facultyId);

    if (!faculty) {
        throw new ApiError(404, "faculty not found");
    }

    const { currentPassword, newPassword } = req.body;

    const isPasswordCorrect = await faculty.isPasswordCorrect(currentPassword);

    if (!isPasswordCorrect) {
        throw new ApiError(401, "Incorrect Current Password.");
    }

    faculty.password = newPassword;
    await faculty.save({ validateBeforeSave: false });

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                {},
                "Password Changed Successfully"
            )
        );
});

export const generateFacultyAccessAndRefreshToken = async (facultyId) => {
    // console.log(facultyId);
    try {
        const faculty = await getFacultyDetailsById(facultyId);
        // console.log(faculty);

        const accessToken = faculty.generateAccessToken();
        const refreshToken = faculty.generateRefreshToken();

        // console.log(`AccessToken : ${accessToken} refreshToken: ${refreshToken}`);

        faculty.refreshToken = refreshToken;
        await faculty.save({ validateBeforeSave: false });

        return { accessToken, refreshToken };
    } catch (error) {
        throw new ApiError(500, "Something went wrong while generating refresh and access token");
    }
};

export const loginFaculty = asyncHandler(async (req, res, next) => {
    let { email, password } = req.body || {};

    if (!password) {
        throw new ApiError(400, "Password is required");
    }

    if (!email) {
        throw new ApiError(400, "Email is required");
    }

    email = email.toLowerCase();

    const faculty = await Faculty.findOne({ email });

    if (!faculty) {
        throw new ApiError(404, "Faculty doesn't exist");
    }

    const isPasswordValid = await faculty.isPasswordCorrect(password);

    if (!isPasswordValid) {
        throw new ApiError(401, "Incorrect Password.");
    }

    const { accessToken, refreshToken } = await generateFacultyAccessAndRefreshToken(faculty?._id);

    const loggedInFaculty = await getFacultyDetailsById(faculty?._id);

    const options = {
        httpOnly: true,
        secure: true,
        sameSite: 'None'
    }

    return res
        .status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", refreshToken, options)
        .json(
            new ApiResponse(
                200,
                {
                    user: loggedInFaculty,
                    accessToken,
                    refreshToken
                },
                "Faculty logged In Successfully!"
            )
        )
})

export const logoutFaculty = asyncHandler(async (req, res, next) => {
    const faculty = await Faculty.findByIdAndUpdate(req.user?._id,
        {
            $unset: { refreshToken: 1 }
        },
        {
            new: true,
        }
    ).select("-password");

    const options = {
        httpOnly: true,
        secure: true,
        sameSite: 'None'
    }

    return res
        .status(200)
        .clearCookie("accessToken", options)
        .clearCookie("refreshToken", options)
        .json(
            new ApiResponse(
                200,
                {
                    user: faculty,
                },
                "Faculty logged out successfully"
            )
        );
})

export const refreshFacultyAccessToken = asyncHandler(async (req, res) => {
    const incomingRefreshToken = req.cookies?.refreshToken || req.body?.refreshToken;

    if (!incomingRefreshToken) {
        throw new ApiError(401, "Unauthorized Request!");
    }

    try {
        const decodedToken = jwt.verify(incomingRefreshToken, process.env.REFRESH_TOKEN_SECRET);

        const faculty = await Faculty.findById(decodedToken?._id).select("-password");

        if (!faculty) {
            throw new ApiError(401, "Invalid Refresh Token")
        }

        if (incomingRefreshToken !== faculty.refreshToken) {
            throw new ApiError(401, "Refresh Token is expired or used");
        }

        const options = {
            httpOnly: true,
            secure: true,
            sameSite: 'None'
        }

        const { accessToken, refreshToken: newRefreshToken } = await generateFacultyAccessAndRefreshToken(faculty._id);

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

export const updateFacultyAccountDetails = asyncHandler(async (req, res, next) => {
    const facultyId = req.user?._id;
    const faculty = await getFacultyDetailsById(facultyId);

    if (!faculty) {
        throw new ApiError(404, "Faculty not found");
    }

    const {
        firstName,
        lastName,
        dateOfBirth,
        personalMail,
        imageUrl,
        mobile,
        address,
        bloodGroup,
        religion,
        category,
        gender,
        aadharNo,
        department,
        signUrl,
        about,
        social,
        specialization
    } = req.body || {};

    let parsedSocial = social;
    if (typeof parsedSocial === 'string') {
        try { parsedSocial = JSON.parse(parsedSocial); } catch (e) { /* ignore */ }
    }

    let parsedSpecialization = specialization;
    if (typeof parsedSpecialization === 'string') {
        try { parsedSpecialization = JSON.parse(parsedSpecialization); } catch (e) {
            // allow comma separated string
            parsedSpecialization = parsedSpecialization.split(',').map(s=>s.trim()).filter(Boolean);
        }
    }

    const updateData = {
        firstName: firstName !== undefined ? firstName : faculty.firstName,
        lastName: lastName !== undefined ? lastName : faculty.lastName,
    dateOfBirth: dateOfBirth !== undefined ? dateOfBirth : faculty.dateOfBirth,
    imageUrl: imageUrl !== undefined ? imageUrl : faculty.imageUrl,
    mobile: mobile !== undefined ? mobile : faculty.mobile,
    personalMail: personalMail !== undefined ? personalMail : faculty.personalMail,
    address: address !== undefined ? address : faculty.address,
    bloodGroup: bloodGroup !== undefined ? bloodGroup : faculty.bloodGroup,
    religion: religion !== undefined ? religion : faculty.religion,
    category: category !== undefined ? category : faculty.category,
    gender: gender !== undefined ? gender : faculty.gender,
    aadharNo: aadharNo !== undefined ? aadharNo : faculty.aadharNo,
    department: department !== undefined ? department : faculty.department,
    signUrl: signUrl !== undefined ? signUrl : faculty.signUrl,
    about: about !== undefined ? about : faculty.about,
    social: parsedSocial !== undefined ? parsedSocial : faculty.social,
    specialization: parsedSpecialization !== undefined ? parsedSpecialization : faculty.specialization,
    };

    const updatedFaculty = await Faculty.findByIdAndUpdate(
        facultyId,
        { $set: updateData },
        { new: true }
    ).select("-password -refreshToken");

    return res.status(200).json(
        new ApiResponse(
            200,
            {
                updatedFaculty,
            },
            "Faculty account details updated successfully"
        )
    );
});

export const updateFacultyImage = asyncHandler(async (req, res, next) => {
    const facultyId = req.user?._id;

    const faculty = await getFacultyDetailsById(facultyId);

    const oldImageUrl = faculty.imageUrl || "";

    const oldImageFileId = await getFileIdFromUrl(oldImageUrl);

    const imageLocalPath = req.file?.path;

    if (!imageLocalPath) {
        throw new ApiError(400, "Please provide a valid image");
    }

    const image = await uploadImageOnImageKit(imageLocalPath, faculty.firstName);

    if (!image || image.error) {
        throw new ApiError(500, "Failed to upload image image");
    }

    const updatedFaculty = await Faculty.findByIdAndUpdate(
        facultyId,
        {
            $set: { imageUrl: image.url }
        },
        { new: true }
    ).select("-password -refreshToken");

    // Delete old avatar if exists (pass fileId from the response)
    if (updatedFaculty && oldImageUrl) {
        await deleteFromImageKit(oldImageFileId);
    }

    return res.status(200).json(
        new ApiResponse(
            200,
            {
                updatedFaculty,
            },
            "Faculty image updated successfully"
        )
    );
});

export const updateFacultySign = asyncHandler(async (req, res, next) => {
    const facultyId = req.user?._id;

    const faculty = await getFacultyDetailsById(facultyId);

    const oldSignUrl = faculty.signUrl || "";
    const oldSignFileId = await getFileIdFromUrl(oldSignUrl);

    const signLocalPath = req.file?.path;

    if (!signLocalPath) {
        throw new ApiError(400, "Please provide a valid signature file");
    }

    const sign = await uploadImageOnImageKit(signLocalPath, `${faculty.firstName}-sign`);

    if (!sign || sign.error) {
        throw new ApiError(500, "Failed to upload signature");
    }

    const updatedFaculty = await Faculty.findByIdAndUpdate(
        facultyId,
        {
            $set: { signUrl: sign.url }
        },
        { new: true }
    ).select("-password -refreshToken");

    // Delete old signature if exists
    if (updatedFaculty && oldSignUrl) {
        await deleteFromImageKit(oldSignFileId);
    }

    return res.status(200).json(
        new ApiResponse(
            200,
            {
                updatedFaculty,
            },
            "Faculty signature updated successfully"
        )
    );
});

export const availableMail = asyncHandler(async (req, res, next) => {
    const { email } = req.body;

    const faculty = await Faculty.findOne({ email });

    if (faculty) {
        return res.status(200).json(
            new ApiResponse(
                200,
                {
                    isAvailable: false,
                },
                "Email is already taken"
            )
        );
    }

    return res.status(200).json(
        new ApiResponse(
            200,
            {
                isAvailable: true,
            },
            "Email is available"
        )
    );
});

