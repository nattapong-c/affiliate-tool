# Task 005: Integration Testing & Launch

## Overview
Perform end-to-end integration testing for the Keyword Generator feature and prepare for production launch.

## Type
- [ ] Backend
- [ ] Frontend
- [ ] Database
- [x] Integration
- [x] Testing
- [ ] Documentation

## Priority
- [x] High (P1)
- [ ] Critical (P0)
- [ ] Medium (P2)
- [ ] Low (P3)

## Dependencies
- [x] Depends on: Task 001, 002, 003, 004
- [ ] Blocks: Phase 2 (Post Scout)

## Requirements

### Functional Requirements
1. Test complete user flow from form submission to keyword display
2. Verify API endpoints work with frontend
3. Test database persistence
4. Verify error handling across the stack
5. Performance testing (response times)
6. Load testing (concurrent users)

### Technical Requirements
1. Write integration tests for critical paths
2. Set up test environment
3. Create test data fixtures
4. Document testing procedures
5. Create launch checklist

## Implementation Details

### Files to Create
- `service/tests/keyword-integration.test.ts` - Integration tests
- `app/src/__tests__/keyword-flow.test.tsx` - Frontend integration tests
- `tests/fixtures/sample-products.ts` - Test data
- `tests/scripts/load-test.sh` - Load testing script
- `docs/testing/KEYWORD_GENERATOR_TEST_PLAN.md` - Test plan document
- `docs/launch/LAUNCH_CHECKLIST.md` - Launch checklist

### Files to Modify
- None (testing only)

### Code Snippets
```typescript
// service/tests/keyword-integration.test.ts
import { describe, it, expect, beforeAll, afterAll } from 'bun:test';
import { KeywordStrategist } from '../src/services/keyword-strategist';
import { KeywordHistoryModel } from '../src/models/keyword-history';
import mongoose from 'mongoose';

describe('Keyword Generator Integration', () => {
  let strategist: KeywordStrategist;

  beforeAll(async () => {
    // Connect to test database
    await mongoose.connect('mongodb://localhost:27017/facebook-automation-test');
    strategist = new KeywordStrategist(process.env.OPENAI_API_KEY!);
  });

  afterAll(async () => {
    await mongoose.connection.dropDatabase();
    await mongoose.disconnect();
  });

  it('should generate keywords from product data', async () => {
    const request = {
      productTitle: 'Wireless Bluetooth Earbuds TWS',
      productDescription: 'High quality wireless earbuds with noise cancellation...',
      category: 'Electronics'
    };

    const result = await strategist.generateKeywords(request);

    expect(result.keywords).toHaveLength(10);
    expect(result.keywords[0]).toHaveProperty('text');
    expect(result.keywords[0]).toHaveProperty('category');
    expect(result.keywords[0]).toHaveProperty('relevanceScore');
  });

  it('should save generation history to database', async () => {
    const request = {
      productTitle: 'Test Product',
      productDescription: 'Test Description',
      category: 'Test'
    };

    await strategist.generateKeywords(request);

    const history = await KeywordHistoryModel.findOne({ productTitle: request.productTitle });
    expect(history).toBeTruthy();
    expect(history?.keywords.length).toBeGreaterThan(0);
  });

  it('should return cached results on second request', async () => {
    const request = {
      productTitle: 'Cached Product',
      productDescription: 'Same Description',
      category: 'Test'
    };

    // First request (not cached)
    const result1 = await strategist.generateKeywords(request);
    expect(result1.cacheHit).toBe(false);

    // Second request (should be cached)
    const result2 = await strategist.generateKeywords(request);
    expect(result2.cacheHit).toBe(true);
  });
});
```

```typescript
// app/src/__tests__/keyword-flow.test.tsx
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { KeywordsPage } from '@/app/keywords/page';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: false }
  }
});

function renderWithProviders(component: React.ReactElement) {
  return render(
    <QueryClientProvider client={queryClient}>
      {component}
    </QueryClientProvider>
  );
}

describe('Keyword Generator Flow', () => {
  it('should display form and submit successfully', async () => {
    renderWithProviders(<KeywordsPage />);

    // Check form is visible
    expect(screen.getByText('Generate Keywords')).toBeInTheDocument();
    expect(screen.getByLabelText(/Product Title/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Product Description/i)).toBeInTheDocument();

    // Fill form
    fireEvent.change(screen.getByLabelText(/Product Title/i), {
      target: { value: 'Test Wireless Earbuds' }
    });
    fireEvent.change(screen.getByLabelText(/Product Description/i), {
      target: { value: 'High quality wireless earbuds with noise cancellation...' }
    });

    // Submit
    fireEvent.click(screen.getByRole('button', { name: /Generate Keywords/i }));

    // Check loading state
    expect(screen.getByText(/Generating/i)).toBeInTheDocument();

    // Wait for results
    await waitFor(() => {
      expect(screen.getByText(/Generated Keywords/i)).toBeInTheDocument();
    });
  });

  it('should show error on invalid input', async () => {
    renderWithProviders(<KeywordsPage />);

    // Submit empty form
    const submitButton = screen.getByRole('button', { name: /Generate Keywords/i });
    expect(submitButton).toBeDisabled();
  });

  it('should display keyword history', async () => {
    renderWithProviders(<KeywordsPage />);

    // Switch to history tab
    fireEvent.click(screen.getByRole('tab', { name: 'History' }));

    // Wait for history to load
    await waitFor(() => {
      expect(screen.getByText(/History/i)).toBeInTheDocument();
    });
  });
});
```

