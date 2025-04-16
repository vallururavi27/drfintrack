const User = require('../models/User');
const jwt = require('jsonwebtoken');
const emailService = require('../services/emailService');
const twoFactorService = require('../services/twoFactorService');
const { getUserAgent, getClientIp } = require('../utils/requestUtils');

// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
exports.register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Check if user already exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ success: false, message: 'User already exists' });
    }

    // Create user
    const user = await User.create({
      name,
      email,
      password
    });

    // Send verification email
    const emailSent = await emailService.sendVerificationEmail(user);
    if (!emailSent) {
      console.warn(`Failed to send verification email to ${email}`);
    }

    // Create token
    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET || 'your-jwt-secret',
      { expiresIn: '30d' }
    );

    res.status(201).json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        isEmailVerified: user.isEmailVerified,
        twoFactorEnabled: user.twoFactorEnabled
      },
      message: 'Registration successful. Please verify your email.'
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
exports.login = async (req, res) => {
  try {
    const { email, password, token } = req.body;

    // Find user
    const user = await User.findOne({ email }).select('+password +twoFactorSecret +backupCodes');
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    // Check password
    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      // Log failed login attempt
      await User.findByIdAndUpdate(user._id, {
        $push: {
          loginHistory: {
            timestamp: new Date(),
            ipAddress: getClientIp(req),
            device: getUserAgent(req),
            successful: false
          }
        }
      });
      
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    // Check if 2FA is enabled
    if (user.twoFactorEnabled) {
      // If token is provided, verify it
      if (token) {
        let isValidToken = false;
        
        // Check if it's a TOTP token
        if (token.length === 6 && /^\d+$/.test(token)) {
          isValidToken = twoFactorService.verifyToken(user.twoFactorSecret, token);
        } 
        // Check if it's a backup code
        else if (token.length === 14 && /^[A-Z0-9]{4}-[A-Z0-9]{4}-[A-Z0-9]{4}$/.test(token)) {
          isValidToken = twoFactorService.verifyBackupCode(token, user.backupCodes);
          
          // If valid backup code, remove it from the list
          if (isValidToken) {
            user.backupCodes = twoFactorService.removeUsedBackupCode(token, user.backupCodes);
            await user.save();
          }
        }
        
        if (!isValidToken) {
          return res.status(401).json({ 
            success: false, 
            message: 'Invalid authentication code',
            requires2FA: true
          });
        }
      } else {
        // No token provided, but 2FA is required
        return res.status(200).json({ 
          success: true, 
          requires2FA: true,
          message: 'Two-factor authentication required'
        });
      }
    }

    // Update last login info
    const loginInfo = {
      timestamp: new Date(),
      ipAddress: getClientIp(req),
      device: getUserAgent(req)
    };
    
    await User.findByIdAndUpdate(user._id, {
      lastLogin: loginInfo,
      $push: {
        loginHistory: {
          ...loginInfo,
          successful: true
        }
      }
    });

    // Send login notification email
    emailService.sendLoginNotificationEmail(user, loginInfo).catch(err => {
      console.error('Failed to send login notification email:', err);
    });

    // Create token
    const jwtToken = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET || 'your-jwt-secret',
      { expiresIn: '30d' }
    );

    res.status(200).json({
      success: true,
      token: jwtToken,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        isEmailVerified: user.isEmailVerified,
        twoFactorEnabled: user.twoFactorEnabled
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Verify email
// @route   GET /api/auth/verify-email/:token
// @access  Public
exports.verifyEmail = async (req, res) => {
  try {
    const { token } = req.params;
    
    // Verify token
    const decoded = emailService.verifyToken(token, 'email-verification');
    if (!decoded) {
      return res.status(400).json({ success: false, message: 'Invalid or expired token' });
    }
    
    // Find user and update email verification status
    const user = await User.findById(decoded.userId);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    
    if (user.isEmailVerified) {
      return res.status(400).json({ success: false, message: 'Email already verified' });
    }
    
    user.isEmailVerified = true;
    await user.save();
    
    res.status(200).json({ success: true, message: 'Email verified successfully' });
  } catch (error) {
    console.error('Email verification error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Resend verification email
// @route   POST /api/auth/resend-verification
// @access  Private
exports.resendVerification = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    
    if (user.isEmailVerified) {
      return res.status(400).json({ success: false, message: 'Email already verified' });
    }
    
    // Send verification email
    const emailSent = await emailService.sendVerificationEmail(user);
    if (!emailSent) {
      return res.status(500).json({ success: false, message: 'Failed to send verification email' });
    }
    
    res.status(200).json({ success: true, message: 'Verification email sent' });
  } catch (error) {
    console.error('Resend verification error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Forgot password
// @route   POST /api/auth/forgot-password
// @access  Public
exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    
    // Send password reset email
    const emailSent = await emailService.sendPasswordResetEmail(user);
    if (!emailSent) {
      return res.status(500).json({ success: false, message: 'Failed to send password reset email' });
    }
    
    res.status(200).json({ success: true, message: 'Password reset email sent' });
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Reset password
// @route   POST /api/auth/reset-password/:token
// @access  Public
exports.resetPassword = async (req, res) => {
  try {
    const { token } = req.params;
    const { password } = req.body;
    
    // Verify token
    const decoded = emailService.verifyToken(token, 'password-reset');
    if (!decoded) {
      return res.status(400).json({ success: false, message: 'Invalid or expired token' });
    }
    
    // Find user and update password
    const user = await User.findById(decoded.userId);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    
    user.password = password;
    await user.save();
    
    res.status(200).json({ success: true, message: 'Password reset successful' });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Get current user
// @route   GET /api/auth/me
// @access  Private
exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    
    res.status(200).json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        isEmailVerified: user.isEmailVerified,
        twoFactorEnabled: user.twoFactorEnabled,
        lastLogin: user.lastLogin
      }
    });
  } catch (error) {
    console.error('Get me error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};
