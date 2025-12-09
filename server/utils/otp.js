import nodemailer from 'nodemailer';

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

// Email sender using Gmail SMTP
export const sendOTPEmail = async (email, otp) => {
  try {
    // Create transporter with Gmail credentials
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    // Email content
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Buddhi Archives - Password Reset OTP',
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
              .container { max-width: 500px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 5px; }
              .header { background-color: #4CAF50; color: white; padding: 20px; text-align: center; border-radius: 5px 5px 0 0; }
              .content { padding: 20px; background-color: #f9f9f9; }
              .otp-box { background-color: #fff; border: 2px solid #4CAF50; padding: 20px; text-align: center; margin: 20px 0; border-radius: 5px; }
              .otp-code { font-size: 32px; font-weight: bold; letter-spacing: 5px; color: #4CAF50; }
              .footer { text-align: center; font-size: 12px; color: #777; padding: 20px; }
              .warning { color: #d32f2f; font-weight: bold; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>Buddhi Archives</h1>
              </div>
              <div class="content">
                <p>Hello,</p>
                <p>You have requested to reset your password. Please use the OTP below to complete the process:</p>
                <div class="otp-box">
                  <p>Your OTP:</p>
                  <div class="otp-code">${otp}</div>
                </div>
                <p><strong>OTP Details:</strong></p>
                <ul>
                  <li>This OTP is valid for <strong>5 minutes</strong> only.</li>
                  <li>Do not share this OTP with anyone.</li>
                  <li class="warning">If you did not request this, please ignore this email.</li>
                </ul>
                <p>If you have any questions, please contact our support team.</p>
                <p>Best regards,<br/>Buddhi Archives Team</p>
              </div>
              <div class="footer">
                <p>&copy; 2024 Buddhi Archives. All rights reserved.</p>
              </div>
            </div>
          </body>
        </html>
      `,
    };

    // Send email
    const info = await transporter.sendMail(mailOptions);
    console.log(`✓ OTP email sent to ${email}. Message ID: ${info.messageId}`);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error(`✗ Error sending OTP email to ${email}:`, error.message);
    throw new Error(`Failed to send OTP email: ${error.message}`);
  }
};
