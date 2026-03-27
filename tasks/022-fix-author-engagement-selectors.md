# Task 022: Fix Author & Engagement Selectors

## Overview
Fix the issue where post authors are scraped as "Unknown" and comment/share counts are often 0 even when they exist.

## Type
- [x] Backend
- [ ] Frontend
- [ ] Database
- [ ] Integration
- [ ] Testing
- [ ] Documentation

## Priority
- [x] High (P1)
- [ ] Medium (P2)
- [ ] Low (P3)

## Dependencies
- [x] Depends on: Task 021 (Scraper Refactor)

## Requirements

### Functional Requirements
1. Correctly extract the author's name from feed posts.
2. Correctly extract comment counts when visible.
3. Correctly extract share counts when visible.

### Technical Requirements
1. Identify more robust selectors for the author (e.g., looking for `h2` or `h3` tags inside the post header).
2. Refine the engagement row selectors to ensure they capture the text content of the comment/share buttons accurately.

## Implementation Details

### Files to Modify
- `service/src/scrapers/feed-scraper.ts`

### Revised Author Selectors to Try
- `[data-pagelet="PostHeader"] h2 a`
- `[data-pagelet="PostHeader"] h3 a`
- `h2 span a[role="link"]`

## Acceptance Criteria

### Must Have
- [ ] Author names are no longer "Unknown" for standard posts.
- [ ] Comment counts match the values seen on the screen.
- [ ] Share counts match the values seen on the screen.

## Definition of Done
- [x] Code implemented
- [x] Manual verification via headful mode (verified selectors)
- [x] Code reviewed
