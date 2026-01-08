# Admin Data Collection Guide

This guide explains how to access the user data collected by the grade calculator.

## How It Works

When users enter their grade data on the website, it is automatically submitted to the backend after 3 seconds of inactivity. This data is stored using one of these methods:
- **Filesystem** (local development) - persistent storage
- **In-memory** (production without Redis) - temporary storage, resets on cold starts
- **Redis** (optional for production) - persistent storage if configured

## Simple Admin Access

The admin system is designed to be simple and easy to use - no environment variables or external services required!

### Admin Password

**Default Password:** `bozgors`

This password is hardcoded in the application and works out of the box. No configuration needed!

## Accessing Collected Data

### Method 1: Admin Dashboard (Recommended)

1. Visit your site at: `https://your-domain.com/admin`
2. Enter the password: `bozgors`
3. View and export all collected data

### Method 2: Direct API Access

Simply visit this URL in your browser:
```
https://your-domain.com/api/admin-data?password=bozgors
```

Or use the Network tab in browser DevTools to see the admin password in any API response.

### Method 3: Using curl

```bash
curl "https://your-domain.com/api/admin-data?password=bozgors"
```

Or with header:
```bash
curl -H "x-admin-password: bozgors" https://your-domain.com/api/admin-data
```

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

## Storage Options

### Default (No Configuration Required)

The app works out of the box with in-memory storage. This is fine for:
- Testing and development
- Low-traffic sites where data loss is acceptable
- When you don't want to set up external services

**Note:** In-memory data is temporary and will be lost when the server restarts or on serverless cold starts.

### Local Development

When running locally, data is automatically saved to `/data/user-submissions.json` for persistence.

### Optional: Redis for Persistent Storage

If you need persistent storage in production (Vercel, serverless environments), you can optionally configure Redis:

1. Get a free Redis instance from:
   - [Redis Labs](https://redis.com/try-free/)
   - [Upstash](https://upstash.com/)
   
2. Add the Redis URL as an environment variable:
   ```
   REDIS_URL=redis://default:your-password@your-redis-host:port
   ```

3. The app will automatically detect and use Redis for persistent storage

**But this is completely optional!** The app works fine without it.

## Security Notes

1. **The default password is simple:** The password "bozgors" is hardcoded and visible to anyone who reads the code
2. **This is intentionally simple:** No environment variables, no complicated setup
3. **For production use:** Consider changing the password in the code or implementing proper authentication
4. Use HTTPS to prevent password interception (Vercel provides this by default)
5. Consider implementing rate limiting to prevent abuse
6. Regularly backup the data (export from admin dashboard)
7. **For Redis:** Keep your Redis credentials secure and never commit them

## Privacy Considerations

- User data is collected automatically without explicit consent
- Consider adding a privacy policy
- Ensure compliance with data protection regulations (GDPR, etc.)
- Consider anonymizing or aggregating data
- Implement data retention policies

## Quick Start Guide

1. Deploy your app (no configuration needed!)
2. Users can start using the calculator immediately
3. Data is collected automatically
4. Access admin dashboard at `/admin` with password `bozgors`
5. View and export all submissions

That's it! No Redis setup, no environment variables, no complicated configuration.
