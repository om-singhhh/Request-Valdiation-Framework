import mongoose from 'mongoose';

/**
 * Connects to MongoDB once per process.
 * Uses buffered commands until connected.
 */
export async function connectDb(uri) {
  mongoose.set('strictQuery', true);
  await mongoose.connect(uri);
  return mongoose.connection;
}
