const dotenv = require('dotenv');
const path = require('path');

// Load .env from project root directory
dotenv.config({ path: path.join(__dirname, '..', '..', '.env') });
// Also try server-level .env as fallback for local dev
dotenv.config({ path: path.join(__dirname, '..', '.env') });

// Validate required environment variables
const requiredVars = ['MONGODB_URI', 'JWT_SECRET'];
const missing = requiredVars.filter((key) => !process.env[key]);
if (missing.length > 0) {
  console.warn(`⚠️ Warning: Missing environment variables on server: ${missing.join(', ')}`);
}

// Build MongoDB URI with username/password interpolation if provided
let mongodbUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/dajiraj_dairy';
if (process.env.MONGODB_USERNAME && process.env.MONGODB_PASSWORD) {
  mongodbUri = mongodbUri
    .replace('<username>', process.env.MONGODB_USERNAME)
    .replace('<password>', process.env.MONGODB_PASSWORD);
}

module.exports = {
  port: process.env.PORT || 5000,
  nodeEnv: process.env.NODE_ENV || 'development',
  mongodbUri,
  jwtSecret: process.env.JWT_SECRET || 'dev_only_fallback_change_in_production',
  jwtExpire: process.env.JWT_EXPIRE || '7d',
  smtp: {
    host: process.env.SMTP_HOST || '',
    port: parseInt(process.env.SMTP_PORT) || 587,
    user: process.env.SMTP_USER || '',
    pass: process.env.SMTP_PASS || '',
    fromName: process.env.SMTP_FROM_NAME || 'Dajiraj Dairy & Farm',
    fromEmail: process.env.SMTP_FROM_EMAIL || '',
    secure: process.env.SMTP_SECURE === 'true',
  },
  clientUrl: process.env.CLIENT_URL || 'http://localhost:5173',
  serverUrl: process.env.SERVER_URL || 'http://localhost:5000',
  cronSecret: process.env.CRON_SECRET || '',
};
