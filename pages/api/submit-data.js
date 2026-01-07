// API endpoint to collect user-entered grade data
// This data is stored and can be accessed by the website owner

import fs from 'fs';
import path from 'path';

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

    // Store data in a JSON file (in production, use a proper database)
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

    res.status(200).json({ 
      success: true, 
      message: 'Data submitted successfully',
      // Hint for website owner in DevTools
      _dev: 'Admin access: /api/admin-data?key=shield44-admin-2025-rvce-calculator'
    });
  } catch (error) {
    console.error('Error saving data:', error);
    res.status(500).json({ error: 'Failed to save data' });
  }
}
