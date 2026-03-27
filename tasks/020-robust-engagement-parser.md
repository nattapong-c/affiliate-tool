# Task 020: Robust Engagement Parsing Service

## Overview
Implement a dedicated `EngagementParser` utility and service to robustly extract interaction counts (likes, comments, shares) from Facebook posts, handling multiple languages and formatting (e.g., "1.2K").

## Type
- [x] Backend
- [ ] Frontend
- [ ] Database
- [ ] Integration
- [ ] Testing
- [ ] Documentation

## Priority
- [x] Critical (P0)
- [ ] High (P1)
- [ ] Medium (P2)
- [ ] Low (P3)

## Dependencies
- [x] Depends on: Task 019
- [x] Blocks: Task 021

## Requirements

### Functional Requirements
1. Parse interaction counts from raw string labels (e.g., "See who reacted to this: 1.2K", "15 comments", "20 shares").
2. Support multi-language labels (English "Like", Thai "ถูกใจ").
3. Support numeric suffixes: "K" (1,000), "M" (1,000,000), "B" (1,000,000,000).
4. Handle cases with zero interactions (missing elements).
5. Extract total engagement across all reaction types (Like, Love, Haha, etc.).

### Technical Requirements
1. Create a new utility: `service/src/utils/engagement-parser.ts`.
2. Implement unit tests for the parser with various input scenarios.
3. Handle numeric formatting with commas (e.g., "1,234").

## Implementation Details

### Files to Create
- `service/src/utils/engagement-parser.ts` - Main parsing logic
- `service/src/tests/engagement-parser.test.ts` - Unit tests

### Files to Modify
- None

### Code Snippets
```typescript
export class EngagementParser {
  static parse(text: string): number {
    if (!text) return 0;
    // 1. Remove commas
    // 2. Look for numeric patterns (1.2K, 500, etc.)
    // 3. Apply multiplier for K, M, B
    // 4. Handle localized text labels
    // ...
  }
}
```

## Acceptance Criteria

### Must Have
- [ ] `EngagementParser.parse` correctly handles "1.2K" -> 1200.
- [ ] Correctly handles "1,500" -> 1500.
- [ ] Correctly handles Thai language count labels.
- [ ] Unit tests pass for all cases.

## Definition of Done
- [x] Code implemented
- [x] Tests passing
- [x] Code reviewed
- [x] Documentation updated

## Notes
- The parser should be independent of the scraping logic (pure function).
- Use regex for flexible pattern matching.
