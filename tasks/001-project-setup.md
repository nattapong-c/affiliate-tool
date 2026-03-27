# Task 001: Project Setup & Configuration

## Overview
Set up the foundational project structure, dependencies, and configuration for the Facebook Automation project with focus on the Keyword Strategist agent.

## Type
- [ ] Backend
- [ ] Frontend
- [x] Database
- [x] Integration
- [ ] Testing
- [x] Documentation

## Priority
- [x] Critical (P0)
- [ ] High (P1)
- [ ] Medium (P2)
- [ ] Low (P3)

## Dependencies
- [ ] Depends on: None (foundational task)
- [x] Blocks: Task 002, Task 003, Task 004

## Requirements

### Functional Requirements
1. Initialize Bun project in `/service/` directory
2. Initialize NextJS project in `/app/` directory
3. Configure MongoDB connection
4. Set up environment variable management
5. Configure OpenAI API integration

### Technical Requirements
1. Use Bun as runtime for both backend and frontend
2. ElysiaJS for backend API framework
3. NextJS 14+ with App Router for frontend
4. MongoDB Atlas for database
5. dotenv for environment management

## Implementation Details

### Files to Create
- `service/package.json` - Backend dependencies
- `service/tsconfig.json` - TypeScript configuration
- `service/.env.example` - Environment variables template
- `app/package.json` - Frontend dependencies
- `app/tsconfig.json` - TypeScript configuration
- `app/.env.example` - Frontend environment template
- `.env` - Root environment file (gitignored)

### Files to Modify
- None (initial setup)

### Code Snippets
```json
// service/package.json
{
  "name": "facebook-automation-service",
  "version": "1.0.0",
  "scripts": {
    "dev": "bun run --watch src/index.ts",
    "start": "bun run src/index.ts",
    "test": "bun test"
  },
  "dependencies": {
    "elysia": "latest",
    "@elysiajs/cors": "latest",
    "@elysiajs/cron": "latest",
    "mongoose": "latest",
    "zod": "latest",
    "pino": "latest",
    "dotenv": "latest",
    "openai": "latest"
  },
  "devDependencies": {
    "@types/bun": "latest",
    "typescript": "latest"
  }
}
```

```env
# .env.example
# Database
MONGODB_URI=mongodb://localhost:27017/facebook-automation

# OpenAI
OPENAI_API_KEY=sk-your-api-key-here

# Server
PORT=8080
NODE_ENV=development

# Discord Webhook
DISCORD_WEBHOOK_URL=your-webhook-url
```

## Acceptance Criteria

### Must Have
- [ ] Service directory has valid package.json with all dependencies
- [ ] App directory has valid package.json with all dependencies
- [ ] TypeScript compiles without errors in both directories
- [ ] Environment variables are properly configured
- [ ] MongoDB connection string is configurable

### Should Have
- [ ] .env.example files document all required variables
- [ ] README.md files exist in both directories

## Testing Requirements

### Unit Tests
- [ ] N/A (setup task)

### Integration Tests
- [ ] `bun install` succeeds in service directory
- [ ] `bun install` succeeds in app directory
- [ ] TypeScript compilation succeeds: `bun run build`

### Manual Testing
- [ ] Verify all dependencies install without errors
- [ ] Verify environment variables load correctly

## Definition of Done
- [x] Code implemented
- [x] Tests passing
- [ ] Code reviewed
- [x] Documentation updated

## Notes
- This is a foundational task - all other tasks depend on this
- Ensure .env files are in .gitignore
- Use MongoDB Atlas free tier for development

## References
- Project spec: `AGENTS.md`
- Bun docs: https://bun.sh/docs
- ElysiaJS docs: https://elysiajs.com
- NextJS docs: https://nextjs.org/docs
