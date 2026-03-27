# Task 023: Extract Detailed Reactions (Backend)

## Overview
Update the post model and scraper to extract and store the individual reaction counts (Love, Haha, Wow, Sad, Angry) in addition to the total Like count.

## Type
- [x] Backend
- [ ] Frontend
- [x] Database
- [ ] Integration
- [ ] Testing
- [ ] Documentation

## Priority
- [ ] Critical (P0)
- [x] High (P1)
- [ ] Medium (P2)
- [ ] Low (P3)

## Dependencies
- [x] Depends on: Task 021 (Scraper Refactor)

## Requirements

### Functional Requirements
1. Extract individual counts for each reaction type (Like, Love, Haha, Wow, Sad, Angry).
2. Store these counts in the `ScrapedPost` database model.
3. Update the `FeedScraper` to find the breakdown in the post's interaction summary.

### Technical Requirements
1. Update `service/src/models/scraped-post.ts` to include a `reactions` object.
2. Update `service/src/scrapers/feed-scraper.ts` with logic to find the reaction summary.
3. Update `service/src/scrapers/post-detail-scraper.ts` to also extract detailed reactions.

## Implementation Details

### Files to Modify
- `service/src/models/scraped-post.ts` - New schema fields
- `service/src/scrapers/feed-scraper.ts` - Extraction logic
- `service/src/scrapers/post-detail-scraper.ts` - Detail extraction logic
- `service/src/types/scraper.ts` - Update types for FeedPost/PostDetail

### Code Snippets
```typescript
reactions: {
  like: number;
  love: number;
  haha: number;
  wow: number;
  sad: number;
  angry: number;
}
```

## Acceptance Criteria

### Must Have
- [ ] Reaction breakdown is extracted for posts with multiple reaction types.
- [ ] Data is stored correctly in MongoDB.
- [ ] API returns the breakdown in the post object.

## Definition of Done
- [x] Database schema updated
- [x] Scrapers updated
- [x] API verified via Postman
