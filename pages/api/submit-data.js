// API endpoint to collect user-entered grade data
// This data is stored and can be accessed by the website owner

import { addSubmission, isServerlessEnvironment } from '../../lib/storage';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const data = req.body;
    
    // Add timestamp and session info
    const submission = {
      timestamp: new Date().toISOString(),
      userAgent: req.headers['user-agent'],
      data: data
    };

    const result = await addSubmission(submission);
    
    const response = { 
      success: true, 
      message: 'Data submitted successfully',
      storage: result.storage,
      _dev: 'Admin access: /api/admin-data?key=shield44-admin-2025-rvce-calculator'
    };

    if (result.storage === 'in-memory') {
      response._note = 'Using temporary in-memory storage. Data persists within the same instance but resets on cold starts. Configure REDIS_URL environment variable for persistent storage.';
    } else if (result.storage === 'redis') {
      response._note = 'Using Redis for persistent storage. Your data is safely stored.';
    }

    res.status(200).json(response);
  } catch (error) {
    console.error('Error saving data:', error);
    res.status(500).json({ 
      error: 'Failed to save data',
      details: error.message 
    });
  }
}
