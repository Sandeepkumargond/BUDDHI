import nodemailer from 'nodemailer';
import { Student } from '../models/student.model.js';
import { Faculty } from '../models/faculty.model.js';

/**
 * Generate a unique email with format: firstname{randomnumber}@nitp.ac.in
 * If email already exists, tries with different random numbers until a unique one is found
 * 
 * @param {string} firstName - First name of the user
 * @param {number} maxAttempts - Maximum number of attempts to find unique email (default: 100)
 * @returns {Promise<string>} - Unique email address
 */
export const generateUniqueEmail = async (firstName, maxAttempts = 100) => {
  if (!firstName || firstName.trim() === '') {
    throw new Error('First name is required to generate email');
  }

  const baseEmail = firstName.toLowerCase().replace(/\s+/g, '');
  const domain = '@nitp.ac.in';

  for (let i = 0; i < maxAttempts; i++) {
    const randomNumber = Math.floor(Math.random() * 10000);
    const email = `${baseEmail}${randomNumber}${domain}`;

    // Check if email exists in Student or Faculty collection
    const existingStudent = await Student.findOne({ email: email.toLowerCase() });
    const existingFaculty = await Faculty.findOne({ email: email.toLowerCase() });

    if (!existingStudent && !existingFaculty) {
      return email;
    }
  }

  throw new Error(`Unable to generate unique email after ${maxAttempts} attempts`);
};

/**
 * Generate a secure random password with uppercase, lowercase, numbers, and special characters
 * Password format: at least 12 characters with mixed case, numbers, and special characters
 * 
 * @param {number} length - Length of the password (default: 12)
 * @returns {string} - Generated password
 */
export const generateSecurePassword = (length = 12) => {
  const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const lowercase = 'abcdefghijklmnopqrstuvwxyz';
  const numbers = '0123456789';
  const specialChars = '!@#$%^&*_-+=';
  
  const allChars = uppercase + lowercase + numbers + specialChars;
  
  let password = '';
  
  // Ensure at least one character from each category
  password += uppercase[Math.floor(Math.random() * uppercase.length)];
  password += lowercase[Math.floor(Math.random() * lowercase.length)];
  password += numbers[Math.floor(Math.random() * numbers.length)];
  password += specialChars[Math.floor(Math.random() * specialChars.length)];
  
  // Fill the rest randomly
  for (let i = password.length; i < length; i++) {
    password += allChars[Math.floor(Math.random() * allChars.length)];
  }
  
  // Shuffle the password
  password = password.split('').sort(() => Math.random() - 0.5).join('');
  
  return password;
};

/**
 * Send credentials email to new student or faculty
 * Includes email and password in a professional HTML template
 * 
 * @param {object} options - Email options
 * @param {string} options.recipientEmail - Personal email to send credentials
 * @param {string} options.firstName - First name of recipient
 * @param {string} options.lastName - Last name of recipient
 * @param {string} options.universityEmail - Generated university email
 * @param {string} options.password - Generated password
 * @param {string} options.userType - Type of user (Student/Faculty)
 * @returns {Promise<object>} - Email send response
 */
export const sendCredentialsEmail = async (options) => {
  const {
    recipientEmail,
    firstName,
    lastName,
    universityEmail,
    password,
    userType = 'Student'
  } = options;

  if (!recipientEmail || !firstName || !universityEmail || !password) {
    throw new Error('Missing required email parameters');
  }

  try {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: recipientEmail,
      subject: `Buddhi Archives - ${userType} Account Credentials`,
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 8px; }
              .header { background-color: #4CAF50; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
              .header h1 { margin: 0; font-size: 24px; }
              .content { padding: 20px; background-color: #f9f9f9; }
              .credentials-box { background-color: white; border: 2px solid #4CAF50; padding: 15px; margin: 15px 0; border-radius: 5px; }
              .credential-label { font-weight: bold; color: #555; margin-top: 10px; }
              .credential-value { 
                background-color: #f0f0f0; 
                padding: 10px; 
                border-radius: 4px; 
                font-family: monospace; 
                word-break: break-all;
                margin-top: 5px;
              }
              .warning { 
                background-color: #fff3cd; 
                border: 1px solid #ffc107; 
                padding: 10px; 
                border-radius: 4px; 
                margin: 15px 0;
                color: #856404;
              }
              .footer { text-align: center; font-size: 12px; color: #777; padding: 20px; border-top: 1px solid #ddd; }
              .action-required { color: #d32f2f; font-weight: bold; }
              ul { line-height: 1.8; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>🎓 Buddhi Archives</h1>
                <p style="margin: 5px 0;">Account Credentials for ${userType}</p>
              </div>
              
              <div class="content">
                <p>Dear <strong>${firstName} ${lastName}</strong>,</p>
                
                <p>Welcome to Buddhi Archives! Your account has been successfully created. Please find your credentials below:</p>
                
                <div class="credentials-box">
                  <div class="credential-label">📧 University Email:</div>
                  <div class="credential-value">${universityEmail}</div>
                  
                  <div class="credential-label">🔑 Temporary Password:</div>
                  <div class="credential-value">${password}</div>
                </div>
                
                <div class="warning">
                  <strong>⚠️ Important Instructions:</strong>
                  <ul>
                    <li><span class="action-required">Save these credentials securely.</span> You will need them to log in.</li>
                    <li><span class="action-required">Change your password on first login.</span> This ensures maximum security.</li>
                    <li>Use your <strong>University Email</strong> (${universityEmail}) for all official communications and login.</li>
                    <li>Do not share your password with anyone.</li>
                    <li>If you did not create this account, please contact the administration immediately.</li>
                  </ul>
                </div>
                
                <h3>Next Steps:</h3>
                <ol>
                  <li>Visit the Buddhi Archives login portal</li>
                  <li>Enter your University Email: <strong>${universityEmail}</strong></li>
                  <li>Enter the temporary password provided above</li>
                  <li>Change your password to a secure one you'll remember</li>
                </ol>
                
                <p><strong>Need Help?</strong></p>
                <p>If you encounter any issues logging in or need technical support, please contact the IT department or administration office.</p>
                
                <p style="margin-top: 30px;">Best regards,<br/>
                <strong>Buddhi Archives Administration Team</strong></p>
              </div>
              
              <div class="footer">
                <p>&copy; 2024 Buddhi Archives. All rights reserved.</p>
                <p>This is an automated email. Please do not reply to this message.</p>
              </div>
            </div>
          </body>
        </html>
      `,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(`✓ Credentials email sent to ${recipientEmail}. Message ID: ${info.messageId}`);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error(`✗ Error sending credentials email to ${recipientEmail}:`, error.message);
    throw new Error(`Failed to send credentials email: ${error.message}`);
  }
};

/**
 * Send bulk credentials emails for multiple users
 * 
 * @param {array} users - Array of user credential objects
 * @returns {Promise<object>} - Results with success and failed counts
 */
export const sendBulkCredentialsEmails = async (users) => {
  if (!Array.isArray(users) || users.length === 0) {
    throw new Error('Users array is required');
  }

  const results = {
    success: [],
    failed: []
  };

  for (const user of users) {
    try {
      await sendCredentialsEmail(user);
      results.success.push({
        email: user.recipientEmail,
        name: `${user.firstName} ${user.lastName}`
      });
    } catch (error) {
      results.failed.push({
        email: user.recipientEmail,
        name: `${user.firstName} ${user.lastName}`,
        error: error.message
      });
    }
  }

  return results;
};
