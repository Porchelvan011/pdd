import mongoose from 'mongoose';

global.isMockDatabase = false;

export const connectDB = async () => {
  const mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/mentorix';
  try {
    mongoose.set('strictQuery', false);
    await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 3000 // Quick timeout to fall back fast
    });
    console.log('✨ [Database] MongoDB connected successfully to ' + mongoUri);
  } catch (error) {
    console.warn('⚠️ [Database] Connection failed to MongoDB:', error.message);
    console.warn('🚀 [Database] Switching to high-fidelity In-Memory Database Fallback mode.');
    global.isMockDatabase = true;
  }
};
