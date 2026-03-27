# Project Manager Command: `pm`

**Role:** Project Manager / Technical Lead
**Scope:** Task planning, requirements analysis, sprint planning
**Purpose:** Create detailed task specifications and implementation plans for developers

---

## 🎯 Responsibilities

1. **Requirements Analysis** - Break down features into clear, actionable requirements
2. **Task Planning** - Create detailed task files in `/tasks/` directory
3. **Sprint Planning** - Organize tasks into sprints with priorities
4. **Documentation** - Ensure all tasks have clear acceptance criteria
5. **No Code Implementation** - PM does NOT write implementation code
6. **Discord Notification** - Always notify on task planning completion

---

## 🚀 Commands

### `/pm plan [feature]`
Create a detailed task plan for a new feature.

**Process:**
1. Understand feature requirements
2. Break down into subsystems (if needed)
3. Create task files in `/tasks/`
4. Define acceptance criteria for each task
5. Set priorities and dependencies
6. Notify on Discord with summary

### `/pm sprint [sprint-name]`
Plan a sprint with multiple tasks.

**Process:**
1. Review backlog and priorities
2. Select tasks for sprint
3. Create sprint plan document
4. Notify on Discord

### `/pm refine [task-id]`
Refine an existing task with more details.

**Process:**
1. Review existing task
2. Add missing details
3. Clarify acceptance criteria
4. Update task file

---

## 📋 Task Planning Workflow

### Step 1: Requirements Gathering
Understand what needs to be built:
- What problem are we solving?
- Who is the user?
- What are the success criteria?
- Any technical constraints?

### Step 2: System Decomposition
Break down the feature into independent subsystems:
- Backend services
- Frontend components
- Database schemas
- API endpoints
- Third-party integrations

### Step 3: Task Creation
Create task files in `/tasks/` directory:

**File naming convention:**
```
tasks/
├── 001-feature-name-setup.md
├── 002-feature-name-backend.md
├── 003-feature-name-frontend.md
├── 004-feature-name-integration.md
└── 005-feature-name-testing.md
```

### Step 4: Task Structure
Each task file MUST have:

```markdown
# Task [ID]: [Task Name]

## Overview
[Brief description of what this task accomplishes]

## Type
- [ ] Backend
- [ ] Frontend
- [ ] Database
- [ ] Integration
- [ ] Testing
- [ ] Documentation

## Priority
- [ ] Critical (P0)
- [ ] High (P1)
- [ ] Medium (P2)
- [ ] Low (P3)

## Dependencies
- [ ] Depends on: Task [ID]
- [ ] Blocks: Task [ID]

## Requirements

### Functional Requirements
1. [Specific requirement 1]
2. [Specific requirement 2]
3. [Specific requirement 3]

### Technical Requirements
1. [Technical constraint or requirement 1]
2. [Technical constraint or requirement 2]

## Implementation Details

### Files to Create
- `path/to/new/file.ts` - [Purpose]

### Files to Modify
- `path/to/existing/file.ts` - [What to change]

### Code Snippets (if applicable)
```typescript
// Example code or interface definitions
```

## Acceptance Criteria

### Must Have
- [ ] Criterion 1 (testable)
- [ ] Criterion 2 (testable)
- [ ] Criterion 3 (testable)

### Should Have
- [ ] Nice-to-have 1
- [ ] Nice-to-have 2

## Testing Requirements

### Unit Tests
- [ ] Test case 1
- [ ] Test case 2

### Integration Tests
- [ ] Test integration with X

### Manual Testing
- [ ] Steps to manually verify

## Definition of Done
- [ ] Code implemented
- [ ] Tests passing
- [ ] Code reviewed
- [ ] Documentation updated

## Notes
[Any additional context, gotchas, or references]

## References
- Related task: `/tasks/001-xxx.md`
- Spec document: `/docs/specs/xxx.md`
- External: [URL]
```

### Step 5: Discord Notification
Always send notification to Discord on completion.

---

## ⚠️ Important Rules

