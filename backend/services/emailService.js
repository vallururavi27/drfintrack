const nodemailer = require('nodemailer');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');

// Configuration for email service
const config = {
  host: process.env.EMAIL_HOST || 'smtp.gmail.com',
  port: process.env.EMAIL_PORT || 587,
  secure: process.env.EMAIL_SECURE === 'true',
  auth: {
    user: process.env.EMAIL_USER || 'your-email@gmail.com',
    pass: process.env.EMAIL_PASSWORD || 'your-app-password'
  },
  from: process.env.EMAIL_FROM || 'DrFinTrack <noreply@drfintrack.com>'
};

// Create a transporter
const transporter = nodemailer.createTransport(config);

// Verify connection configuration
const verifyConnection = async () => {
  try {
    await transporter.verify();
    console.log('Email service is ready to send messages');
    return true;
  } catch (error) {
    console.error('Error verifying email connection:', error);
    return false;
  }
};

// Generate verification token
const generateVerificationToken = (userId, email) => {
  return jwt.sign(
    { userId, email, purpose: 'email-verification' },
    process.env.JWT_SECRET || 'your-jwt-secret',
    { expiresIn: '24h' }
  );
};

// Generate password reset token
const generatePasswordResetToken = (userId, email) => {
  return jwt.sign(
    { userId, email, purpose: 'password-reset' },
    process.env.JWT_SECRET || 'your-jwt-secret',
    { expiresIn: '1h' }
  );
};

// Verify token
const verifyToken = (token, purpose) => {
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-jwt-secret');
    if (decoded.purpose !== purpose) {
      return null;
    }
    return decoded;
  } catch (error) {
    console.error('Error verifying token:', error);
    return null;
  }
};

// Send verification email
const sendVerificationEmail = async (user) => {
  const token = generateVerificationToken(user.id, user.email);
  const verificationUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/verify-email?token=${token}`;

  const mailOptions = {
    from: config.from,
    to: user.email,
    subject: 'Verify Your Email Address - DrFinTrack',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #4f46e5;">Welcome to DrFinTrack!</h2>
        <p>Thank you for registering. Please verify your email address by clicking the button below:</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${verificationUrl}" style="background-color: #4f46e5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-weight: bold;">Verify Email Address</a>
        </div>
        <p>If the button doesn't work, you can also copy and paste the following link into your browser:</p>
        <p style="word-break: break-all; color: #4f46e5;">${verificationUrl}</p>
        <p>This link will expire in 24 hours.</p>
        <p>If you didn't create an account with DrFinTrack, please ignore this email.</p>
        <hr style="border: 1px solid #eee; margin: 20px 0;">
        <p style="color: #666; font-size: 12px;">DrFinTrack - Your Personal Finance Manager</p>
      </div>
    `
  };

  try {
    await transporter.sendMail(mailOptions);
    return true;
  } catch (error) {
    console.error('Error sending verification email:', error);
    return false;
  }
};

// Send password reset email
const sendPasswordResetEmail = async (user) => {
  const token = generatePasswordResetToken(user.id, user.email);
  const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/reset-password?token=${token}`;

  const mailOptions = {
    from: config.from,
    to: user.email,
    subject: 'Reset Your Password - DrFinTrack',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #4f46e5;">Reset Your Password</h2>
        <p>We received a request to reset your password. Click the button below to create a new password:</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${resetUrl}" style="background-color: #4f46e5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-weight: bold;">Reset Password</a>
        </div>
        <p>If the button doesn't work, you can also copy and paste the following link into your browser:</p>
        <p style="word-break: break-all; color: #4f46e5;">${resetUrl}</p>
        <p>This link will expire in 1 hour.</p>
        <p>If you didn't request a password reset, please ignore this email or contact support if you have concerns.</p>
        <hr style="border: 1px solid #eee; margin: 20px 0;">
        <p style="color: #666; font-size: 12px;">DrFinTrack - Your Personal Finance Manager</p>
      </div>
    `
  };

  try {
    await transporter.sendMail(mailOptions);
    return true;
  } catch (error) {
    console.error('Error sending password reset email:', error);
    return false;
  }
};

// Send 2FA setup email
const send2FASetupEmail = async (user, backupCodes) => {
  const mailOptions = {
    from: config.from,
    to: user.email,
    subject: 'Two-Factor Authentication Setup - DrFinTrack',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #4f46e5;">Two-Factor Authentication Setup</h2>
        <p>You have successfully set up two-factor authentication for your DrFinTrack account.</p>
        <p>Please keep your backup codes in a safe place. You will need them if you lose access to your authenticator app:</p>
        <div style="background-color: #f3f4f6; padding: 15px; border-radius: 4px; font-family: monospace; margin: 20px 0;">
          ${backupCodes.map(code => `<div>${code}</div>`).join('')}
        </div>
        <p><strong>Important:</strong> These codes can only be used once. Keep them secure and do not share them with anyone.</p>
        <hr style="border: 1px solid #eee; margin: 20px 0;">
        <p style="color: #666; font-size: 12px;">DrFinTrack - Your Personal Finance Manager</p>
      </div>
    `
  };

  try {
    await transporter.sendMail(mailOptions);
    return true;
  } catch (error) {
    console.error('Error sending 2FA setup email:', error);
    return false;
  }
};

// Send login notification email
const sendLoginNotificationEmail = async (user, loginDetails) => {
  const mailOptions = {
    from: config.from,
    to: user.email,
    subject: 'New Login Detected - DrFinTrack',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #4f46e5;">New Login Detected</h2>
        <p>We detected a new login to your DrFinTrack account.</p>
        <div style="background-color: #f3f4f6; padding: 15px; border-radius: 4px; margin: 20px 0;">
          <p><strong>Date & Time:</strong> ${loginDetails.timestamp}</p>
          <p><strong>IP Address:</strong> ${loginDetails.ipAddress}</p>
          <p><strong>Device:</strong> ${loginDetails.device}</p>
          <p><strong>Location:</strong> ${loginDetails.location || 'Unknown'}</p>
        </div>
        <p>If this was you, you can ignore this email.</p>
        <p>If you didn't log in recently, please <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/reset-password" style="color: #4f46e5; font-weight: bold;">reset your password</a> immediately and contact our support team.</p>
        <hr style="border: 1px solid #eee; margin: 20px 0;">
        <p style="color: #666; font-size: 12px;">DrFinTrack - Your Personal Finance Manager</p>
      </div>
    `
  };

  try {
    await transporter.sendMail(mailOptions);
    return true;
  } catch (error) {
    console.error('Error sending login notification email:', error);
    return false;
  }
};

module.exports = {
  verifyConnection,
  generateVerificationToken,
  generatePasswordResetToken,
  verifyToken,
  sendVerificationEmail,
  sendPasswordResetEmail,
  send2FASetupEmail,
  sendLoginNotificationEmail
};
