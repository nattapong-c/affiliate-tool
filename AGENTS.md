# AI Agents Definition

This project utilizes a multi-agent approach to handle the lifecycle of monitoring and engaging with Facebook posts for Shopee affiliate marketing.

## ⚠️ Breaking Changes (v2.0 - Feed-Based Scraping)

**As of Task 016-017, the project has been refactored to use feed-based scraping instead of keyword-based search.**

### What Changed:
- ❌ **REMOVED:** Keyword-based Facebook search scraping
- ❌ **REMOVED:** Product selection page (`/scout/products`)
- ❌ **REMOVED:** Manual scrape triggers from keyword history
- ✅ **NEW:** Scrapes posts directly from your Facebook feed (homepage timeline)
- ✅ **NEW:** Automatic filtering by engagement metrics (likes, comments, shares)
- ✅ **NEW:** Simplified UI focused on feed posts

### Why:
- More natural scraping behavior (less likely to be detected)
- No need to manage keywords for scraping
- Shows posts that Facebook's algorithm already considers relevant
- Simpler user workflow

---

## 1. Keyword Strategist (AI Agent)
**Role:** Analyzes product information and extracts core features, benefits, and target audience hooks.

**Responsibilities:**
- Generate high-relevance search keywords from Shopee product titles and descriptions.
- Categorize keywords into "Intent-based" (users looking for solutions) and "Topic-based" (users discussing related niches).
- Optimize keywords for Facebook's search algorithm.

**Tech:** OpenAI GPT-4o / GPT-4o-mini.

**Status:** ✅ **Still Available** - Keywords are generated for reference and future use, but **NOT used for scraping** anymore.

---

## 2. Post Scout (Feed Scraper & Filter Agent)
**Role:** Navigates Facebook homepage to scrape high-engagement posts from the user's feed.

**Responsibilities:**
- Navigate to Facebook homepage (`facebook.com/`) and authenticate with user session.
- Scroll through feed to load posts.
- Extract post content, author, timestamp, and engagement metrics (likes, shares, comments).
- Filter posts by minimum engagement thresholds (configurable).
- Filter out posts older than 1 month.
- Rank posts based on "Engagement Density" (total interactions / post age).
- Save posts to database for review.

**Tech:** Playwright (Stealth Mode), Bun, Elysia.

**Status:** ✅ **UPDATED** - Now scrapes from feed instead of keyword search.

---

## 3. Engagement Specialist (AI Agent)
**Role:** Crafts personalized, non-spammy comments that bridge the gap between the post content and the Shopee product.

**Responsibilities:**
- Analyze the sentiment and context of a Facebook post.
- Generate a helpful or relatable comment that naturally mentions the product.
- Ensure the tone matches the community (Facebook Page) culture.
- Provide a clear call-to-action (CTA) for the affiliate link.

**Tech:** OpenAI GPT-4o.

**Status:** ✅ **Unchanged** - Still in development for Phase 3.

---

# Architecture Overview

## Data Flow (v2.0 - Feed-Based)

```
┌─────────────────────────────────────────────────────────────┐
│                    User Workflow                            │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│  1. User logs into Facebook (headful browser)              │
│  2. Scraper navigates to facebook.com/ (feed)              │
│  3. Scraper scrolls and extracts posts from feed           │
│  4. Filters posts by engagement (likes/comments/shares)    │
│  5. Saves high-engagement posts to database                │
│  6. Displays posts in dashboard for review                 │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                    Future: Phase 3                          │
│  7. User selects post to engage with                       │
│  8. Engagement Specialist generates comment                │
│  9. User reviews and posts comment                         │
└─────────────────────────────────────────────────────────────┘
```

## Removed Features (v1.0 - Keyword-Based)

```
❌ Keyword-based Facebook search
❌ Product selection for scraping
❌ Manual scrape triggers from history
❌ Search routes: /api/search/*
❌ Product scraper routes: /api/products/:id/scrape
```

---

# Tech Stack

## Core Technologies

### Backend (Service)
- **Runtime:** Bun
- **Framework:** ElysiaJS
- **Database:** MongoDB + Mongoose
- **Browser Automation:** Playwright + playwright-extra + puppeteer-extra-plugin-stealth
- **AI:** OpenAI GPT-4o / GPT-4o-mini
- **Logging:** Pino
- **Validation:** Zod

