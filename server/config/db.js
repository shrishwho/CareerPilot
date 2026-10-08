import mongoose from 'mongoose';

export let isMemoryDb = false;

export const connectDB = async () => {
  const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/careerpilot';
  
  try {
    await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 2000,
    });
    console.log(`[MongoDB] Connected successfully to ${mongoose.connection.host}`);
    isMemoryDb = false;
  } catch (error) {
    console.warn(`[MongoDB] Could not connect to external MongoDB server (${error.message}).`);
    console.log(`[MongoDB] Initializing Embedded High-Performance In-Memory CareerPilot Storage Engine.`);
    isMemoryDb = true;
  }
};
