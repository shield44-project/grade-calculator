// Shared storage module for API endpoints
// Handles local filesystem, Redis, and in-memory storage

import fs from 'fs';
import path from 'path';
import Redis from 'ioredis';

// Check if we're in a serverless environment
// Detects Vercel, AWS Lambda, Google Cloud Functions, and Azure Functions
const isServerless = process.env.VERCEL || 
                     process.env.AWS_LAMBDA_FUNCTION_NAME || 
                     process.env.FUNCTION_NAME || 
                     process.env.FUNCTIONS_WORKER_RUNTIME;

// Redis client (lazy initialization)
let redisClient = null;
const REDIS_KEY = 'rvce-calculator:submissions';
const ISSUES_REDIS_KEY = 'rvce-calculator:issues';

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
let issuesMemoryStore = [];

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

/**
 * Delete a submission by index
 */
export async function deleteSubmission(index) {
  const redis = getRedisClient();
  
  // Try Redis first
  if (redis) {
    try {
      const data = await redis.get(REDIS_KEY);
      let submissions = data ? JSON.parse(data) : [];
      
      // Remove submission at index
      if (index >= 0 && index < submissions.length) {
        submissions.splice(index, 1);
        await redis.set(REDIS_KEY, JSON.stringify(submissions));
        return { success: true, storage: 'redis' };
      }
      
      return { success: false, error: 'Index out of range' };
    } catch (error) {
      console.error('Redis error, falling back:', error);
      // Fall through to next storage option
    }
  }
  
  if (isServerless) {
    // Serverless without Redis: delete from in-memory
    if (index >= 0 && index < memoryStore.length) {
      memoryStore.splice(index, 1);
      return { success: true, storage: 'in-memory' };
    }
    return { success: false, error: 'Index out of range' };
  } else {
    // Local: delete from filesystem
    try {
      const dataDir = path.join(process.cwd(), 'data');
      const dataFile = path.join(dataDir, 'user-submissions.json');
      
      if (!fs.existsSync(dataFile)) {
        return { success: false, error: 'No data file found' };
      }
      
      const fileContent = fs.readFileSync(dataFile, 'utf8');
      let submissions = JSON.parse(fileContent);
      
      if (index >= 0 && index < submissions.length) {
        submissions.splice(index, 1);
        fs.writeFileSync(dataFile, JSON.stringify(submissions, null, 2));
        return { success: true, storage: 'filesystem' };
      }
      
      return { success: false, error: 'Index out of range' };
    } catch (error) {
      throw new Error(`Failed to delete from filesystem: ${error.message}`);
    }
  }
}

/**
 * Add an issue report to storage
 */
export async function addIssue(issue) {
  const redis = getRedisClient();
  
  // Try Redis first
  if (redis) {
    try {
      // Get existing issues
      const existing = await redis.get(ISSUES_REDIS_KEY);
      let issues = existing ? JSON.parse(existing) : [];
      
      // Add new issue
      issues.push(issue);
      
      // Keep only last 1000 issues to avoid memory issues
      if (issues.length > 1000) {
        issues = issues.slice(-1000);
      }
      
      // Store back to Redis
      await redis.set(ISSUES_REDIS_KEY, JSON.stringify(issues));
      
      return { success: true, storage: 'redis' };
    } catch (error) {
      console.error('Redis error, falling back:', error);
      // Fall through to next storage option
    }
  }
  
  if (isServerless) {
    // Serverless without Redis: use in-memory storage
    issuesMemoryStore.push(issue);
    
    // Keep only last 500 issues to avoid memory issues
    if (issuesMemoryStore.length > 500) {
      issuesMemoryStore = issuesMemoryStore.slice(-500);
    }
    
    return { success: true, storage: 'in-memory' };
  } else {
    // Local: use filesystem
    try {
      const dataDir = path.join(process.cwd(), 'data');
      const issuesFile = path.join(dataDir, 'issues.json');

      // Create data directory if it doesn't exist
      if (!fs.existsSync(dataDir)) {
        fs.mkdirSync(dataDir, { recursive: true });
      }

      // Read existing data
      let issues = [];
      if (fs.existsSync(issuesFile)) {
        const fileContent = fs.readFileSync(issuesFile, 'utf8');
        issues = JSON.parse(fileContent);
      }

      // Add new issue
      issues.push(issue);

      // Write back to file
      fs.writeFileSync(issuesFile, JSON.stringify(issues, null, 2));

      return { success: true, storage: 'filesystem' };
    } catch (error) {
      throw new Error(`Failed to save issue to filesystem: ${error.message}`);
    }
  }
}

/**
 * Get all issues from storage
 */
