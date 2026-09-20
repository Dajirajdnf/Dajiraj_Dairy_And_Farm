const mongoose = require('mongoose');
const config = require('./env');

// Cache connection for serverless environments (Vercel)
let cached = global._mongooseConnection;
if (!cached) {
  cached = global._mongooseConnection = { conn: null, promise: null };
}

const connectDB = async () => {
  // Return cached connection if available
  if (cached.conn && mongoose.connection.readyState === 1) {
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    };

    cached.promise = mongoose.connect(config.mongodbUri, opts).then((mongooseInstance) => {
      console.log(`✅ MongoDB Connected: ${mongooseInstance.connection.host}`);
      return mongooseInstance;
    });
  }

  try {
    cached.conn = await cached.promise;
  } catch (error) {
    cached.promise = null;
    // Log without exposing credentials
    const safeMessage = error.message.replace(/mongodb(\+srv)?:\/\/[^@]+@/, 'mongodb$1://***:***@');
    console.error(`❌ MongoDB Connection Error: ${safeMessage}`);
    throw error;
  }

  return cached.conn;
};

mongoose.connection.on('disconnected', () => {
  console.log('⚠️  MongoDB Disconnected');
  cached.conn = null;
  cached.promise = null;
});

mongoose.connection.on('error', (err) => {
  const safeMessage = err.message.replace(/mongodb(\+srv)?:\/\/[^@]+@/, 'mongodb$1://***:***@');
  console.error(`❌ MongoDB Error: ${safeMessage}`);
});

module.exports = connectDB;
