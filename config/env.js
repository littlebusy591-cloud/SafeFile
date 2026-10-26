// Reads settings from the .env file and checks that the important ones exist.
// Every other file imports settings from here instead of using process.env directly.
require('dotenv').config();

function required(name) {
  const value = process.env[name];
  if (!value || !value.trim()) {
    console.error(`\n❌ Missing environment variable: ${name}`);
    console.error('   Copy .env.example to .env and fill in the values (see README.md).\n');
    process.exit(1);
  }
  return value.trim();
}

const nodeEnv = process.env.NODE_ENV || 'development';
const sessionSecret = required('SESSION_SECRET');

if (sessionSecret.length < 16 || sessionSecret.startsWith('replace-this')) {
  console.error('\n❌ SESSION_SECRET is too weak or still the example value.');
  console.error('   Generate one with:');
  console.error("   node -e \"console.log(require('crypto').randomBytes(48).toString('hex'))\"\n");
  process.exit(1);
}

module.exports = {
  nodeEnv,
  port: parseInt(process.env.PORT, 10) || 3000,
  mongoUri: required('MONGODB_URI'),
  sessionSecret,
  storageDriver: (process.env.STORAGE_DRIVER || 'local').trim(),
  maxFileSizeMB: Number(process.env.MAX_FILE_SIZE_MB) || 10,
  // Secure cookies only work over HTTPS, so they are off for local http://localhost
  cookieSecure: process.env.COOKIE_SECURE
    ? process.env.COOKIE_SECURE === 'true'
    : nodeEnv === 'production',
  trustProxy: process.env.TRUST_PROXY === 'true',
};
