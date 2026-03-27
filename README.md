# Facebook Automation

AI-powered Facebook post monitoring and engagement tool for Shopee affiliate marketing.

## 🎯 Overview

This project automates the process of finding relevant Facebook posts and engaging with them using AI-generated comments that naturally incorporate Shopee affiliate products.

## 🤖 AI Agents

1. **Keyword Strategist** - Generates high-relevance keywords from Shopee product data
2. **Post Scout** - Finds high-engagement Facebook posts using generated keywords
3. **Engagement Specialist** - Crafts personalized, non-spammy comments

## 🛠️ Tech Stack

### Backend (Service)
- **Runtime**: Bun
- **Framework**: ElysiaJS
- **Database**: MongoDB + Mongoose
- **AI**: OpenAI GPT-4o
- **Browser Automation**: Playwright (stealth mode)
- **Scheduling**: elysia-cron
- **Validation**: Zod
- **Logging**: Pino

### Frontend (App)
- **Framework**: NextJS 14+ (App Router)
- **UI**: Shadcn UI + Tailwind CSS
- **State**: React Query (TanStack Query)
- **Icons**: Lucide React
- **Validation**: Zod

## 📁 Project Structure

```
facebook-automation/
├── service/              # Backend (ElysiaJS)
│   ├── src/
│   │   ├── services/     # Business logic
│   │   ├── controllers/  # Request handlers
│   │   ├── models/       # Mongoose schemas
│   │   ├── routes/       # API routes
│   │   ├── middleware/   # Express middleware
│   │   ├── types/        # TypeScript types
│   │   ├── utils/        # Utilities
│   │   ├── cache/        # Cache implementation
│   │   └── index.ts      # Entry point
│   ├── package.json
│   └── tsconfig.json
├── app/                  # Frontend (NextJS)
│   ├── src/
│   │   ├── components/   # React components
│   │   ├── hooks/        # Custom hooks
│   │   ├── lib/          # Utilities & API client
│   │   ├── types/        # TypeScript types
│   │   └── app/          # NextJS pages
│   ├── package.json
│   └── tsconfig.json
├── tasks/                # Task specifications
├── docs/                 # Documentation
├── .env.example          # Environment template
└── README.md
```

## 🚀 Getting Started

### Prerequisites
- Bun (latest)
- Node.js 18+
- MongoDB (local or Atlas)
- OpenAI API key

### Installation

1. **Clone the repository**
```bash
cd facebook-automation
```

2. **Set up environment variables**
```bash
cp .env.example .env
# Edit .env with your values (especially OPENAI_API_KEY)
```

**Using OpenRouter (optional):**
```bash
# In your .env file:
OPENAI_BASE_URL=https://openrouter.ai/api/v1
OPENAI_API_KEY=<your-openrouter-api-key>
OPENAI_MODEL=google/gemma-2-9b-it:free
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

5. **Start MongoDB** (if running locally)
```bash
mongod --dbpath /data/db
```

### Development

**Start backend:**
```bash
cd service
bun run dev
```
Backend runs on http://localhost:8080

**Start frontend:**
```bash
cd app
bun run dev
```
Frontend runs on http://localhost:3000

## 📋 Current Phase

### Phase 1: Keyword Generator ✅
- [x] Project setup
- [x] Keyword Strategist service
- [x] API endpoints
- [x] Frontend UI
- [ ] Integration testing

### Phase 2: Post Scout (Planned)
- Facebook post scraping
- Engagement filtering
- Post ranking

### Phase 3: Engagement Specialist (Planned)
- Comment generation
- Auto-posting (with safety)
- Response tracking

## 🧪 Testing

**Backend tests:**
```bash
cd service
bun test
```

**Frontend tests:**
```bash
cd app
bun test
```

## 📖 Documentation

- [AGENTS.md](./AGENTS.md) - AI agent definitions
- [Tasks](./tasks/) - Implementation tasks
- [Docs](./docs/) - Additional documentation

## ⚠️ Important Notes

1. **Facebook Automation**: Be careful with automation on Facebook. Always follow their Terms of Service.
2. **Rate Limiting**: Built-in rate limiting protects against API abuse.
3. **Session Management**: Use your own Facebook session cookies responsibly.
4. **OpenAI Costs**: Monitor your OpenAI API usage to avoid unexpected charges.

## 📄 License

MIT

## 🤝 Contributing

1. Read the task files in `/tasks/`
2. Follow the project conventions in `AGENTS.md`
3. Test thoroughly before submitting
4. No auto-commits - wait for user review

---

**Last Updated**: March 27, 2026
