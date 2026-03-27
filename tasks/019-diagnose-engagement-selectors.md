# Task 019: Diagnose Engagement Selector Failure

## Overview
Investigate and identify the current CSS selectors for Facebook engagement counts (likes, comments, shares) to fix the issue where engagement is scraped as 0.

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
- [ ] Depends on: None
- [x] Blocks: Task 020, Task 021

## Requirements

### Functional Requirements
1. Identify CSS selectors for the "engagement row" (where total likes/reactions are shown).
2. Identify CSS selectors for the "comment/share counts" (usually next to the comment/share buttons).
3. Verify selectors across at least 3 different post types (standard, photo, shared).
4. Verify selectors when Facebook is in different languages (English and Thai).

### Technical Requirements
1. Use Playwright in headful mode (`FACEBOOK_SCRAPER_HEADLESS=false`) for investigation.
2. Document the findings (selectors and sample DOM structure) in a temporary markdown file or Task 020's implementation details.

## Implementation Details

### Files to Modify
- `service/src/scrapers/feed-scraper.ts` - (Investigation only, no code change yet)

### Investigation Steps
1. Start the backend in development mode with `FACEBOOK_SCRAPER_HEADLESS=false`.
2. Trigger a feed scrape and pause the browser execution.
3. Inspect the DOM to find the exact elements containing interaction counts.
4. Note the `aria-label` values and CSS classes for these elements.

## Acceptance Criteria

### Must Have
- [ ] Verified CSS selectors for Likes/Reactions.
- [ ] Verified CSS selectors for Comment counts.
- [ ] Verified CSS selectors for Share counts.
- [ ] Documented the DOM structure of the engagement row.

## Definition of Done
- [x] Selectors identified (using aria-label and localized text)
- [x] Selectors documented in scrapers
- [x] Ready for implementation in Task 020

## Notes
- Facebook often uses "aria-label" for screen readers that contains the count (e.g., "See who reacted to this").
- Comment and share counts might be hidden if there are 0 interactions.
