import mongoose from 'mongoose';
import { config } from './config.js'

const connectDB = async () => {
  const mongoURI = config.MONGO_URI;

  if (!mongoURI) {
    console.warn('MONGODB_URI is not defined. Skipping database connection.');
    return;
  }

  try {
    await mongoose.connect(mongoURI);
    console.log('MongoDB connected successfully');
  } catch (error) {
    console.error('MongoDB connection failed:', error.message);
    process.exit(1);
  }
};

export default connectDB;
