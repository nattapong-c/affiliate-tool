# Keyword Generator - Test Plan

## Overview

This document outlines the testing strategy for the Keyword Generator feature (Phase 1).

## Test Environment

- **Backend**: `http://localhost:8080`
- **Frontend**: `http://localhost:3000`
- **Database**: MongoDB (local or Atlas)
- **OpenAI**: Real API (use test account for development)

## Test Categories

### 1. Unit Tests

#### Backend Unit Tests
- [ ] Keyword strategist service
  - Keyword generation logic
  - Prompt template formatting
  - Response parsing
- [ ] Rate limiter
  - Request counting
  - Window expiration
  - Remaining requests calculation
- [ ] Cache implementation
  - Cache hit/miss
  - TTL expiration
  - Cache cleanup

#### Frontend Unit Tests
- [ ] API client functions
- [ ] Custom hooks (useKeywords)
- [ ] Utility functions
- [ ] Component rendering

### 2. Integration Tests

#### API Integration Tests
- [ ] POST /api/keywords/generate
  - Valid request returns keywords
  - Invalid request returns 400
  - Rate limit returns 429
- [ ] GET /api/keywords/history
  - Returns list of generations
  - Pagination works
- [ ] GET /api/keywords/:id
  - Returns specific generation
  - 404 for non-existent ID
- [ ] DELETE /api/keywords/:id
  - Deletes generation
  - 404 for non-existent ID
- [ ] GET /api/health
  - Returns service status

#### Database Integration Tests
- [ ] MongoDB connection
- [ ] Keyword history persistence
- [ ] Query performance

#### Frontend-Backend Integration
- [ ] Form submission triggers API call
- [ ] Results display correctly
- [ ] History loads and displays
- [ ] Error handling shows user-friendly messages

### 3. End-to-End Tests

#### User Flow Tests
- [ ] Complete keyword generation flow
  1. Navigate to keywords page
  2. Enter product title and description
  3. Submit form
  4. Wait for generation
  5. Verify results display
  6. Copy keyword to clipboard
  7. Export to CSV
- [ ] History management
  1. View generation history
  2. Delete old generation
  3. Verify deletion

### 4. Performance Tests

#### Response Time Targets
- [ ] API response < 5 seconds (excluding OpenAI)
- [ ] Frontend render < 100ms
- [ ] Database query < 100ms

#### Load Tests
- [ ] 10 concurrent users
- [ ] 100 requests per minute
- [ ] Cache hit rate > 80%

### 5. Manual Tests

#### Browser Compatibility
- [ ] Chrome (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)
- [ ] Edge (latest)

#### Mobile Responsiveness
- [ ] iPhone (Safari)
- [ ] Android (Chrome)
- [ ] Tablet view

#### Accessibility
- [ ] Keyboard navigation
- [ ] Screen reader compatibility
- [ ] Color contrast

## Test Execution

### Run All Tests

```bash
# Backend tests
cd service
bun test

# Frontend tests
cd app
bun test

# Integration tests
cd tests
bun test integration
```

### Manual Testing Checklist

```bash
# Start backend
cd service && bun run dev

# Start frontend (in another terminal)
cd app && bun run dev

# Test in browser
open http://localhost:3000
```

## Success Criteria

| Category | Target | Status |
|----------|--------|--------|
| Unit Tests | 100% pass | ⬜ |
| Integration Tests | 95%+ pass | ⬜ |
| E2E Tests | Critical flows pass | ⬜ |
| Response Time | < 5 seconds | ⬜ |
| Mobile | Responsive | ⬜ |
| Accessibility | WCAG 2.1 AA | ⬜ |

## Known Issues

| Issue | Severity | Workaround | Status |
|-------|----------|------------|--------|
| None yet | - | - | - |

## Test Data

### Sample Products

```json
{
  "productTitle": "Wireless Bluetooth Earbuds TWS",
  "productDescription": "High quality wireless earbuds with active noise cancellation, 30-hour battery life, IPX7 waterproof. Perfect for sports, commuting, and daily use.",
  "category": "Electronics"
}
```

## Rollback Plan

If tests fail in production:

1. Revert to previous deployment
2. Investigate root cause
3. Fix and re-test
4. Re-deploy

---

**Last Updated**: March 27, 2026
**Version**: 1.0
