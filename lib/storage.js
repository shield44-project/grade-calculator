// Shared storage module for API endpoints
// Handles local filesystem, Redis, and in-memory storage

import fs from 'fs';
import path from 'path';
import Redis from 'ioredis';

// Check if we're in a serverless environment
const isServerless = process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME;

// Redis client (lazy initialization)
let redisClient = null;
const REDIS_KEY = 'rvce-calculator:submissions';

// Initialize Redis client if URL is available
function getRedisClient() {
  if (redisClient) return redisClient;
  
  const redisUrl = process.env.REDIS_URL || process.env.redis_REDIS_URL;
  if (redisUrl) {
    try {
      redisClient = new Redis(redisUrl, {
        maxRetriesPerRequest: 3,
        retryStrategy(times) {
          const delay = Math.min(times * 50, 2000);
          return delay;
        }
      });
      
      redisClient.on('error', (err) => {
        console.error('Redis connection error:', err);
      });
      
      return redisClient;
    } catch (error) {
      console.error('Failed to initialize Redis:', error);
      return null;
    }
  }
  return null;
}

// In-memory storage fallback (temporary)
let memoryStore = [];

/**
 * Add a submission to storage
 */
export async function addSubmission(submission) {
  const redis = getRedisClient();
  
  // Try Redis first
  if (redis) {
    try {
      // Get existing submissions
      const existing = await redis.get(REDIS_KEY);
      let submissions = existing ? JSON.parse(existing) : [];
      
      // Add new submission
      submissions.push(submission);
      
      // Keep only last 10000 submissions to avoid memory issues
      if (submissions.length > 10000) {
        submissions = submissions.slice(-10000);
      }
      
      // Store back to Redis
      await redis.set(REDIS_KEY, JSON.stringify(submissions));
      
      return { success: true, storage: 'redis' };
    } catch (error) {
      console.error('Redis error, falling back:', error);
      // Fall through to next storage option
    }
  }
  
  if (isServerless) {
    // Serverless without Redis: use in-memory storage
    memoryStore.push(submission);
    
    // Keep only last 1000 submissions to avoid memory issues
    if (memoryStore.length > 1000) {
      memoryStore = memoryStore.slice(-1000);
    }
    
    return { success: true, storage: 'in-memory' };
  } else {
    // Local: use filesystem
    try {
      const dataDir = path.join(process.cwd(), 'data');
      const dataFile = path.join(dataDir, 'user-submissions.json');

      // Create data directory if it doesn't exist
      if (!fs.existsSync(dataDir)) {
        fs.mkdirSync(dataDir, { recursive: true });
      }

      // Read existing data
      let submissions = [];
      if (fs.existsSync(dataFile)) {
        const fileContent = fs.readFileSync(dataFile, 'utf8');
        submissions = JSON.parse(fileContent);
      }

      // Add new submission
      submissions.push(submission);

      // Write back to file
      fs.writeFileSync(dataFile, JSON.stringify(submissions, null, 2));

      return { success: true, storage: 'filesystem' };
    } catch (error) {
      throw new Error(`Failed to save to filesystem: ${error.message}`);
    }
  }
}

/**
 * Get all submissions from storage
 */
export async function getSubmissions() {
  const redis = getRedisClient();
  
  // Try Redis first
  if (redis) {
    try {
      const data = await redis.get(REDIS_KEY);
      const submissions = data ? JSON.parse(data) : [];
      
      return {
        submissions: submissions,
        count: submissions.length,
        storage: 'redis'
      };
    } catch (error) {
      console.error('Redis error, falling back:', error);
      // Fall through to next storage option
    }
  }
  
  if (isServerless) {
    // Serverless without Redis: return in-memory data
    return {
      submissions: memoryStore,
      count: memoryStore.length,
      storage: 'in-memory'
    };
  } else {
    // Local: read from filesystem
    try {
      const dataDir = path.join(process.cwd(), 'data');
      const dataFile = path.join(dataDir, 'user-submissions.json');

      // Check if data file exists
      if (!fs.existsSync(dataFile)) {
        return {
          submissions: [],
          count: 0,
          storage: 'filesystem'
        };
      }

      // Read and return all submissions
      const fileContent = fs.readFileSync(dataFile, 'utf8');
      const submissions = JSON.parse(fileContent);

      return {
        submissions: submissions,
        count: submissions.length,
        storage: 'filesystem'
      };
    } catch (error) {
      throw new Error(`Failed to read from filesystem: ${error.message}`);
    }
  }
}

/**
 * Check if we're in serverless mode
 */
export function isServerlessEnvironment() {
  return isServerless;
}
