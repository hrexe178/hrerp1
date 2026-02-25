const mongoose = require('mongoose');

const connectWithUri = async (uri, label) => {
  if (!uri) return null;
  const conn = await mongoose.connect(uri);
  console.log(`✅ MongoDB Connected (${label}): ${conn.connection.host}`);
  return conn;
};

const connectDB = async () => {
  const primaryUri = process.env.MONGODB_URI;
  const fallbackUri = process.env.MONGODB_URI_FALLBACK || 'mongodb://127.0.0.1:27017/hr-erp';

  try {
    return await connectWithUri(primaryUri, 'primary');
  } catch (primaryError) {
    console.error(`❌ MongoDB primary connection failed: ${primaryError.message}`);

    try {
      return await connectWithUri(fallbackUri, 'fallback');
    } catch (fallbackError) {
      console.error(`❌ MongoDB fallback connection failed: ${fallbackError.message}`);

      if (process.env.NODE_ENV === 'production') {
        process.exit(1);
      }

      console.warn('⚠️ Continuing in development mode without DB connection. Start MongoDB or fix MONGODB_URI.');
      return null;
    }
  }
};

module.exports = connectDB;
