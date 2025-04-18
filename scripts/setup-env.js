const fs = require('fs');
const path = require('path');

// Paths
const sourceEnvPath = path.join(__dirname, '..', 'frontend', '.env.local');
const targetEnvPath = path.join(__dirname, '..', '.env');

console.log('Setting up environment variables for migration...');
console.log(`Source: ${sourceEnvPath}`);
console.log(`Target: ${targetEnvPath}`);

// Check if source file exists
if (!fs.existsSync(sourceEnvPath)) {
  console.error(`Error: Source file ${sourceEnvPath} does not exist!`);
  process.exit(1);
}

// Read source file
let envContent = fs.readFileSync(sourceEnvPath, 'utf8');
console.log('Source file read successfully.');

// Add Supabase variables if they don't exist
if (!envContent.includes('SUPABASE_URL')) {
  envContent += '\nSUPABASE_URL=https://bqurvqysmwsropdaqwot.supabase.co\n';
  console.log('Added SUPABASE_URL variable.');
}

if (!envContent.includes('SUPABASE_KEY')) {
  envContent += '\nSUPABASE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJxdXJ2cXlzbXdzcm9wZGFxd290Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0NDc4MzU2NCwiZXhwIjoyMDYwMzU5NTY0fQ.ojFM53vyvbtQC80yQHAm77X3dxlzcBZhUsFtFLYQAu4\n';
  console.log('Added SUPABASE_KEY variable.');
}

// Write to target file
fs.writeFileSync(targetEnvPath, envContent);
console.log('Environment variables set up successfully!');
console.log(`Created ${targetEnvPath} with the necessary variables.`);
