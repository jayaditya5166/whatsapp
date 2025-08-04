const { exec } = require('child_process');
const path = require('path');
const fs = require('fs');

const CHROME_PATH = process.env.CHROME_PATH || 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const tenantId = process.argv[2];

if (!tenantId) {
  console.error('❌ Usage: node launchTenantWhatsApp.js <tenantId>');
  console.error('Example: node launchTenantWhatsApp.js tenant_1753696578138');
  process.exit(1);
}

const sessionDir = path.resolve(__dirname, `.wwebjs_auth/session-${tenantId}`);
const url = 'https://web.whatsapp.com';

console.log('🚀 LAUNCHING WHATSAPP FOR TENANT');
console.log('=' .repeat(50));
console.log(`👤 Tenant ID: ${tenantId}`);
console.log(`📂 Session folder: ${sessionDir}`);
console.log(`🌐 URL: ${url}`);
console.log(`🔧 Chrome path: ${CHROME_PATH}`);

// Check if session folder exists
if (!fs.existsSync(sessionDir)) {
  console.log('❌ Session folder does not exist!');
  console.log('💡 This tenant needs to scan QR first.');
  console.log('💡 Start the backend server and scan QR for this tenant.');
  process.exit(1);
}

console.log('✅ Session folder exists');

// Check session folder contents
try {
  const contents = fs.readdirSync(sessionDir);
  console.log(`📋 Session folder contains ${contents.length} items`);
  
  // Check for critical subdirectories
  const defaultDir = path.join(sessionDir, 'Default');
  if (fs.existsSync(defaultDir)) {
    const defaultContents = fs.readdirSync(defaultDir);
    console.log(`📁 Default folder contains ${defaultContents.length} items`);
    
    // Check for critical files
    const criticalFiles = ['Cookies', 'Local Storage', 'Session Storage'];
    let missingFiles = 0;
    criticalFiles.forEach(file => {
      const filePath = path.join(defaultDir, file);
      if (fs.existsSync(filePath)) {
        const stats = fs.statSync(filePath);
        console.log(`  ✅ ${file} exists (${stats.size} bytes)`);
      } else {
        console.log(`  ❌ ${file} missing`);
        missingFiles++;
      }
    });
    
    if (missingFiles > 0) {
      console.log('⚠️  Some critical files are missing. Session may not work properly.');
    } else {
      console.log('✅ All critical files present');
    }
  } else {
    console.log('❌ Default folder missing!');
  }
} catch (err) {
  console.log(`❌ Error reading session folder: ${err.message}`);
}

// Check if Chrome exists
if (!fs.existsSync(CHROME_PATH)) {
  console.log('❌ Chrome not found at specified path!');
  console.log('💡 Try setting CHROME_PATH environment variable');
  console.log('💡 Or use: chromium, google-chrome, or chrome');
  process.exit(1);
}

console.log('✅ Chrome found');

// Launch Chrome with session
const cmd = `"${CHROME_PATH}" --user-data-dir="${sessionDir}" --no-first-run --no-default-browser-check --disable-extensions --app="${url}"`;

console.log('\n🚀 Launching Chrome...');
console.log(`Command: ${cmd}`);

exec(cmd, (error, stdout, stderr) => {
  if (error) {
    console.error('❌ Error launching Chrome:', error.message);
    console.error('💡 Make sure Chrome is installed and accessible');
    return;
  }
  
  if (stderr) {
    console.log('⚠️  Chrome warnings:', stderr);
  }
  
  console.log('✅ Chrome launched successfully!');
  console.log('💡 WhatsApp Web should open automatically');
  console.log('💡 If you see QR code, scan it with your phone');
  console.log('💡 After scanning, the session will be saved for future auto-login');
}); 