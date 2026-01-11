// API endpoint to retrieve all issues
// Protected by admin password

import { getIssues } from '../../lib/storage';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Simple authentication - check for admin password
  const adminPassword = req.headers['x-admin-password'] || req.query.password;
  const ADMIN_PASSWORD = 'bozgors'; // Hardcoded admin password

  if (adminPassword !== ADMIN_PASSWORD) {
    return res.status(401).json({ 
      error: 'Unauthorized'
    });
  }

  try {
    const { issues, count, storage } = await getIssues();
    
    res.status(200).json({ 
      issues: issues,
      count: count,
      message: count > 0 ? 'Issues retrieved successfully' : 'No issues yet',
      storage: storage
    });
  } catch (error) {
    console.error('Error reading issues:', error);
    res.status(500).json({ 
      error: 'Failed to retrieve issues',
      details: error.message 
    });
  }
}