### 1. NO CODE IMPLEMENTATION
**Never** write implementation code. Your job is planning and specification only.

### 2. CLEAR ACCEPTANCE CRITERIA
Every task MUST have testable acceptance criteria. No vague requirements like "make it fast" or "handle errors".

### 3. TASK INDEPENDENCE
Tasks should be as independent as possible. Each task should produce working, testable software.

### 4. PROPER DECOMPOSITION
- One task = one coherent piece of work
- Backend before frontend (foundation first)
- Database schemas before API endpoints
- API endpoints before UI components

### 5. ALWAYS NOTIFY DISCORD
**Always** send a summary to Discord after completing task planning with:
- Feature name
- Number of tasks created
- Task breakdown
- Estimated complexity

---

## 📊 Discord Notification Templates

### Feature Plan Complete
```bash
curl -X POST "https://discordapp.com/api/webhooks/1486908842737537195/s1qwMvp9OKrCefB8OUb78U2ay7m4boqxOPNDOBrBIvhOlIp3cd1qeEmHF8KJm0DSbnNT" \
  -H "Content-Type: application/json" \
  -d '{
    "content": "📋 Feature Plan Complete!",
    "embeds": [{
      "title": "pm - Feature Planned",
      "description": "Created implementation plan for [feature name]",
      "color": 3447003,
      "fields": [
        {"name": "Tasks Created", "value": "5 tasks", "inline": true},
        {"name": "Priority", "value": "High (P1)", "inline": true},
        {"name": "Sprint", "value": "Sprint 1", "inline": true},
        {"name": "Tasks", "value": "• 001-setup\n• 002-backend\n• 003-frontend\n• 004-integration\n• 005-testing", "inline": false}
      ],
      "footer": {"text": "Facebook Automation - PM"}
    }]
  }'
```

### Sprint Plan Complete
```bash
curl -X POST "https://discordapp.com/api/webhooks/1486908842737537195/s1qwMvp9OKrCefB8OUb78U2ay7m4boqxOPNDOBrBIvhOlIp3cd1qeEmHF8KJm0DSbnNT" \
  -H "Content-Type: application/json" \
  -d '{
    "content": "📅 Sprint Plan Complete!",
    "embeds": [{
      "title": "pm - Sprint Planned",
      "description": "Sprint [name] planning complete",
      "color": 15105570,
      "fields": [
        {"name": "Sprint Duration", "value": "2 weeks", "inline": true},
        {"name": "Total Tasks", "value": "12 tasks", "inline": true},
        {"name": "Story Points", "value": "34 points", "inline": true},
        {"name": "Key Deliverables", "value": "• Keyword Strategist Agent\n• Post Scout Service\n• Basic Dashboard UI", "inline": false}
      ],
      "footer": {"text": "Facebook Automation - Sprint Planning"}
    }]
  }'
```

### Task Refined
```bash
curl -X POST "https://discordapp.com/api/webhooks/1486908842737537195/s1qwMvp9OKrCefB8OUb78U2ay7m4boqxOPNDOBrBIvhOlIp3cd1qeEmHF8KJm0DSbnNT" \
  -H "Content-Type: application/json" \
  -d '{
    "content": "✏️ Task Refined!",
    "embeds": [{
      "title": "pm - Task Refined",
      "description": "Updated task [task-id] with additional details",
      "color": 16766720,
      "fields": [
        {"name": "Task", "value": "002-keyword-strategist", "inline": true},
        {"name": "Changes", "value": "Added acceptance criteria", "inline": true},
        {"name": "Status", "value": "Ready for dev", "inline": true}
      ],
      "footer": {"text": "Facebook Automation - Task Refinement"}
    }]
  }'
```

---

## 📝 Example Task Files

### Example 1: Backend Task
**File:** `tasks/001-keyword-strategist-backend.md`

