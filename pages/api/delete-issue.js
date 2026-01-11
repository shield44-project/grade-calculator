// API endpoint to delete an issue
// Protected by admin password

import { deleteIssue } from '../../lib/storage';

export default async function handler(req, res) {
  if (req.method !== 'DELETE') {
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
    const { index } = req.body;
    
    if (index === undefined || index === null) {
      return res.status(400).json({ error: 'Issue index required' });
    }

    const result = await deleteIssue(index);
    
    if (result.success) {
      res.status(200).json({ 
        success: true, 
        message: 'Issue deleted successfully',
        storage: result.storage
      });
    } else {
      res.status(400).json({ 
        success: false, 
        error: result.error 
      });
    }
  } catch (error) {
    console.error('Error deleting issue:', error);
    res.status(500).json({ 
      error: 'Failed to delete issue',
      details: error.message 
    });
  }
}
