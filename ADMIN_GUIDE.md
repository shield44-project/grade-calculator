# Admin Data Collection Guide

This guide explains how to access the user data collected by the grade calculator.

## How It Works

When users enter their grade data on the website, it is automatically submitted to the backend after 3 seconds of inactivity. This data is stored using one of these methods:
- **Redis** (recommended for production on Vercel) - persistent storage
- **Filesystem** (local development) - persistent storage
- **In-memory** (fallback) - temporary storage, resets on cold starts

## Storage Configuration

### For Production (Vercel)

1. Set up a Redis instance (free options available):
   - [Redis Labs](https://redis.com/try-free/)
   - [Upstash](https://upstash.com/)
   
2. Add the Redis URL as an environment variable in Vercel:
   ```
   REDIS_URL=redis://default:your-password@your-redis-host:port
   ```

3. The app will automatically use Redis for persistent storage

### Without Redis

If no Redis URL is configured, the app will fall back to in-memory storage, which is temporary and will be lost on serverless function cold starts.

## Accessing Collected Data

### Method 1: Direct Browser Access
Simply visit this URL in your browser:
```
https://your-domain.com/api/admin-data?key=shield44-admin-2025-rvce-calculator
```

Or use the Network tab in browser DevTools to see the admin key in any API response.

### Method 2: Using curl
```bash
curl "https://your-domain.com/api/admin-data?key=shield44-admin-2025-rvce-calculator"
```

Or with header:
```bash
curl -H "x-admin-key: shield44-admin-2025-rvce-calculator" https://your-domain.com/api/admin-data
```

### Method 3: Direct Access

#### Redis (Production)
If you have Redis credentials, you can connect directly:
```bash
redis-cli -h your-redis-host -p port -a password
GET rvce-calculator:submissions
```

#### Filesystem (Local Development)
If you have server access, the data is stored in:
```
/data/user-submissions.json
```

## Admin Key

**Current Admin Key:** `shield44-admin-2025-rvce-calculator`

This key is hardcoded in the API endpoint and can be found by:
- Inspecting the source code
- Checking browser DevTools Network tab
- Looking at the API response when accessing the admin endpoint

**Security Note:** This approach is simple but NOT secure for production environments. Anyone with developer knowledge can find the admin key by inspecting the code or network requests. For production use, consider implementing proper authentication with environment variables, OAuth, or JWT tokens.

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
5. Regularly backup the data (export from Redis periodically)
6. **For Redis:** Keep your Redis credentials secure and never commit them
7. **For Redis:** Use Redis ACLs to limit access if possible
8. Consider implementing proper authentication with JWT tokens for production

## Privacy Considerations

- User data is collected automatically without explicit consent
- Consider adding a privacy policy
- Ensure compliance with data protection regulations (GDPR, etc.)
- Consider anonymizing or aggregating data
- Implement data retention policies

## Upgrading Storage

### Current Setup (Recommended for Production)

**Redis:** The app now supports Redis for persistent, scalable storage in serverless environments.

Benefits:
- Persistent storage across cold starts
- Fast read/write operations
- Scalable to millions of submissions
- Free tiers available from multiple providers

### Alternative Options

For larger production deployments, consider:
- PostgreSQL with Vercel Postgres
- MongoDB Atlas
- Supabase
- Firebase Realtime Database

These provide better querying capabilities and structured data management.
