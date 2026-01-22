import "server-only";
import mongoose from "mongoose";

interface Cached {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
}

declare global {
  var mongoose: Cached | undefined;
}

const cached: Cached = global.mongoose || { conn: null, promise: null };

if (!global.mongoose) {
  global.mongoose = cached;
}

async function dbConnect(): Promise<typeof mongoose> {
  // Check for DATABASE_URL at connection time, not module load time
  const MONGODB_URI = process.env.DATABASE_URL;
  
  if (!MONGODB_URI) {
    throw new Error("Please define the DATABASE_URL environment variable");
  }

  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    cached.promise = mongoose.connect(MONGODB_URI).then((mongoose) => {
      return mongoose;
    });
  }

  cached.conn = await cached.promise;
  return cached.conn;
}

export default dbConnect;
