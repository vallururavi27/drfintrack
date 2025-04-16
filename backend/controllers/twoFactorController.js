const User = require('../models/User');
const twoFactorService = require('../services/twoFactorService');
const emailService = require('../services/emailService');

// @desc    Setup 2FA
// @route   POST /api/auth/2fa/setup
// @access  Private
exports.setup2FA = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    
    // Check if 2FA is already enabled
    if (user.twoFactorEnabled) {
      return res.status(400).json({ success: false, message: '2FA is already enabled' });
    }
    
    // Generate secret
    const secret = twoFactorService.generateSecret(user.email);
    
    // Generate QR code
    const qrCode = await twoFactorService.generateQRCode(secret);
    if (!qrCode) {
      return res.status(500).json({ success: false, message: 'Failed to generate QR code' });
    }
    
    // Store secret temporarily (not enabled yet until verified)
    user.twoFactorSecret = secret;
    await user.save();
    
    res.status(200).json({
      success: true,
      secret: secret.base32,
      qrCode
    });
  } catch (error) {
    console.error('Setup 2FA error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Verify and enable 2FA
// @route   POST /api/auth/2fa/verify
// @access  Private
exports.verify2FA = async (req, res) => {
  try {
    const { token } = req.body;
    
    const user = await User.findById(req.user.id).select('+twoFactorSecret');
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    
    // Check if 2FA is already enabled
    if (user.twoFactorEnabled) {
      return res.status(400).json({ success: false, message: '2FA is already enabled' });
    }
    
    // Verify token
    const isValid = twoFactorService.verifyToken(user.twoFactorSecret, token);
    if (!isValid) {
      return res.status(400).json({ success: false, message: 'Invalid verification code' });
    }
    
    // Generate backup codes
    const backupCodes = twoFactorService.generateBackupCodes();
    const hashedBackupCodes = twoFactorService.hashBackupCodes(backupCodes);
    
    // Enable 2FA
    user.twoFactorEnabled = true;
    user.backupCodes = hashedBackupCodes;
    await user.save();
    
    // Send email with backup codes
    emailService.send2FASetupEmail(user, backupCodes).catch(err => {
      console.error('Failed to send 2FA setup email:', err);
    });
    
    res.status(200).json({
      success: true,
      message: '2FA enabled successfully',
      backupCodes
    });
  } catch (error) {
    console.error('Verify 2FA error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Disable 2FA
// @route   POST /api/auth/2fa/disable
// @access  Private
exports.disable2FA = async (req, res) => {
  try {
    const { token, password } = req.body;
    
    const user = await User.findById(req.user.id).select('+password +twoFactorSecret +backupCodes');
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    
    // Check if 2FA is enabled
    if (!user.twoFactorEnabled) {
      return res.status(400).json({ success: false, message: '2FA is not enabled' });
    }
    
    // Verify password
    const isPasswordValid = await user.matchPassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({ success: false, message: 'Invalid password' });
    }
    
    // Verify token
    let isValidToken = false;
    
    // Check if it's a TOTP token
    if (token.length === 6 && /^\d+$/.test(token)) {
      isValidToken = twoFactorService.verifyToken(user.twoFactorSecret, token);
    } 
    // Check if it's a backup code
    else if (token.length === 14 && /^[A-Z0-9]{4}-[A-Z0-9]{4}-[A-Z0-9]{4}$/.test(token)) {
      isValidToken = twoFactorService.verifyBackupCode(token, user.backupCodes);
    }
    
    if (!isValidToken) {
      return res.status(401).json({ success: false, message: 'Invalid authentication code' });
    }
    
    // Disable 2FA
    user.twoFactorEnabled = false;
    user.twoFactorSecret = undefined;
    user.backupCodes = undefined;
    await user.save();
    
    res.status(200).json({
      success: true,
      message: '2FA disabled successfully'
    });
  } catch (error) {
    console.error('Disable 2FA error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Generate new backup codes
// @route   POST /api/auth/2fa/backup-codes
// @access  Private
exports.generateBackupCodes = async (req, res) => {
  try {
    const { token } = req.body;
    
    const user = await User.findById(req.user.id).select('+twoFactorSecret +backupCodes');
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    
    // Check if 2FA is enabled
    if (!user.twoFactorEnabled) {
      return res.status(400).json({ success: false, message: '2FA is not enabled' });
    }
    
    // Verify token
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
      }
    }
    
    if (!isValidToken) {
      return res.status(401).json({ success: false, message: 'Invalid authentication code' });
    }
    
    // Generate new backup codes
    const backupCodes = twoFactorService.generateBackupCodes();
    const hashedBackupCodes = twoFactorService.hashBackupCodes(backupCodes);
    
    // Update backup codes
    user.backupCodes = hashedBackupCodes;
    await user.save();
    
    // Send email with new backup codes
    emailService.send2FASetupEmail(user, backupCodes).catch(err => {
      console.error('Failed to send backup codes email:', err);
    });
    
    res.status(200).json({
      success: true,
      message: 'New backup codes generated',
      backupCodes
    });
  } catch (error) {
    console.error('Generate backup codes error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};