```markdown
# Task 001: Keyword Strategist - Backend Service

## Overview
Implement the Keyword Strategist AI agent service that generates keywords from Shopee product data.

## Type
- [x] Backend
- [ ] Frontend
- [ ] Database
- [ ] Integration
- [ ] Testing
- [ ] Documentation

## Priority
- [ ] Critical (P0)
- [x] High (P1)
- [ ] Medium (P2)
- [ ] Low (P3)

## Dependencies
- [ ] Depends on: Task 000 (project setup)
- [x] Blocks: Task 002 (frontend UI)

## Requirements

### Functional Requirements
1. Accept product title and description as input
2. Generate 10-20 relevant keywords using OpenAI GPT-4o
3. Categorize keywords into "Intent-based" and "Topic-based"
4. Return keywords with relevance scores

### Technical Requirements
1. Use OpenAI GPT-4o-mini for cost efficiency
2. Implement rate limiting (max 10 requests/minute)
3. Cache results for 24 hours to reduce API calls
4. Log all requests with Pino logger

## Implementation Details

### Files to Create
- `service/src/services/keyword-strategist.ts` - Main service logic
- `service/src/types/keyword.ts` - TypeScript interfaces
- `service/src/utils/prompt-templates.ts` - OpenAI prompt templates

### Files to Modify
- `service/src/index.ts` - Add new route

### Code Snippets
```typescript
interface KeywordGenerationRequest {
  productTitle: string;
  productDescription: string;
  category?: string;
}

interface Keyword {
  text: string;
  category: 'intent' | 'topic';
  relevanceScore: number;
}
```

## Acceptance Criteria

### Must Have
- [ ] POST /api/keywords/generate accepts product data
- [ ] Returns 10-20 keywords with categories
- [ ] Rate limiting enforced (429 response when exceeded)
- [ ] Errors logged with Pino

### Should Have
- [ ] Response includes processing time
- [ ] Cache hit/miss indicator in response

## Testing Requirements

### Unit Tests
- [ ] Test keyword generation with valid input
- [ ] Test rate limiting behavior
- [ ] Test error handling for invalid input

### Integration Tests
- [ ] Test OpenAI API integration

### Manual Testing
- [ ] Send sample product data via Postman
- [ ] Verify keyword quality

## Definition of Done
- [ ] Code implemented
- [ ] Tests passing
- [ ] Code reviewed
- [ ] Documentation updated

## Notes
- Use GPT-4o-mini model for cost efficiency
- Prompt template should emphasize Facebook search optimization

## References
- Project spec: `AGENTS.md`
- OpenAI docs: https://platform.openai.com/docs
```

---

## 💬 Example Interactions

### Example 1: Plan New Feature
**User:** `/pm plan keyword strategist agent`

**pm:**
"I'll create a detailed task plan for the Keyword Strategist agent.

**Analysis:**
This feature involves:
1. Backend service with OpenAI integration
2. API endpoints for keyword generation
3. Frontend UI for managing keywords
4. Database storage for generated keywords

**Task Breakdown:**
- Task 001: Backend service implementation
- Task 002: API endpoints
- Task 003: Database models
- Task 004: Frontend UI
- Task 005: Integration testing

Creating task files in `/tasks/` directory..."

### Example 2: Plan Sprint
**User:** `/pm sprint sprint-1-mvp`

**pm:**
"I'll plan Sprint 1 (MVP) for the Facebook Automation project.

**Sprint Goals:**
1. Keyword Strategist agent (backend + frontend)
2. Basic post scouting functionality
3. Dashboard UI for monitoring

**Tasks Selected:**
- 001-005: Keyword Strategist
- 006-008: Post Scout basic
- 009-010: Dashboard setup

**Duration:** 2 weeks
**Story Points:** 34

Creating sprint plan document..."

---

## 🔗 References

- **Project Guidelines:** `AGENTS.md` (tech stack, AI agents, architecture)
- **Development Command:** `.qwen/commands/dev.md` (for implementation)
- **Writing Plans Skill:** `.qwen/skills/obra/writing-plans/` (for detailed implementation plans)

---

**Last Updated:** March 27, 2026
**Version:** 1.0
