const config = require('../config/env');

const errorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;

  // Log error for development
  if (config.nodeEnv === 'development') {
    console.error('❌ Error:', err);
  }

  // Mongoose bad ObjectId
  if (err.name === 'CastError') {
    error.message = 'Resource not found';
    return res.status(404).json({ success: false, message: error.message });
  }

  // Mongoose duplicate key
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue).join(', ');
    error.message = `Duplicate value for field: ${field}`;
    return res.status(400).json({ success: false, message: error.message });
  }

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const errorsObj = {};
    const messages = [];
    if (err.errors) {
      for (const [key, val] of Object.entries(err.errors)) {
        errorsObj[key] = val.message;
        messages.push(val.message);
      }
    }
    const message = `Validation failed: ${messages.join('. ')}`;
    return res.status(400).json({ success: false, message, errors: errorsObj });
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({ success: false, message: 'Invalid token' });
  }

  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({ success: false, message: 'Token expired' });
  }

  // Database connection errors
  if (
    err.name === 'MongooseServerSelectionError' ||
    err.message?.includes('ECONNREFUSED') ||
    err.message?.includes('buffering timed out') ||
    err.message?.includes('MONGODB_URI')
  ) {
    return res.status(503).json({
      success: false,
      message: 'Database connection failed. Please ensure MONGODB_URI is configured in Vercel Settings → Environment Variables and that MongoDB Atlas Network Access is set to allow access from anywhere (0.0.0.0/0).',
    });
  }

  // Default error
  const statusCode = error.statusCode || 500;
  const isProd = config.nodeEnv === 'production';
  const safeMessage = isProd && statusCode === 500
    ? 'An unexpected error occurred. Please try again later.'
    : (error.message || 'Internal Server Error').replace(/mongodb(\+srv)?:\/\/[^@]+@/, 'mongodb$1://***:***@');

  res.status(statusCode).json({
    success: false,
    message: safeMessage,
    ...(config.nodeEnv === 'development' && { stack: err.stack }),
  });
};

module.exports = errorHandler;
