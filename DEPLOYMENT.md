# Deployment Guide for Vercel

This guide will help you deploy the RVCE Grade Calculator to Vercel and configure Redis for persistent data storage.

## Prerequisites

- GitHub account
- Vercel account (free tier is sufficient)
- Redis instance (optional but recommended)

## Step 1: Prepare Your Repository

1. Fork or clone this repository to your GitHub account
2. Ensure all changes are committed and pushed

## Step 2: Deploy to Vercel

1. Go to [Vercel](https://vercel.com)
2. Click "Add New Project"
3. Import your GitHub repository
4. Vercel will auto-detect it's a Next.js project
5. Click "Deploy"

Your site will be deployed, but **data submissions won't persist** without Redis.

## Step 3: Set Up Redis (Recommended)

### Option A: Redis Labs (Free Tier)

1. Go to [Redis Labs](https://redis.com/try-free/)
2. Sign up for a free account
3. Create a new database
4. Copy your Redis URL (format: `redis://default:password@host:port`)

### Option B: Upstash (Serverless Redis)

1. Go to [Upstash](https://upstash.com/)
2. Sign up for a free account
3. Create a new Redis database
4. Copy your Redis URL

## Step 4: Configure Environment Variables in Vercel

1. In your Vercel project dashboard, go to "Settings"
2. Click on "Environment Variables"
3. Add a new variable:
   - **Name:** `REDIS_URL`
   - **Value:** Your Redis URL (e.g., `redis://default:password@host:port`)
   - **Environment:** Production, Preview, Development
4. Click "Save"

## Step 5: Redeploy

After adding the environment variable:
1. Go to "Deployments" tab
2. Click "..." on the latest deployment
3. Click "Redeploy"

Your app will now use Redis for persistent storage!

## Step 6: Verify Storage

1. Visit your deployed site
2. Enter some grade data
3. Access the admin endpoint:
   ```
   https://your-domain.vercel.app/api/admin-data?key=shield44-admin-2025-rvce-calculator
   ```
4. You should see `"storage": "redis"` in the response

## Optional Features

### Login System

The app includes an optional login system:
- Users can click "Login (Optional)" in the header
- Login is completely optional - the calculator works without it
- Login just stores a username locally for personalization
- No actual authentication is performed

### Admin Access

To access collected user data:
- URL: `https://your-domain.vercel.app/api/admin-data?key=shield44-admin-2025-rvce-calculator`
- **Security Note:** This key is hardcoded and visible in the source code. For production, implement proper authentication.

## Troubleshooting

### Issue: Getting 500 errors on POST requests

**Solution:** This is the issue this PR fixes. Make sure you:
1. Have the latest code with Redis support
2. Have set the `REDIS_URL` environment variable in Vercel
3. Have redeployed after adding the environment variable

### Issue: Data not persisting

**Solution:** 
- Verify `REDIS_URL` is set correctly in Vercel
- Check the admin endpoint response - it should show `"storage": "redis"`
- If it shows `"storage": "in-memory"`, the Redis connection failed

### Issue: Redis connection errors

**Solution:**
- Verify your Redis URL is correct
- Check if your Redis instance is accessible from Vercel's servers
- Some Redis providers require whitelisting IPs - Vercel uses dynamic IPs, so choose a provider that allows all IPs or doesn't require whitelisting

## Performance Optimization

### Redis Configuration

For better performance:
- Enable Redis persistence (RDB or AOF)
- Set appropriate memory policies
- Monitor Redis memory usage
- Consider upgrading to a paid tier for production use

### Rate Limiting

Consider adding rate limiting to prevent abuse:
```javascript
// Example using Vercel's edge config
// In your API routes
if (requests_per_minute > 10) {
  return res.status(429).json({ error: 'Too many requests' });
}
```

## Security Recommendations

1. **Change the admin key:** Replace the hardcoded key with an environment variable
2. **Implement proper auth:** Use NextAuth.js or similar for real authentication
3. **Use HTTPS:** Vercel provides this by default
4. **Secure Redis:** Use strong passwords and TLS connections
5. **Add rate limiting:** Prevent API abuse
6. **Monitor logs:** Check Vercel logs regularly for suspicious activity

## Support

If you encounter issues:
1. Check Vercel deployment logs
2. Check Redis connection in your provider dashboard
3. Test API endpoints directly with curl or Postman
4. Open an issue on GitHub

## Cost Estimate

- Vercel: Free tier (sufficient for most use cases)
- Redis Labs: Free tier (30MB, 30 connections) - suitable for testing
- Upstash: Pay-as-you-go (very affordable for low to medium traffic)

For a student project with moderate usage, total cost: **$0-5/month**
