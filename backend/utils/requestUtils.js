// Get client IP address
exports.getClientIp = (req) => {
  return req.headers['x-forwarded-for'] || 
         req.connection.remoteAddress || 
         req.socket.remoteAddress || 
         req.connection.socket.remoteAddress;
};

// Get user agent information
exports.getUserAgent = (req) => {
  const userAgent = req.headers['user-agent'] || '';
  
  // Extract device and browser information
  let device = 'Unknown';
  
  if (/mobile/i.test(userAgent)) {
    device = 'Mobile';
  } else if (/tablet/i.test(userAgent)) {
    device = 'Tablet';
  } else if (/windows|macintosh|linux/i.test(userAgent)) {
    device = 'Desktop';
  }
  
  // Extract browser information
  let browser = 'Unknown';
  
  if (/chrome/i.test(userAgent) && !/chromium|edg/i.test(userAgent)) {
    browser = 'Chrome';
  } else if (/firefox/i.test(userAgent)) {
    browser = 'Firefox';
  } else if (/safari/i.test(userAgent) && !/chrome|chromium/i.test(userAgent)) {
    browser = 'Safari';
  } else if (/edg/i.test(userAgent)) {
    browser = 'Edge';
  } else if (/opera|opr/i.test(userAgent)) {
    browser = 'Opera';
  } else if (/msie|trident/i.test(userAgent)) {
    browser = 'Internet Explorer';
  }
  
  return `${device} - ${browser}`;
};
