import asyncHandler from "./asyncHandler.js";
import ApiResponse from "./ApiResponse.js";
import ApiError from "./ApiError.js";
import { generateOTP, storeOTP, verifyOTP, clearOTP, sendOTPEmail } from "./otp.js";

// Generic forgot password handler
export const createForgotPasswordHandler = (Model, modelName = "User") => {
  return asyncHandler(async (req, res) => {
    const { email } = req.body;

    if (!email) {
      throw new ApiError(400, "Email is required");
    }

    // Check if user exists
    const user = await Model.findOne({ email: email.toLowerCase() });
    if (!user) {
      throw new ApiError(404, `${modelName} not found with this email`);
    }

    // Generate and store OTP
    const otp = generateOTP();
    storeOTP(email, otp);

    // Send OTP via email
    await sendOTPEmail(email, otp);

    res.status(200).json(
      new ApiResponse(200, {}, "OTP sent successfully to your email")
    );
  });
};

// Generic verify OTP handler
export const createVerifyOTPHandler = () => {
  return asyncHandler(async (req, res) => {
    const { email, otp } = req.body;

    if (!email || !otp) {
      throw new ApiError(400, "Email and OTP are required");
    }

    // Verify OTP
    const verification = verifyOTP(email, otp);
    if (!verification.valid) {
      throw new ApiError(400, verification.message);
    }

    res.status(200).json(
      new ApiResponse(200, {}, "OTP verified successfully")
    );
  });
};

// Generic reset password handler
export const createResetPasswordHandler = (Model, modelName = "User") => {
  return asyncHandler(async (req, res) => {
    const { email, otp, newPassword } = req.body;

    if (!email || !otp || !newPassword) {
      throw new ApiError(400, "Email, OTP, and new password are required");
    }

    // Verify OTP again
    const verification = verifyOTP(email, otp);
    if (!verification.valid) {
      throw new ApiError(400, verification.message);
    }

    // Find user and update password
    const user = await Model.findOne({ email: email.toLowerCase() });
    if (!user) {
      throw new ApiError(404, `${modelName} not found`);
    }

    user.password = newPassword;
    await user.save();

    // Clear OTP
    clearOTP(email);

    res.status(200).json(
      new ApiResponse(200, {}, "Password reset successfully")
    );
  });
};
