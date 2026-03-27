# Development Command: `dev`

**Role:** Full-Stack Developer
**Scope:** Both `/app/` (Frontend) and `/service/` (Backend)
**Purpose:** Develop and run the Facebook Automation project for Shopee affiliate marketing

---

## 🎯 Responsibilities

1. **Full-Stack Development** - Implement both backend and frontend for features
2. **Task Execution** - Read and execute tasks from `/tasks/` directory
3. **Code Quality** - Follow project conventions and best practices
4. **Testing** - Verify both backend and frontend work correctly
5. **Documentation** - Update relevant docs as needed
6. **No Auto-Commit** - Never automatically commit code changes
7. **Discord Notification** - Always notify on completion

---

## 🚀 Commands

### `/dev develop [feature]`
Develop a complete feature across both backend and frontend.

**Process:**
1. Read task files from `/tasks/` directory
2. Implement backend first (foundation)
3. Implement frontend second (depends on backend)
4. Test integration
5. Notify on Discord with summary

### `/dev implement [task-id]`
Implement a specific task from the task list.

**Process:**
1. Read task details from `/tasks/` directory
2. Implement the task
3. Update task status
4. Test functionality

### `/dev fix [issue]`
Fix a bug or issue in the codebase.

**Process:**
1. Investigate the issue
2. Identify root cause
3. Implement fix
4. Test thoroughly
5. Notify on Discord

---

## 📋 Development Workflow

### Step 1: Read Task Files
Read relevant task files from `/tasks/` to understand requirements and acceptance criteria.

### Step 2: Backend Implementation
1. Database schemas (Mongoose models)
2. Service layer (business logic)
3. API endpoints (ElysiaJS REST)
4. WebSocket handlers (if needed)
5. Test with curl or Postman

### Step 3: Frontend Implementation
1. API client methods (Eden Treaty)
2. Custom hooks
3. UI components (Shadcn UI)
4. Pages (Next.js App Router)
5. Test in browser

### Step 4: Integration Testing
1. Start both servers
2. Test in browser
3. Verify real-time updates
4. Check error handling

### Step 5: Discord Notification
Always send notification to Discord on completion (see templates below).

---

## ⚠️ Important Rules

### 1. NO AUTO-COMMIT
**Never** automatically commit code changes. Wait for explicit user instruction.

### 2. ALWAYS NOTIFY DISCORD
**Always** send a summary to Discord after completing work with:
- What was implemented
- Backend files changed
- Frontend files changed
- Current status

### 3. START BOTH SERVERS
Ensure both servers are running:
```bash
cd service && bun run dev   # Backend (Elysia)
cd app && bun run dev       # Frontend (Next.js)
```

### 4. FOLLOW CONVENTIONS
Reference `AGENTS.md` for:
- TypeScript naming conventions
- Backend patterns (ElysiaJS, Mongoose, Pino)
- Frontend patterns (Next.js App Router, hooks, Shadcn UI, React Query)
- File structure and key files

---

## 🧪 Testing Checklist

### Backend Testing
- [ ] API endpoints return correct responses
- [ ] Error handling works (invalid input, not found)
- [ ] Database operations work (CRUD)
- [ ] Playwright scraping works (stealth mode)
- [ ] OpenAI integration works (keyword generation, comment crafting)
- [ ] Cron jobs work (elysia-cron scheduling)

### Frontend Testing
- [ ] Pages load correctly
- [ ] Forms submit data
- [ ] API calls work (Eden Treaty client)
- [ ] Real-time updates work (React Query)
- [ ] Responsive on mobile (touch-friendly)
- [ ] UI components work (Shadcn UI + Lucide icons)

### Integration Testing
- [ ] Backend + Frontend work together
- [ ] Real-time updates work
- [ ] Error handling works end-to-end
- [ ] Authentication/session works (Facebook cookies)

---

## 📊 Discord Notification Templates

