import mongoose from 'mongoose';
import { config } from './config';

export async function connectDatabase(): Promise<typeof mongoose> {
  try {
    const conn = await mongoose.connect(config.mongodbUri, {
      serverSelectionTimeoutMS: 5000,
      autoIndex: true,
    });
    console.log(`[Database] MongoDB connected successfully to ${config.mongodbUri}`);
    return conn;
  } catch (err) {
    console.error(`[Database] MongoDB connection failed:`, err);
    throw err;
  }
}

export function isDbConnected(): boolean {
  return mongoose.connection.readyState === 1;
}
