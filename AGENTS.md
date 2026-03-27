# AI Agents Definition

This project utilizes a multi-agent approach to handle the lifecycle of monitoring and engaging with Facebook posts for Shopee affiliate marketing.

## 1. Keyword Strategist (AI Agent)
**Role:** Analyzes product information and extracts core features, benefits, and target audience hooks.
**Responsibilities:**
- Generate high-relevance search keywords from Shopee product titles and descriptions.
- Categorize keywords into "Intent-based" (users looking for solutions) and "Topic-based" (users discussing related niches).
- Optimize keywords for Facebook's search algorithm.
**Tech:** OpenAI GPT-4o / GPT-4o-mini.

## 2. Post Scout (Scraper & Filter Agent)
**Role:** Navigates Facebook to identify high-engagement posts within the user's liked pages.
**Responsibilities:**
- Search for posts using generated keywords.
- Extract post metrics: Likes, Shares, Comments, and Timestamp.
- Filter out posts older than 1 month.
- Rank posts based on "Engagement Density" (total interactions / post age).
**Tech:** Playwright (Stealth Mode), Bun, Elysia.

## 3. Engagement Specialist (AI Agent)
**Role:** Crafts personalized, non-spammy comments that bridge the gap between the post content and the Shopee product.
**Responsibilities:**
- Analyze the sentiment and context of a Facebook post.
- Generate a helpful or relatable comment that naturally mentions the product.
- Ensure the tone matches the community (Facebook Page) culture.
- Provide a clear call-to-action (CTA) for the affiliate link.
**Tech:** OpenAI GPT-4o.

---

# Recommended Additional Tools

To complement the core tech stack (Bun, Elysia, MongoDB, NextJS), the following tools are recommended for this specific use case:

### 1. Browser Automation & Extraction
- **Playwright + playwright-extra + puppeteer-extra-plugin-stealth**: Essential for interacting with Facebook while minimizing the risk of account flagging. It allows the tool to run in a "headful" or "stealth headless" mode using your existing session cookies.
- **Cheerio**: For fast parsing of HTML content once Playwright has loaded the page.

### 2. Task Scheduling
- **elysia-cron**: A native plugin for Elysia to handle periodic tasks (e.g., checking for new posts every 4 hours).

### 3. Data Validation & Modeling
- **Mongoose**: The standard ODM for MongoDB, providing type safety and schema validation in the `service` layer.
- **Zod**: For end-to-end type safety between the NextJS frontend and Elysia backend.

### 4. UI & Aesthetics
- **Tailwind CSS**: For rapid, modern UI development in the NextJS app.
- **Shadcn UI + Lucide React**: A collection of high-quality components and icons to make the monitoring dashboard look professional.
- **React Query (TanStack Query)**: For efficient data fetching, caching, and synchronization between the frontend and the backend.

### 5. Utilities
- **Pino**: A very low overhead Node.js/Bun logger for tracking scraping successes and failures.
- **Dotenv**: For managing OpenAI API keys and MongoDB credentials securely.