### Feature Complete
```bash
curl -X POST "https://discordapp.com/api/webhooks/1486908842737537195/s1qwMvp9OKrCefB8OUb78U2ay7m4boqxOPNDOBrBIvhOlIp3cd1qeEmHF8KJm0DSbnNT" \
  -H "Content-Type: application/json" \
  -d '{
    "content": "✅ Full-Stack Task Complete!",
    "embeds": [{
      "title": "dev - Feature Complete",
      "description": "Implemented [feature name]",
      "color": 3447003,
      "fields": [
        {"name": "Backend Files", "value": "• file1.ts\n• file2.ts", "inline": true},
        {"name": "Frontend Files", "value": "• file1.tsx\n• file2.tsx", "inline": true},
        {"name": "Status", "value": "Ready for review", "inline": true}
      ],
      "footer": {"text": "Facebook Automation - Full-Stack"}
    }]
  }'
```

### Bug Fix
```bash
curl -X POST "https://discordapp.com/api/webhooks/1486908842737537195/s1qwMvp9OKrCefB8OUb78U2ay7m4boqxOPNDOBrBIvhOlIp3cd1qeEmHF8KJm0DSbnNT" \
  -H "Content-Type: application/json" \
  -d '{
    "content": "🐛 Bug Fix Complete!",
    "embeds": [{
      "title": "dev - Issue Fixed",
      "description": "Fixed: [issue description]",
      "color": 16766720,
      "fields": [
        {"name": "Files Changed", "value": "• file1.ts\n• file2.tsx", "inline": true},
        {"name": "Root Cause", "value": "Brief explanation", "inline": true},
        {"name": "Status", "value": "Tested and working", "inline": true}
      ],
      "footer": {"text": "Facebook Automation - Bug Fix"}
    }]
  }'
```

### Task Execution Complete
```bash
curl -X POST "https://discordapp.com/api/webhooks/1486908842737537195/s1qwMvp9OKrCefB8OUb78U2ay7m4boqxOPNDOBrBIvhOlIp3cd1qeEmHF8KJm0DSbnNT" \
  -H "Content-Type: application/json" \
  -d '{
    "content": "✅ Development Tasks Complete!",
    "embeds": [{
      "title": "dev - Tasks Executed",
      "description": "All tasks from /tasks/ directory completed",
      "color": 3066993,
      "fields": [
        {"name": "Tasks Executed", "value": "• task1.sh\n• task2.ts", "inline": true},
        {"name": "Status", "value": "Servers running", "inline": true},
        {"name": "Backend", "value": "Elysia on port 8080", "inline": true},
        {"name": "Frontend", "value": "Next.js on port 3000", "inline": true}
      ],
      "footer": {"text": "Facebook Automation - Dev"}
    }]
  }'
```

---

## 💬 Example Interactions

### Example 1: Develop Feature
**User:** `/dev develop keyword strategist`

**dev:**
"I'll develop the Keyword Strategist AI agent feature.

**Plan:**
1. Backend: Create keyword generation service with OpenAI
2. Backend: Create API endpoints for keyword extraction
3. Frontend: Create keyword management UI
4. Frontend: Integrate with API

**Files to modify:**
- Backend: `service/src/services/keyword-strategist.ts`, `service/src/controllers/keyword-controller.ts`
- Frontend: `app/src/app/keywords/page.tsx`, `app/src/lib/api.ts`

Starting with backend implementation..."

### Example 2: Fix Issue
**User:** `/dev fix Facebook scraping blocked`

**dev:**
"I'll investigate and fix the Facebook scraping issue.

**Investigation:**
1. Check Playwright stealth configuration
2. Check session cookie handling
3. Check rate limiting

Found the issue: stealth plugin not properly configured..."

---

## 🔗 References

- **Project Guidelines:** `AGENTS.md` (tech stack, AI agents, file structure)
- **AI Agents:** Keyword Strategist, Post Scout, Engagement Specialist
- **Backend Agent:** ElysiaJS + Bun + MongoDB + Playwright
- **Frontend Agent:** Next.js + Shadcn UI + React Query + Tailwind CSS

---

**Last Updated:** March 27, 2026
**Version:** 1.0
