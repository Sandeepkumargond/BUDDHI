// Simple in-memory OTP storage (for production, use Redis or database)
const otpStore = new Map();

// Generate 6-digit OTP
export const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Store OTP with expiry (5 minutes)
export const storeOTP = (email, otp) => {
  const expiryTime = Date.now() + 5 * 60 * 1000; // 5 minutes
  otpStore.set(email.toLowerCase(), { otp, expiryTime });
  
  // Auto-cleanup after 10 minutes
  setTimeout(() => {
    otpStore.delete(email.toLowerCase());
  }, 10 * 60 * 1000);
};

// Verify OTP
export const verifyOTP = (email, otp) => {
  const stored = otpStore.get(email.toLowerCase());
  
  if (!stored) {
    return { valid: false, message: 'OTP not found or expired' };
  }
  
  if (Date.now() > stored.expiryTime) {
    otpStore.delete(email.toLowerCase());
    return { valid: false, message: 'OTP expired' };
  }
  
  if (stored.otp !== otp) {
    return { valid: false, message: 'Invalid OTP' };
  }
  
  return { valid: true };
};

// Clear OTP after successful verification
export const clearOTP = (email) => {
  otpStore.delete(email.toLowerCase());
};

// Simple email sender (console log for now - replace with actual email service)
export const sendOTPEmail = async (email, otp) => {
  // In production, integrate with SendGrid, NodeMailer, AWS SES, etc.
  console.log(`
===========================================
SENDING OTP EMAIL
===========================================
To: ${email}
Subject: Password Reset OTP
Message: Your OTP for password reset is: ${otp}
This OTP will expire in 5 minutes.
===========================================
  `);
  
  // For development, just return success
  return { success: true };
};
