// API endpoint to receive issue reports from users
import { addIssue } from '../../lib/storage';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { title, description, email, page } = req.body;
    
    // Validate required fields
    if (!title || !description) {
      return res.status(400).json({ error: 'Title and description are required' });
    }

    // Extract device/browser information from user agent
    const userAgent = req.headers['user-agent'] || '';
    
    // Create issue object
    const issue = {
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      timestamp: new Date().toISOString(),
      title: title.trim(),
      description: description.trim(),
      email: email ? email.trim() : null,
      page: page || 'Unknown',
      userAgent: userAgent,
      ipAddress: req.headers['x-forwarded-for'] || req.socket.remoteAddress || null,
      status: 'open' // open, in-progress, resolved
    };

    const result = await addIssue(issue);
    
    res.status(200).json({ 
      success: true, 
      message: 'Issue reported successfully. Thank you for your feedback!',
      storage: result.storage
    });
  } catch (error) {
    console.error('Error saving issue:', error);
    res.status(500).json({ 
      error: 'Failed to submit issue',
      details: error.message 
    });
  }
}
