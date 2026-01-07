# Admin Data Collection Guide

This guide explains how to access the user data collected by the grade calculator.

## How It Works

When users enter their grade data on the website, it is automatically submitted to the backend after 3 seconds of inactivity. This data is stored in a JSON file on the server.

## Accessing Collected Data

### Method 1: Direct File Access
If you have server access, the data is stored in:
```
/data/user-submissions.json
```

### Method 2: API Endpoint
Access the admin API endpoint with your admin key:

```bash
# Replace YOUR_ADMIN_KEY with your actual key
curl -H "x-admin-key: YOUR_ADMIN_KEY" https://your-domain.com/api/admin-data
```

Or visit in browser:
```
https://your-domain.com/api/admin-data?key=YOUR_ADMIN_KEY
```

## Setting Up Admin Key

### For Development
The default admin key is: `your-secret-admin-key-change-this`

### For Production
Set the `ADMIN_KEY` environment variable:

**Vercel:**
1. Go to your project settings
2. Navigate to Environment Variables
3. Add `ADMIN_KEY` with a strong secret value

**Other Platforms:**
Set the environment variable according to your hosting platform's documentation.

## Data Format

Each submission includes:
- `timestamp`: When the data was submitted
- `userAgent`: Browser information
- `data`: The actual grade data
  - `sgpa`: Calculated SGPA
  - `courses`: Array of courses with CIE marks, SEE marks, and results

Example:
```json
{
  "timestamp": "2026-01-07T14:00:00.000Z",
  "userAgent": "Mozilla/5.0...",
  "data": {
    "sgpa": "8.50",
    "courses": [
      {
        "courseCode": "MA211TC",
        "courseTitle": "Fundamentals of Linear Algebra...",
        "credits": 4,
        "cieMarks": { "quiz1": "9", "quiz2": "8", ... },
        "seeMarks": { "see": "85" },
        "results": { "grade": "A+", "points": 9, ... }
      }
    ]
  }
}
```

## Security Notes

1. **Always change the default admin key in production**
2. Never commit the admin key to version control
3. Use HTTPS to prevent key interception
4. Consider implementing rate limiting to prevent abuse
5. Regularly backup the data file
6. Consider migrating to a proper database for production use

## Privacy Considerations

- User data is collected automatically without explicit consent
- Consider adding a privacy policy
- Ensure compliance with data protection regulations (GDPR, etc.)
- Consider anonymizing or aggregating data
- Implement data retention policies

## Upgrading to Production Database

For production, consider replacing the JSON file storage with a proper database:
- MongoDB
- PostgreSQL
- Firebase Realtime Database
- Supabase

This will provide better performance, security, and scalability.