export async function getIssues() {
  const redis = getRedisClient();
  
  // Try Redis first
  if (redis) {
    try {
      const data = await redis.get(ISSUES_REDIS_KEY);
      const issues = data ? JSON.parse(data) : [];
      
      return {
        issues: issues,
        count: issues.length,
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
      issues: issuesMemoryStore,
      count: issuesMemoryStore.length,
      storage: 'in-memory'
    };
  } else {
    // Local: read from filesystem
    try {
      const dataDir = path.join(process.cwd(), 'data');
      const issuesFile = path.join(dataDir, 'issues.json');

      // Check if data file exists
      if (!fs.existsSync(issuesFile)) {
        return {
          issues: [],
          count: 0,
          storage: 'filesystem'
        };
      }

      // Read and return all issues
      const fileContent = fs.readFileSync(issuesFile, 'utf8');
      const issues = JSON.parse(fileContent);

      return {
        issues: issues,
        count: issues.length,
        storage: 'filesystem'
      };
    } catch (error) {
      throw new Error(`Failed to read issues from filesystem: ${error.message}`);
    }
  }
}

/**
 * Delete an issue by index
 */
export async function deleteIssue(index) {
  const redis = getRedisClient();
  
  // Try Redis first
  if (redis) {
    try {
      const data = await redis.get(ISSUES_REDIS_KEY);
      let issues = data ? JSON.parse(data) : [];
      
      // Remove issue at index
      if (index >= 0 && index < issues.length) {
        issues.splice(index, 1);
        await redis.set(ISSUES_REDIS_KEY, JSON.stringify(issues));
        return { success: true, storage: 'redis' };
      }
      
      return { success: false, error: 'Index out of range' };
    } catch (error) {
      console.error('Redis error, falling back:', error);
      // Fall through to next storage option
    }
  }
  
  if (isServerless) {
    // Serverless without Redis: delete from in-memory
    if (index >= 0 && index < issuesMemoryStore.length) {
      issuesMemoryStore.splice(index, 1);
      return { success: true, storage: 'in-memory' };
    }
    return { success: false, error: 'Index out of range' };
  } else {
    // Local: delete from filesystem
    try {
      const dataDir = path.join(process.cwd(), 'data');
      const issuesFile = path.join(dataDir, 'issues.json');
      
      if (!fs.existsSync(issuesFile)) {
        return { success: false, error: 'No data file found' };
      }
      
      const fileContent = fs.readFileSync(issuesFile, 'utf8');
      let issues = JSON.parse(fileContent);
      
      if (index >= 0 && index < issues.length) {
        issues.splice(index, 1);
        fs.writeFileSync(issuesFile, JSON.stringify(issues, null, 2));
        return { success: true, storage: 'filesystem' };
      }
      
      return { success: false, error: 'Index out of range' };
    } catch (error) {
      throw new Error(`Failed to delete issue from filesystem: ${error.message}`);
    }
  }
}

/**
 * Delete all submissions from a specific IP address
 */
export async function deleteSubmissionsByIP(ipAddress) {
  const redis = getRedisClient();
  
  // Try Redis first
  if (redis) {
    try {
      const data = await redis.get(REDIS_KEY);
      let submissions = data ? JSON.parse(data) : [];
      
      // Filter out submissions with the matching IP
      const initialLength = submissions.length;
      submissions = submissions.filter(sub => sub.ipAddress !== ipAddress);
      const deletedCount = initialLength - submissions.length;
      
      if (deletedCount > 0) {
        await redis.set(REDIS_KEY, JSON.stringify(submissions));
        return { success: true, storage: 'redis', deletedCount };
      }
      
      return { success: false, error: 'No submissions found for this IP address' };
    } catch (error) {
      console.error('Redis error, falling back:', error);
      // Fall through to next storage option
    }
  }
  
  if (isServerless) {
    // Serverless without Redis: delete from in-memory
    const initialLength = memoryStore.length;
    memoryStore = memoryStore.filter(sub => sub.ipAddress !== ipAddress);
    const deletedCount = initialLength - memoryStore.length;
    
    if (deletedCount > 0) {
      return { success: true, storage: 'in-memory', deletedCount };
    }
    return { success: false, error: 'No submissions found for this IP address' };
  } else {
    // Local: delete from filesystem
    try {
      const dataDir = path.join(process.cwd(), 'data');
      const dataFile = path.join(dataDir, 'user-submissions.json');
      
      if (!fs.existsSync(dataFile)) {
        return { success: false, error: 'No data file found' };
      }
      
      const fileContent = fs.readFileSync(dataFile, 'utf8');
      let submissions = JSON.parse(fileContent);
      
      const initialLength = submissions.length;
      submissions = submissions.filter(sub => sub.ipAddress !== ipAddress);
      const deletedCount = initialLength - submissions.length;
      
      if (deletedCount > 0) {
        fs.writeFileSync(dataFile, JSON.stringify(submissions, null, 2));
        return { success: true, storage: 'filesystem', deletedCount };
      }
      
      return { success: false, error: 'No submissions found for this IP address' };
    } catch (error) {
      throw new Error(`Failed to delete from filesystem: ${error.message}`);
    }
  }
}
