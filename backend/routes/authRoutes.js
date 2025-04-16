const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const twoFactorController = require('../controllers/twoFactorController');
const { protect, requireEmailVerification } = require('../middleware/auth');

// Auth routes
router.post('/register', authController.register);
router.post('/login', authController.login);
router.get('/verify-email/:token', authController.verifyEmail);
router.post('/resend-verification', protect, authController.resendVerification);
router.post('/forgot-password', authController.forgotPassword);
router.post('/reset-password/:token', authController.resetPassword);
router.get('/me', protect, authController.getMe);

// 2FA routes
router.post('/2fa/setup', protect, requireEmailVerification, twoFactorController.setup2FA);
router.post('/2fa/verify', protect, requireEmailVerification, twoFactorController.verify2FA);
router.post('/2fa/disable', protect, requireEmailVerification, twoFactorController.disable2FA);
router.post('/2fa/backup-codes', protect, requireEmailVerification, twoFactorController.generateBackupCodes);

module.exports = router;
