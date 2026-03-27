# Task 021: Scraper Logic Refactor

## Overview
Refactor the `FeedScraper` and related scraping logic to use the new `EngagementParser` and robust selectors identified in Task 019.

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
- [x] Depends on: Task 019, Task 020

## Requirements

### Functional Requirements
1. Update `FeedScraper.extractFeedPosts` to use the newly identified robust selectors.
2. Integrate `EngagementParser` for all interaction count extractions.
3. Ensure scraper can handle posts with 0 engagement without error.
4. Correctly extract post author, timestamp, and URL using revised selectors.

### Technical Requirements
1. Modify `service/src/scrapers/feed-scraper.ts`.
2. Ensure the `page.evaluate` script properly imports or replicates the `EngagementParser` logic (as it runs in the browser context).
3. Test with both English and Thai Facebook interfaces.

## Implementation Details

### Files to Create
- None

### Files to Modify
- `service/src/scrapers/feed-scraper.ts` - Refactor extraction logic.

### Code Snippets
```typescript
// Example refactored extraction
const likeText = el.querySelector(SELECTORS.LIKES_ROW)?.textContent;
const likes = EngagementParser.parse(likeText);
```

## Acceptance Criteria

### Must Have
- [ ] Scraper extracts correct engagement counts for posts with interactions.
- [ ] Scraper extracts 0 for posts with no interactions.
- [ ] Correctly identifies posts on both English and Thai interfaces.
- [ ] No regression in other fields (content, author, url).

## Definition of Done
- [x] Code implemented
- [x] Tests passing (engagement parsing unit tests)
- [x] Code reviewed
- [x] Documentation updated

## Notes
- `page.evaluate` cannot directly access external TS classes. The parsing logic may need to be injected or defined within the evaluation script.
