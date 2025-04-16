import QRCode from 'qrcode';
import crypto from 'crypto-js';

// Generate backup codes
export const generateBackupCodes = (count = 10) => {
  const codes = [];
  for (let i = 0; i < count; i++) {
    // Generate a random 10-character alphanumeric code
    const randomBytes = Array.from({ length: 10 }, () => 
      Math.floor(Math.random() * 36).toString(36)
    ).join('').toUpperCase();
    
    // Format as XXXX-XXXX-XXXX
    codes.push(`${randomBytes.slice(0, 4)}-${randomBytes.slice(4, 8)}-${randomBytes.slice(8, 12)}`);
  }
  return codes;
};

// Hash backup codes for storage
export const hashBackupCodes = (codes) => {
  return codes.map(code => {
    return crypto.SHA256(code).toString();
  });
};

// Generate QR code for authenticator app
export const generateQRCode = async (secret, email) => {
  try {
    const otpauthUrl = `otpauth://totp/DrFinTrack:${email}?secret=${secret}&issuer=DrFinTrack`;
    const qrCodeUrl = await QRCode.toDataURL(otpauthUrl);
    return qrCodeUrl;
  } catch (error) {
    console.error('Error generating QR code:', error);
    return null;
  }
};

// Format backup codes for display
export const formatBackupCodes = (codes) => {
  return codes.map((code, index) => ({
    id: index + 1,
    code,
    used: false
  }));
};
