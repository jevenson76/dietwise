import { Pool } from 'pg';
import mongoose from 'mongoose';
import { createClient } from 'redis';
import { logger } from '../utils/logger';

// PostgreSQL connection
export const pgPool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

// Redis client
export const redisClient = createClient({
  url: process.env.REDIS_URL,
});

// Error handling for Redis
redisClient.on('error', (err) => {
  logger.error('Redis Client Error:', err);
});

// Connect to all databases
export async function connectDatabases() {
  try {
    // PostgreSQL
    await pgPool.query('SELECT NOW()');
    logger.info('✅ PostgreSQL connected');

    // MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/dietwise');
    logger.info('✅ MongoDB connected');

    // Redis
    await redisClient.connect();
    logger.info('✅ Redis connected');
  } catch (error) {
    logger.error('Database connection error:', error);
    throw error;
  }
}

// Graceful shutdown
export async function closeDatabases() {
  try {
    await pgPool.end();
    await mongoose.connection.close();
    await redisClient.quit();
    logger.info('All database connections closed');
  } catch (error) {
    logger.error('Error closing database connections:', error);
  }
}