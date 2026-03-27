# Facebook Automation - Backend Service

ElysiaJS backend service for Facebook Automation project.

## 🚀 Quick Start

```bash
# Install dependencies
bun install

# Copy environment file
cp .env.example .env

# Start development server
bun run dev
```

Server runs on http://localhost:8080

## 📁 Structure

```
src/
├── services/     # Business logic (Keyword Strategist, etc.)
├── controllers/  # Request handlers
├── models/       # Mongoose schemas
├── routes/       # API route definitions
├── middleware/   # Error handling, logging
├── types/        # TypeScript types & Zod schemas
├── utils/        # Utilities (prompts, rate limiting)
├── cache/        # Cache implementation
└── index.ts      # Entry point
```

## 🛠️ Tech Stack

- **Runtime**: Bun
- **Framework**: ElysiaJS
- **Database**: MongoDB + Mongoose
- **AI**: OpenAI GPT-4o
- **Validation**: Zod
- **Logging**: Pino

## 📝 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/health` | Health check |
| POST | `/api/keywords/generate` | Generate keywords |
| GET | `/api/keywords/history` | Get generation history |
| GET | `/api/keywords/:id` | Get specific result |
| DELETE | `/api/keywords/:id/cache` | Clear cache |

## 🧪 Testing

```bash
# Run all tests
bun test

# Run with watch mode
bun test --watch
```

## 📖 Documentation

See main [README.md](../README.md) for project overview.
