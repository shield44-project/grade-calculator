// Admin endpoint to retrieve all collected user data
// Protected by admin key - only accessible by website owner

import { getSubmissions, isServerlessEnvironment } from '../../lib/storage';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Simple authentication - check for admin password
  // Hardcoded password - simple and easy to remember
  // WARNING: This is NOT secure for production. Anyone who inspects the code can find this password.
  const adminPassword = req.headers['x-admin-password'] || req.query.password;
  const ADMIN_PASSWORD = 'bozgors'; // Hardcoded admin password

  if (adminPassword !== ADMIN_PASSWORD) {
    return res.status(401).json({ 
      error: 'Unauthorized',
      hint: 'Admin password required. Use password: bozgors' 
    });
  }

  try {
    const { submissions, count, storage } = await getSubmissions();
    
    const response = { 
      submissions: submissions,
      count: count,
      message: count > 0 ? 'Data retrieved successfully' : 'No submissions yet',
      storage: storage,
      adminAccess: 'Accessible at /api/admin-data?password=bozgors'
    };

    if (storage === 'in-memory') {
      response.note = 'Using in-memory storage. Data persists within the same instance but resets on cold starts. Configure REDIS_URL environment variable for persistent storage.';
    } else if (storage === 'redis') {
      response.note = 'Using Redis for persistent storage.';
    }

    res.status(200).json(response);
  } catch (error) {
    console.error('Error reading data:', error);
    res.status(500).json({ 
      error: 'Failed to retrieve data',
      details: error.message 
    });
  }
}