```bash
# tests/scripts/load-test.sh
#!/bin/bash

# Load testing script for Keyword Generator API
# Requires: wrk or ab (Apache Bench)

BASE_URL="http://localhost:8080"
ENDPOINT="/api/keywords/generate"
CONCURRENT_USERS=10
DURATION="30s"

echo "Starting load test..."
echo "Target: ${BASE_URL}${ENDPOINT}"
echo "Concurrent users: ${CONCURRENT_USERS}"
echo "Duration: ${DURATION}"

# Using wrk
wrk -t4 -c${CONCURRENT_USERS} -d${DURATION} \
  -H "Content-Type: application/json" \
  -d '{"productTitle":"Test Product","productDescription":"Test description for load testing"}' \
  ${BASE_URL}${ENDPOINT}

# Alternative with Apache Bench
# ab -n 100 -c ${CONCURRENT_USERS} \
#   -H "Content-Type: application/json" \
#   -p tests/fixtures/sample-product.json \
#   ${BASE_URL}${ENDPOINT}

echo "Load test complete!"
```

```markdown
# docs/testing/KEYWORD_GENERATOR_TEST_PLAN.md

## Keyword Generator - Test Plan

### Overview
This document outlines the testing strategy for the Keyword Generator feature.

### Test Environment
- **Backend**: `http://localhost:8080`
- **Frontend**: `http://localhost:3000`
- **Database**: MongoDB (test instance)
- **OpenAI**: Mocked for unit tests, real for integration

### Test Categories

#### 1. Unit Tests
- Keyword strategist service
- Rate limiter
- Cache implementation
- Prompt templates

#### 2. Integration Tests
- API endpoints
- Database operations
- Frontend-backend integration
- OpenAI API integration

#### 3. End-to-End Tests
- Complete user flow
- Form submission
- Results display
- History management

#### 4. Performance Tests
- Response times (< 5s target)
- Concurrent users (10+ target)
- Cache hit rate (> 80% target)

#### 5. Manual Tests
- Mobile responsiveness
- Browser compatibility
- Accessibility

### Test Execution

**Run all tests:**
```bash
# Backend
cd service && bun test

# Frontend
cd app && bun test

# Integration
bun test tests/integration
```

### Success Criteria
- All unit tests pass (100%)
- All integration tests pass (95%+)
- Response time < 5 seconds
- No critical bugs
- Mobile responsive

### Known Limitations
- OpenAI API calls are rate-limited
- Load tests should not run in production
```

```markdown
# docs/launch/LAUNCH_CHECKLIST.md

## Keyword Generator - Launch Checklist

### Pre-Launch

#### Code Quality
- [ ] All tests passing
- [ ] Code reviewed
- [ ] No TypeScript errors
- [ ] Linting passes
- [ ] No console errors

#### Backend
- [ ] Environment variables configured
- [ ] MongoDB connection working
- [ ] OpenAI API key configured
- [ ] Rate limiting enabled
- [ ] Error handling tested
- [ ] Logging configured

#### Frontend
- [ ] API endpoints configured
- [ ] Error handling implemented
- [ ] Loading states working
- [ ] Mobile responsive
- [ ] Cross-browser tested

#### Documentation
- [ ] README updated
- [ ] API documentation complete
- [ ] User guide created
- [ ] Troubleshooting guide added

### Launch

#### Deployment
- [ ] Backend deployed
- [ ] Frontend deployed
- [ ] Database migrations run
- [ ] Environment variables set in production
- [ ] Health checks passing

#### Monitoring
- [ ] Logging enabled
- [ ] Error tracking configured (Sentry)
- [ ] Performance monitoring enabled
- [ ] Alerts configured

### Post-Launch

#### Verification
- [ ] Smoke tests pass in production
- [ ] Real user flow tested
- [ ] Performance metrics acceptable
- [ ] No errors in logs

#### Communication
- [ ] Team notified
- [ ] Discord announcement sent
- [ ] Documentation published

### Rollback Plan
If issues occur:
1. Revert to previous deployment
2. Investigate root cause
3. Fix and re-test
4. Re-deploy

---

**Launch Date**: [Date]
**Launched By**: [Name]
**Status**: ✅ Complete / ❌ Issues
```

## Acceptance Criteria

### Must Have
- [ ] All integration tests pass
- [ ] Performance tests meet targets (< 5s response)
- [ ] Test plan document complete
- [ ] Launch checklist complete
- [ ] No critical bugs

### Should Have
- [ ] Load testing completed
- [ ] Browser compatibility tested
- [ ] Mobile testing completed
- [ ] Accessibility check done

## Testing Requirements

### Integration Tests
- [ ] Full API flow test
- [ ] Database persistence test
- [ ] Cache functionality test
- [ ] Error handling test

### Frontend Tests
- [ ] Form submission test
- [ ] Results display test
- [ ] History loading test
- [ ] Copy to clipboard test

### Performance Tests
- [ ] Response time < 5 seconds
- [ ] 10+ concurrent users
- [ ] Cache hit rate > 80%

### Manual Tests
- [ ] Mobile responsive
- [ ] Chrome, Firefox, Safari
- [ ] Error scenarios
- [ ] Edge cases

## Definition of Done
- [x] Code implemented
- [x] Tests passing
- [ ] Code reviewed
- [x] Documentation updated

## Notes
- Run load tests in isolated environment
- Monitor OpenAI API usage during testing
- Document any issues found

## References
- Task 001-004: Previous tasks
- Project spec: `AGENTS.md`
