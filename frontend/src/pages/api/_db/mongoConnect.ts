import mongoose from 'mongoose';
import { logger } from '@/utils/logger';

const MONGODB_URI = process.env.MONGO_URI;

if (!MONGODB_URI) {
  const error = new Error('MONGO_URI environment variable is required');
  logger.error('Database connection failed: Missing MONGO_URI', 'MONGO_CONNECT', { error: 'Missing MONGO_URI' }, error);
  throw error;
}

// At this point, MONGODB_URI is guaranteed to be defined
const DB_URI = MONGODB_URI;

type MongooseCache = {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
};

declare global {
  var mongoose: MongooseCache | undefined;
}

const cached: MongooseCache = global.mongoose || { conn: null, promise: null };

if (!global.mongoose) {
  global.mongoose = cached;
}

async function dbConnect() {
  if (cached.conn) {
    logger.debug('Using cached database connection', 'MONGO_CONNECT');
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    };

    logger.info('Creating new database connection', 'MONGO_CONNECT', { uri: DB_URI.replace(/\/\/[^:]+:[^@]+@/, '//***:***@') });
    
    cached.promise = mongoose.connect(DB_URI, opts).then((mongoose) => {
      logger.info('Database connected successfully', 'MONGO_CONNECT');
      return mongoose;
    }).catch((error) => {
      logger.error('Database connection failed', 'MONGO_CONNECT', { error: 'Connection failed' }, error instanceof Error ? error : new Error(String(error)));
      throw error;
    });
  }

  try {
    cached.conn = await cached.promise;
    return cached.conn;
  } catch (error) {
    cached.promise = null;
    logger.error('Database connection error', 'MONGO_CONNECT', { error: 'Connection error' }, error instanceof Error ? error : new Error(String(error)));
    throw error;
  }
}

export default dbConnect; 