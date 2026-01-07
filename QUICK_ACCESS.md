# Quick Access Guide for Website Owner

## Accessing Your Collected User Data

### Option 1: Direct Browser Access (Easiest)
Just click this link or paste it in your browser:
```
http://localhost:3000/api/admin-data?key=shield44-admin-2025-rvce-calculator
```

For production (replace with your domain):
```
https://your-domain.com/api/admin-data?key=shield44-admin-2025-rvce-calculator
```

### Option 2: Via Browser DevTools
1. Open your website in browser
2. Press F12 or Right-click → Inspect
3. Go to the **Network** tab
4. Enter some grade data (this triggers automatic submission)
5. Look for the request to `/api/submit-data`
6. Check the response - you'll see: `"_dev": "Admin access: /api/admin-data?key=shield44-admin-2025-rvce-calculator"`
7. Copy that URL and paste it in your browser

### Option 3: Console Method
1. Open your website
2. Press F12 → Console tab
3. Paste this code:
```javascript
fetch('/api/admin-data?key=shield44-admin-2025-rvce-calculator')
  .then(r => r.json())
  .then(data => console.table(data.submissions))
```
4. Press Enter - you'll see all collected data in a nice table

## Admin Key
**Current key:** `shield44-admin-2025-rvce-calculator`

This key is hardcoded in the API files and can be found by:
- Looking at this file
- Inspecting network requests in DevTools
- Checking the source code in `/pages/api/admin-data.js`

## Security Note
⚠️ **Important:** This key is visible to anyone who inspects the code or network requests. This is fine for personal use but NOT secure for production environments with sensitive data. Anyone with developer knowledge can find this key.

For better security in production:
- Use environment variables
- Implement proper authentication (OAuth, JWT)
- Add rate limiting
- Use a proper database instead of JSON files

## What Data is Collected
Each submission includes:
- Timestamp
- User's browser information (user agent)
- All course data (codes, titles, credits)
- All CIE and SEE marks entered
- Calculated results (grades, SGPA, pass/fail status)

The data is stored in `/data/user-submissions.json` on your server.
