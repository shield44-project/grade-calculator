// API endpoint to delete all submissions from a specific IP address
// Protected by admin password

import { deleteSubmissionsByIP } from '../../lib/storage';

export default async function handler(req, res) {
  if (req.method !== 'DELETE') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Simple authentication - check for admin password
  const adminPassword = req.headers['x-admin-password'] || req.query.password;
  const ADMIN_PASSWORD = 'bozgors'; // Hardcoded admin password

  if (adminPassword !== ADMIN_PASSWORD) {
    return res.status(401).json({ 
      error: 'Unauthorized',
      hint: 'Admin password required. Use password: bozgors' 
    });
  }

  try {
    const { ipAddress } = req.body;
    
    if (!ipAddress) {
      return res.status(400).json({ error: 'IP address required' });
    }

    const result = await deleteSubmissionsByIP(ipAddress);
    
    if (result.success) {
      res.status(200).json({ 
        success: true, 
        message: `Successfully deleted ${result.deletedCount} submission(s) from IP ${ipAddress}`,
        deletedCount: result.deletedCount,
        storage: result.storage
      });
    } else {
      res.status(400).json({ 
        success: false, 
        error: result.error 
      });
    }
  } catch (error) {
    console.error('Error deleting IP group:', error);
    res.status(500).json({ 
      error: 'Failed to delete IP group',
      details: error.message 
    });
  }
}
