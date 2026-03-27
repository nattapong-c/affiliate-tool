# Facebook Feed Scraper Setup Guide

## ⚠️ Important: Facebook Authentication Required

The Facebook scraper requires a valid Facebook session to work. Without authentication, you will see errors when trying to scrape your feed.

## How It Works (v2.0 - Feed-Based Scraping)

The scraper now:
1. Opens a browser window
2. Navigates to `facebook.com/` (your homepage feed)
3. Scrolls through your timeline
4. Extracts posts with high engagement
5. Saves them to the database

**No keywords needed!** The scraper uses Facebook's own algorithm to show you relevant posts.

---

## Quick Setup

### Step 1: Enable Headful Mode

Add to your `.env` file:
```bash
FACEBOOK_SCRAPER_HEADLESS=false
```

This allows you to see the browser and log in manually.

### Step 2: Restart Backend

```bash
cd service
bun run dev
```

### Step 3: Trigger First Scrape

1. Open http://localhost:3000/scout
2. Click "Refresh Feed"
3. A browser window will open
4. **Log in to Facebook** in that window
5. The scraper will start scraping your feed

### Step 4: Future Scrapes

Your session is saved! Future scrapes will use your authenticated session automatically.

---

## Testing Your Session

### Check Session Status

```bash
curl http://localhost:8080/api/products/check-session
```

**Response (logged in):**
```json
{
  "success": true,
  "data": {
    "isLoggedIn": true,
    "currentUrl": "https://www.facebook.com/",
    "message": "Facebook session is valid"
  }
}
```

**Response (not logged in):**
```json
{
  "success": true,
  "data": {
    "isLoggedIn": false,
    "currentUrl": "https://www.facebook.com/login/",
    "message": "Not logged in to Facebook"
  }
}
```

---

## How to Use

### Scrape Your Feed

1. **Open Dashboard**: http://localhost:3000/scout
2. **Click "Refresh Feed"**: Scrapes latest posts from your timeline
3. **View Results**: Posts appear in the table with engagement metrics
4. **Filter**: Set minimum engagement thresholds
5. **Sort**: Order by likes, comments, shares, or engagement density

### Engagement Filters

You can filter posts by:
- **Minimum Likes**: Posts must have at least X likes
- **Minimum Comments**: Posts must have at least X comments
- **Minimum Shares**: Posts must have at least X shares
- **Date Range**: Only posts from the last X days

---

## Debugging

### Check Backend Logs

When scraping fails, check the backend logs for detailed error messages:

```bash
cd service
bun run dev
```

Look for logs like:
- `"Starting feed scrape"` - Scraping started
- `"Current page URL"` - Shows current URL
- `"Redirected to login page"` - Session invalid
- `"Extracted X posts"` - Posts found
- `"Feed scrape completed"` - Success!

### View Screenshots

In development mode, the scraper saves screenshots:

```bash
# View latest screenshot
open service/tmp/feed-*.png
```

Screenshots show:
- What the scraper sees
- If login page appears
- If feed loaded correctly
- Any error messages from Facebook

### Common Issues

| Error | Cause | Solution |
|-------|-------|----------|
| "Redirected to login" | No valid session | Log in when browser opens |
| "Session expired" | Cookies expired | Re-login to Facebook |
| "No posts found" | Feed empty or blocked | Scroll more, check filters |
| "Blocked by Facebook" | Detected as bot | Use headful mode, reduce rate |

---

## Advanced Configuration

### Adjust Scroll Count

Control how many posts to load by scrolling:

In `service/src/scrapers/feed-scraper.ts`:
```typescript
await this.scrollAndLoad(page, options.scrollCount || 5); // Increase for more posts
```

### Change Engagement Thresholds

Set default minimum engagement in the UI or API:

```bash
# API example
GET /api/posts?minLikes=10&minComments=5&minShares=2
```

### Session Timeout

Sessions typically last:
- **Days to weeks** with regular use
- **Shorter** if you manually log out
- **Until Facebook invalidates cookies**

To re-authenticate:
1. Clear browser data (if headful)
2. Trigger a scrape
3. Log in again

---

## Security Best Practices

### 1. Use a Test Account

Create a separate Facebook account for scraping:
- Protects your personal account
- Reduces risk of account suspension
- Easier to manage sessions

### 2. Never Commit Cookies

```bash
# Add to .gitignore
.env
*.cookie
session-data.json
```

### 3. Respect Rate Limits

Default settings:
- **Max 10 requests per minute**
- **2-5 second delays** between actions
- **1 concurrent browser** session

To adjust:
```bash
# In .env
RATE_LIMIT_MAX=10
RATE_LIMIT_WINDOW_MS=60000
```

### 4. Monitor Account Health

Watch for:
- Facebook security checkpoints
- Unusual login notifications
- Temporary blocks or restrictions

If detected:
- Stop scraping immediately
- Wait 24-48 hours
- Reduce scraping frequency
- Use more human-like delays

---

## Facebook's Terms of Service

⚠️ **Important Legal Notice**

Automated scraping may violate Facebook's Terms of Service:

1. **Section 3.2** - "You may not access Facebook using automated means"
2. **Section 3.3** - "You may not collect information from Facebook using automated means"

### Risk Mitigation

- Use a **test account**, not your personal account
- Scrape **responsibly** (low frequency, human-like behavior)
- Use **headful mode** (more stealthy)
- **Don't scrape sensitive data**
- **Respect rate limits**

**Use at your own risk.** This tool is for educational purposes.

---

## Alternative: Mock Data for Testing

If you just want to test the UI without actual scraping:

1. Create mock data in `service/tests/fixtures/sample-posts.json`
2. Add a test endpoint that returns mock data
3. Test the full flow without hitting Facebook

Example mock post:
```json
{
  "url": "https://facebook.com/test/post1",
  "content": "Test post content",
  "author": "Test User",
  "timestamp": "2026-03-27T10:00:00Z",
  "engagement": {
    "likes": 150,
    "comments": 45,
    "shares": 23,
    "total": 218
  }
}
```

---

## Troubleshooting Checklist

- [ ] `FACEBOOK_SCRAPER_HEADLESS=false` in `.env`
- [ ] Backend server running (`bun run dev`)
- [ ] Browser opens when triggering scrape
- [ ] Logged in to Facebook in that browser
- [ ] No Facebook security checkpoints
- [ ] Backend logs show no errors
- [ ] Session check endpoint returns `isLoggedIn: true`
- [ ] Screenshots saved in `service/tmp/`

---

## Need Help?

1. **Check backend logs** for detailed error messages
2. **View screenshots** in `service/tmp/`
3. **Test session** with `/api/products/check-session`
4. **Review AGENTS.md** for architecture details
5. **Check task files** for implementation specs

---

**Last Updated:** March 27, 2026
**Version:** 2.0 (Feed-Based Scraping)