### Frontend (App)
- **Framework:** NextJS 14+ (App Router)
- **Language:** TypeScript
- **UI Components:** Shadcn UI + Radix UI
- **Styling:** Tailwind CSS
- **Icons:** Lucide React
- **State Management:** React Query (TanStack Query)
- **HTTP Client:** Axios

### Infrastructure
- **Database:** MongoDB Atlas
- **Deployment:** Vercel (Frontend), Railway/Render (Backend)
- **Session Storage:** In-memory (browser cookies)

---

# Project Structure

```
facebook-automation/
├── service/                    # Backend (ElysiaJS)
│   ├── src/
│   │   ├── scrapers/
│   │   │   ├── feed-scraper.ts     # NEW: Feed scraper
│   │   │   └── facebook-scraper.ts # Facebook base scraper
│   │   ├── services/
│   │   │   ├── product-scraper-service.ts # Updated: feed scraping
│   │   │   └── keyword-strategist.ts      # Still exists (for keyword gen)
│   │   ├── models/
│   │   │   ├── scraped-post.ts   # Updated: removed keyword dependencies
│   │   │   └── keyword-history.ts # Still exists (for keyword storage)
│   │   ├── routes/
│   │   │   ├── product-scraper-routes.ts # Updated: removed search endpoints
│   │   │   └── keyword-routes.ts         # Still exists
│   │   ├── controllers/
│   │   ├── types/
│   │   ├── utils/
│   │   │   ├── engagement-calculator.ts  # Still exists
│   │   │   └── session-manager.ts        # Still exists
│   │   └── index.ts
│   ├── tests/
│   ├── .env.example
│   └── package.json
│
├── app/                        # Frontend (NextJS)
│   ├── src/
│   │   ├── app/
│   │   │   ├── scout/
│   │   │   │   ├── page.tsx          # Updated: feed posts only
│   │   │   │   └── products/         # ❌ REMOVED
│   │   │   └── page.tsx              # Updated: removed scrape from history
│   │   ├── components/
│   │   │   ├── post-*.tsx            # Updated: feed post display
│   │   │   ├── product-*.tsx         # ❌ REMOVED
│   │   │   ├── history-item.tsx      # Updated: removed scrape button
│   │   │   └── keyword-*.tsx         # Still exists (keyword display)
│   │   ├── hooks/
│   │   │   ├── use-feed-posts.ts     # NEW: feed posts hook
│   │   │   ├── use-product-scraper.ts # ❌ REMOVED
│   │   │   └── use-keywords.ts       # Still exists
│   │   └── lib/
│   │       ├── api.ts                # Updated: removed product scraper API
│   │       └── axios.ts              # Still exists
│   ├── .env.example
│   └── package.json
│
├── tasks/                      # Task specifications
│   ├── 001-007: Phase 1 (Keyword Generator) ✅
│   ├── 008-011: Phase 2 (Post Scout - OLD) ❌ Deprecated
│   ├── 012-015: Manual Selection & Enhancements ❌ Deprecated
│   └── 016-017: Feed-Based Scraping & Cleanup ✅ Current
│
└── docs/                       # Documentation
    ├── testing/
    ├── launch/
    └── FACEBOOK_SETUP.md       # Updated for feed scraping
```

---

# API Endpoints (v2.0)

## Active Endpoints

### Keyword Generation (Still Available)
```
POST   /api/keywords/generate      # Generate keywords from product
GET    /api/keywords/history       # Get keyword generation history
GET    /api/keywords/:id           # Get specific keyword generation
DELETE /api/keywords/:id           # Delete keyword generation
```

### Feed Scraping (NEW)
```
GET    /api/posts                  # Get scraped feed posts
GET    /api/posts/high-engagement  # Get high-engagement posts
GET    /api/posts/statistics       # Get engagement statistics
PATCH  /api/posts/:id/status       # Update post status
DELETE /api/posts/:id              # Delete post
GET    /api/posts/for-engagement   # Get posts ready for engagement
```

### Session Management
```
GET    /api/products/check-session # Check Facebook session status
```

## Removed Endpoints (v1.0)
```
❌ POST   /api/search/*                  # Keyword search
❌ POST   /api/products/:id/scrape       # Product-based scraping
❌ POST   /api/products/scrape-from-keywords # History scraping
❌ GET    /api/products                  # Product list
```

---

# Configuration

## Environment Variables

