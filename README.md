# Facebook Automation - Feed-Based Post Scraper

AI-powered Facebook feed monitoring tool that finds high-engagement posts from your timeline for Shopee affiliate marketing.

## ⚠️ Breaking Changes (v2.0)

**This project has been refactored to use feed-based scraping instead of keyword search.**

### What Changed:
- ❌ **REMOVED:** Keyword-based Facebook search scraping
- ❌ **REMOVED:** Product selection page
- ❌ **REMOVED:** Manual scrape triggers
- ✅ **NEW:** Scrapes posts from your Facebook feed (homepage)
- ✅ **NEW:** Automatic filtering by engagement metrics

[Read more in AGENTS.md](./AGENTS.md)

---

## 🎯 Overview

This project automates the process of finding high-engagement Facebook posts from your feed and preparing them for AI-generated comments that naturally incorporate Shopee affiliate products.

### How It Works:
1. **Login to Facebook** - Scraper opens browser for authentication
2. **Scrape Feed** - Extracts posts from your Facebook homepage timeline
3. **Filter by Engagement** - Shows posts with high likes, comments, shares
4. **Review & Engage** - Select posts for AI-generated comments (Phase 3)

---

## 🤖 AI Agents

1. **Keyword Strategist** - Generates keywords from Shopee products (for reference)
2. **Post Scout** - Scrapes high-engagement posts from your Facebook feed
3. **Engagement Specialist** - Crafts personalized comments (Phase 3 - Coming Soon)

---

## 🛠️ Tech Stack

### Backend (Service)
- **Runtime**: Bun
- **Framework**: ElysiaJS
- **Database**: MongoDB + Mongoose
- **AI**: OpenAI GPT-4o
- **Browser Automation**: Playwright (stealth mode)
- **Validation**: Zod
- **Logging**: Pino

### Frontend (App)
- **Framework**: NextJS 14+ (App Router)
- **UI**: Shadcn UI + Tailwind CSS
- **State**: React Query (TanStack Query)
- **Icons**: Lucide React
- **HTTP Client**: Axios

---

## 📁 Project Structure

```
facebook-automation/
├── service/              # Backend (ElysiaJS)
│   ├── src/
│   │   ├── scrapers/     # Facebook feed scraper
│   │   ├── services/     # Business logic
│   │   ├── models/       # Mongoose schemas
│   │   ├── routes/       # API routes
│   │   ├── controllers/  # Request handlers
│   │   ├── types/        # TypeScript types
│   │   ├── utils/        # Utilities
│   │   └── index.ts      # Entry point
│   ├── .env.example
│   └── package.json
├── app/                  # Frontend (NextJS)
│   ├── src/
│   │   ├── app/          # NextJS pages
│   │   ├── components/   # React components
│   │   ├── hooks/        # Custom hooks
│   │   └── lib/          # API client
│   ├── .env.example
│   └── package.json
├── tasks/                # Task specifications
├── docs/                 # Documentation
└── README.md
```

---

## 🚀 Getting Started

### Prerequisites
- Bun (latest)
- Node.js 18+
- MongoDB (local or Atlas)
- OpenAI API key (for keyword generation)
- Facebook account (for scraping)

### Installation

1. **Clone the repository**
```bash
cd facebook-automation
```

2. **Set up environment variables**
```bash
# Copy environment files
cp .env.example .env

# Edit .env with your credentials
# IMPORTANT: Set FACEBOOK_SCRAPER_HEADLESS=false for first run
```

3. **Install backend dependencies**
```bash
cd service
bun install
```

4. **Install frontend dependencies**
```bash
cd ../app
bun install
```

5. **Install Playwright browser**
```bash
cd service
bunx playwright install chromium
```

### First-Time Facebook Authentication

**IMPORTANT:** The scraper requires a valid Facebook session.

1. **Enable headful mode** in `.env`:
```bash
FACEBOOK_SCRAPER_HEADLESS=false
```

2. **Start the backend**:
```bash
cd service
bun run dev
```

3. **Open the dashboard**:
```
http://localhost:3000/scout
```

4. **Click "Refresh Feed"** - A browser window will open

5. **Log in to Facebook** in that browser window

6. **Future scrapes** will use your saved session

---

## 📖 Usage

### View Feed Posts

1. Open http://localhost:3000/scout
2. Click "Refresh Feed" to scrape new posts
3. Filter by engagement metrics
4. Review high-engagement posts

### Generate Keywords (Optional)

1. Open http://localhost:3000
2. Enter Shopee product details
3. Click "Generate Keywords"
4. View generated keywords (for reference)

---

## 🔌 API Endpoints

### Feed Posts
```bash
# Get scraped posts
GET http://localhost:8080/api/posts

# Get high-engagement posts
GET http://localhost:8080/api/posts/high-engagement

# Get statistics
GET http://localhost:8080/api/posts/statistics

# Update post status
PATCH http://localhost:8080/api/posts/:id/status

# Delete post
DELETE http://localhost:8080/api/posts/:id
```

### Keywords
```bash
# Generate keywords
POST http://localhost:8080/api/keywords/generate

# Get history
GET http://localhost:8080/api/keywords/history

# Delete history
DELETE http://localhost:8080/api/keywords/:id
```

### Session
```bash
# Check Facebook session
GET http://localhost:8080/api/products/check-session
```

---

## ⚠️ Important Notes

### Facebook Authentication
- **Headful mode required** for first login
- **Session expires** after Facebook logout
- **Re-authenticate** by logging in again

### Security
⚠️ **Never commit Facebook cookies to git!**

⚠️ **Use a test account** for scraping, not your personal account

⚠️ **Facebook's Terms of Service** may prohibit automated scraping - use at your own risk

### Rate Limiting
- Max 10 requests per minute (configured in `.env`)
- Random delays between requests (2-5 seconds)
- Use headful mode for better stealth

---

## 🧪 Testing

### Backend Tests
```bash
cd service
bun test
```

### Frontend Tests
```bash
cd app
bun test
```

---

## 📊 Phase Roadmap

### ✅ Phase 1: Keyword Generator (COMPLETE)
- Keyword generation from Shopee products
- Multi-language support (EN/TH)
- Keyword history and management

### ✅ Phase 2: Post Scout (COMPLETE - REFACTORED)
- ~~Keyword-based search~~ ❌ Deprecated
- **Feed-based scraping** ✅ Current
- Engagement filtering
- Post dashboard

### 🔄 Phase 3: Engagement Specialist (PLANNED)
- Comment generation with AI
- Sentiment analysis
- Personalized responses
- Auto-posting (with safety)

---

## 🐛 Troubleshooting

### "Not found" when scraping
**Cause:** No valid Facebook session
**Solution:** Enable headful mode and log in to Facebook

### "Session expired"
**Cause:** Facebook cookies expired
**Solution:** Re-authenticate by logging in again

### No posts in dashboard
**Cause:** Engagement threshold too high
**Solution:** Lower minimum engagement filters

### Build errors
**Cause:** Missing dependencies
**Solution:** Run `bun install` in both directories

---

## 📚 Documentation

- **[AGENTS.md](./AGENTS.md)** - AI agents and architecture
- **[FACEBOOK_SETUP.md](./service/FACEBOOK_SETUP.md)** - Facebook authentication guide
- **[Tasks](./tasks/)** - Implementation specifications

---

## 🤝 Contributing

1. Read the task files in `/tasks/`
2. Follow the project conventions in `AGENTS.md`
3. Test thoroughly before submitting
4. No auto-commits - wait for user review

---

**Last Updated:** March 27, 2026
**Version:** 2.0 (Feed-Based Scraping)
**License:** MIT
