const crypto = require('crypto');
const speakeasy = require('speakeasy');
const QRCode = require('qrcode');

// Generate a new secret key for TOTP
const generateSecret = (userEmail) => {
  return speakeasy.generateSecret({
    name: `DrFinTrack:${userEmail}`,
    issuer: 'DrFinTrack'
  });
};

// Generate QR code for authenticator app
const generateQRCode = async (secret) => {
  try {
    const qrCodeUrl = await QRCode.toDataURL(secret.otpauth_url);
    return qrCodeUrl;
  } catch (error) {
    console.error('Error generating QR code:', error);
    return null;
  }
};

// Verify TOTP token
const verifyToken = (secret, token) => {
  return speakeasy.totp.verify({
    secret: secret.base32,
    encoding: 'base32',
    token: token,
    window: 1 // Allow 1 step before and after current time (30 seconds each)
  });
};

// Generate backup codes
const generateBackupCodes = (count = 10) => {
  const codes = [];
  for (let i = 0; i < count; i++) {
    // Generate a random 10-character alphanumeric code
    const code = crypto.randomBytes(5).toString('hex').toUpperCase();
    // Format as XXXX-XXXX-XXXX
    codes.push(`${code.slice(0, 4)}-${code.slice(4, 8)}-${code.slice(8)}`);
  }
  return codes;
};

// Hash backup codes for storage
const hashBackupCodes = (codes) => {
  return codes.map(code => {
    const hash = crypto.createHash('sha256');
    hash.update(code);
    return hash.digest('hex');
  });
};

// Verify backup code
const verifyBackupCode = (providedCode, hashedCodes) => {
  const hash = crypto.createHash('sha256');
  hash.update(providedCode);
  const hashedProvidedCode = hash.digest('hex');
  
  return hashedCodes.includes(hashedProvidedCode);
};

// Remove used backup code
const removeUsedBackupCode = (providedCode, hashedCodes) => {
  const hash = crypto.createHash('sha256');
  hash.update(providedCode);
  const hashedProvidedCode = hash.digest('hex');
  
  return hashedCodes.filter(code => code !== hashedProvidedCode);
};

module.exports = {
  generateSecret,
  generateQRCode,
  verifyToken,
  generateBackupCodes,
  hashBackupCodes,
  verifyBackupCode,
  removeUsedBackupCode
};