### Backend (.env)
```bash
# Database
MONGODB_URI=mongodb://localhost:27017/facebook-automation

# OpenAI
OPENAI_API_KEY=sk-your-api-key-here
OPENAI_MODEL=gpt-4o-mini
OPENAI_BASE_URL=https://api.openai.com/v1

# Server
PORT=8080
NODE_ENV=development

# Facebook Scraper (UPDATED)
FACEBOOK_SCRAPER_MAX_CONCURRENT=1
FACEBOOK_SCRAPER_HEADLESS=false  # Set to false for manual login
FACEBOOK_SCRAPER_TIMEOUT=60000

# Rate Limiting
RATE_LIMIT_MAX=10
RATE_LIMIT_WINDOW_MS=60000

# Cache
CACHE_TTL_MS=86400000
```

### Frontend (.env)
```bash
NEXT_PUBLIC_API_URL=http://localhost:8080
NEXT_PUBLIC_APP_NAME=Facebook Automation
```

---

# Setup Instructions

## Quick Start

### 1. Install Dependencies
```bash
# Backend
cd service
bun install

# Frontend
cd ../app
bun install
```

### 2. Install Playwright Browser
```bash
cd service
bunx playwright install chromium
```

### 3. Set Up Environment
```bash
# Copy environment files
cp .env.example .env

# Edit .env with your credentials
# IMPORTANT: Set FACEBOOK_SCRAPER_HEADLESS=false for first run
```

### 4. Start Servers
```bash
# Terminal 1 - Backend
cd service
bun run dev

# Terminal 2 - Frontend
cd app
bun run dev
```

### 5. Authenticate Facebook
1. Open http://localhost:3000/scout
2. Click "Refresh Feed"
3. A browser window will open
4. **Log in to Facebook** in that window
5. Future scrapes will use your saved session

### 6. Check Session Status
```bash
curl http://localhost:8080/api/products/check-session
```

---

# Facebook Scraping Setup

## Important: Authentication Required

The Facebook scraper requires a valid Facebook session to work.

### First-Time Setup

1. **Enable headful mode** in `.env`:
   ```bash
   FACEBOOK_SCRAPER_HEADLESS=false
   ```

2. **Restart the backend**:
   ```bash
   cd service
   bun run dev
   ```

3. **Trigger a feed scrape** from the dashboard

4. **Log in to Facebook** in the browser window that opens

5. **Future scrapes** will use your saved session

### Session Management

- Sessions are stored in browser cookies
- Session expires after Facebook logout or cookie clear
- Re-authenticate by logging in again when prompted

### Security Notes

⚠️ **Never commit Facebook cookies to git!**

⚠️ **Use a separate test account** for scraping, not your personal account

⚠️ **Facebook's Terms of Service** may prohibit automated scraping - use at your own risk

---

# Development Guidelines

## Code Conventions

### TypeScript
- Use strict mode
- Define interfaces for all types
- Use Zod for runtime validation

### Backend (ElysiaJS)
- One route per file in `/routes`
- Controllers for business logic
- Services for complex operations
- Pino for logging

### Frontend (NextJS)
- App Router structure
- React Query for data fetching
- Shadcn UI components
- Axios for API calls

## Testing

### Backend
```bash
cd service
bun test
```

### Frontend
```bash
cd app
bun test
```

## Git Workflow

1. **No auto-commits** - All commits require manual review
2. **Descriptive messages** - Follow conventional commits
3. **Task-based branches** - One branch per task/feature

---

# Phase Roadmap

## ✅ Phase 1: Keyword Generator (COMPLETE)
- Keyword generation from Shopee products
- Multi-language support (EN/TH)
- Keyword history and management
- Axios migration

## ✅ Phase 2: Post Scout (COMPLETE - REFACTORED)
- ~~Keyword-based search~~ ❌ Deprecated
- **Feed-based scraping** ✅ Current
- Engagement filtering
- Post dashboard

## 🔄 Phase 3: Engagement Specialist (PLANNED)
- Comment generation with AI
- Sentiment analysis
- Personalized responses
- Auto-posting (with safety)

---

# Troubleshooting

## Common Issues

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
**Solution:** Run `bun install` in both service and app directories

## Debug Mode

Enable verbose logging:
```bash
# Backend
DEBUG=* bun run dev

# Check screenshots
open service/tmp/search-*.png
```

## Get Help

1. Check backend logs for error messages
2. Check browser console for frontend errors
3. Review `FACEBOOK_SETUP.md` for scraping issues
4. Check task files for implementation details

---

**Last Updated:** March 27, 2026
**Version:** 2.0 (Feed-Based Scraping)
**Breaking Changes:** Yes - removed keyword-based scraping
