// Script to enable leaked password protection in Supabase
const fetch = require('node-fetch');

// Your Supabase project details
const SUPABASE_PROJECT_ID = 'bqurvqysmwsropdaqwot';
const SUPABASE_SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJxdXJ2cXlzbXdzcm9wZGFxd290Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0NDc4MzU2NCwiZXhwIjoyMDYwMzU5NTY0fQ.ojFM53vyvbtQC80yQHAm77X3dxlzcBZhUsFtFLYQAu4';

async function enableLeakedPasswordProtection() {
  try {
    const response = await fetch(`https://api.supabase.com/v1/projects/${SUPABASE_PROJECT_ID}/config/auth`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`
      },
      body: JSON.stringify({
        security: {
          enable_leaked_password_protection: true
        }
      })
    });
    
    if (response.ok) {
      console.log('Successfully enabled leaked password protection!');
    } else {
      const errorData = await response.json();
      console.error('Failed to enable leaked password protection:', errorData);
    }
  } catch (error) {
    console.error('Error:', error);
  }
}

enableLeakedPasswordProtection();
