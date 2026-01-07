// Admin endpoint to retrieve all collected user data
// Protected by admin key - only accessible by website owner

import fs from 'fs';
import path from 'path';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Simple authentication - check for admin key
  // In production, use environment variables and proper authentication
  const adminKey = req.headers['x-admin-key'] || req.query.key;
  const ADMIN_KEY = process.env.ADMIN_KEY || 'your-secret-admin-key-change-this';

  if (adminKey !== ADMIN_KEY) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    const dataDir = path.join(process.cwd(), 'data');
    const dataFile = path.join(dataDir, 'user-submissions.json');

    // Check if data file exists
    if (!fs.existsSync(dataFile)) {
      return res.status(200).json({ 
        submissions: [], 
        count: 0,
        message: 'No submissions yet' 
      });
    }

    // Read and return all submissions
    const fileContent = fs.readFileSync(dataFile, 'utf8');
    const submissions = JSON.parse(fileContent);

    res.status(200).json({ 
      submissions: submissions,
      count: submissions.length,
      message: 'Data retrieved successfully'
    });
  } catch (error) {
    console.error('Error reading data:', error);
    res.status(500).json({ error: 'Failed to retrieve data' });
  }
}
