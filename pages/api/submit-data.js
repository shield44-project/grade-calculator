// API endpoint to collect user-entered grade data
// This data is stored and can be accessed by the website owner

import { addSubmission, isServerlessEnvironment } from '../../lib/storage';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const data = req.body;
    
    // Extract device/browser information from user agent
    const userAgent = req.headers['user-agent'] || '';
    const deviceInfo = extractDeviceInfo(userAgent);
    
    // Add timestamp, session info, and device details
    const submission = {
      timestamp: new Date().toISOString(),
      username: data.username || null,
      loginTime: data.loginTime || null,
      userAgent: userAgent,
      deviceInfo: deviceInfo,
      ipAddress: req.headers['x-forwarded-for'] || req.socket.remoteAddress || null,
      data: {
        sgpa: data.sgpa,
        courses: data.courses
      }
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

// Helper function to extract device info from user agent
function extractDeviceInfo(userAgent) {
  const ua = userAgent.toLowerCase();
  
  // Detect OS
  let os = 'Unknown';
  if (ua.includes('windows')) os = 'Windows';
  else if (ua.includes('mac os')) os = 'macOS';
  else if (ua.includes('linux')) os = 'Linux';
  else if (ua.includes('android')) os = 'Android';
  else if (ua.includes('iphone') || ua.includes('ipad')) os = 'iOS';
  
  // Detect Browser
  let browser = 'Unknown';
  if (ua.includes('firefox')) browser = 'Firefox';
  else if (ua.includes('chrome') && !ua.includes('edg')) browser = 'Chrome';
  else if (ua.includes('safari') && !ua.includes('chrome')) browser = 'Safari';
  else if (ua.includes('edg')) browser = 'Edge';
  else if (ua.includes('opera') || ua.includes('opr')) browser = 'Opera';
  
  // Detect device type
  let device = 'Desktop';
  if (ua.includes('mobile')) device = 'Mobile';
  else if (ua.includes('tablet')) device = 'Tablet';
  
  return { os, browser, device };
}
