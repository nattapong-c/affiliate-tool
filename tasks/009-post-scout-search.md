# Task 009: Post Scout - Keyword-Based Post Search

## Overview
Implement Facebook post search functionality using generated keywords from Phase 1 to find relevant posts.

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
- [x] Depends on: Task 008 (Post Scout Setup)
- [x] Depends on: Task 002 (Keyword Strategist)
- [x] Blocks: Task 010 (Post Filtering)

## Requirements

### Functional Requirements
1. Search Facebook posts using keywords from Phase 1
2. Search within user's liked pages only
3. Filter posts by date (last 1 month)
4. Extract post URLs for detailed scraping
5. Support multiple keyword searches per session
6. Track search history and results

### Technical Requirements
1. Use Facebook's internal search API via Playwright
2. Implement search query optimization
3. Handle pagination for search results
4. Store search results in MongoDB
5. Implement search rate limiting (avoid bans)
6. Log all search activities

## Implementation Details

### Files to Create
- `service/src/scrapers/post-search.ts` - Search functionality
- `service/src/services/post-search-service.ts` - Business logic
- `service/src/models/search-history.ts` - Search tracking
- `service/src/utils/search-query-builder.ts` - Query optimization
- `service/src/controllers/search-controller.ts` - API endpoints
- `service/src/routes/search-routes.ts` - Search routes

### Files to Modify
- `service/src/index.ts` - Add search routes
- `service/package.json` - Add any new dependencies

### Code Snippets
```typescript
// service/src/types/post.ts
export interface SearchQuery {
  keywords: string[];
  pages?: string[]; // Liked pages to search
  dateFrom: Date;
  dateTo: Date;
  maxResults: number;
}

export interface SearchResult {
  query: SearchQuery;
  posts: Array<{
    url: string;
    snippet: string;
    relevanceScore: number;
  }>;
  totalFound: number;
  searchedAt: Date;
}

// service/src/utils/search-query-builder.ts
export class SearchQueryBuilder {
  buildSearchQuery(keywords: string[], pageName?: string): string {
    // Facebook search query format
    const baseQuery = keywords.join(' OR ');
    return pageName ? `${baseQuery} ${pageName}` : baseQuery;
  }

  buildDateFilter(daysBack: number = 30): string {
    const date = new Date();
    date.setDate(date.getDate() - daysBack);
    return date.toISOString();
  }
}
```

```typescript
// service/src/scrapers/post-search.ts
import { BrowserPool } from './browser-pool';
import { SearchResult, SearchQuery } from '../types/post';

export class PostSearchScraper {
  private browserPool: BrowserPool;

  constructor(browserPool: BrowserPool) {
    this.browserPool = browserPool;
  }

  async searchPosts(query: SearchQuery, sessionId: string): Promise<SearchResult> {
    const browser = await this.browserPool.getBrowser(sessionId);
    const page = await browser.newPage();

    try {
      // Navigate to Facebook search
      const searchUrl = this.buildSearchUrl(query);
      await page.goto(searchUrl, { waitUntil: 'networkidle' });

      // Wait for results
      await page.waitForSelector('[data-pagelet="FeedUnit"]', { timeout: 10000 });

      // Extract post URLs
      const postUrls = await page.evaluate(() => {
        const postElements = document.querySelectorAll('[data-pagelet="FeedUnit"]');
        return Array.from(postElements).map(el => {
          const link = el.querySelector('a[href*="/posts/"]');
          return link?.href || '';
        }).filter(Boolean);
      });

      return {
        query,
        posts: postUrls.map(url => ({
          url,
          snippet: '',
          relevanceScore: 0
        })),
        totalFound: postUrls.length,
        searchedAt: new Date()
      };
    } finally {
      await page.close();
    }
  }

  private buildSearchUrl(query: SearchQuery): string {
    const q = query.keywords.join(' OR ');
    return `https://www.facebook.com/search/posts/?q=${encodeURIComponent(q)}`;
  }
}
```

## Acceptance Criteria

### Must Have
- [ ] Search accepts keywords from Phase 1
- [ ] Searches within liked pages
- [ ] Filters posts by date (30 days)
- [ ] Extracts post URLs successfully
- [ ] Stores search results in database
- [ ] Rate limiting prevents bans

### Should Have
- [ ] Search result pagination
- [ ] Relevance scoring for results
- [ ] Search history tracking
- [ ] Export search results

## Testing Requirements

### Unit Tests
- [ ] Test search query builder
- [ ] Test URL extraction logic
- [ ] Test date filtering

### Integration Tests
- [ ] Test actual Facebook search
- [ ] Test with multiple keywords
- [ ] Test pagination

### Manual Testing
- [ ] Verify search results are relevant
- [ ] Test with various keyword combinations
- [ ] Verify date filtering works

## Definition of Done
- [ ] Code implemented
- [ ] Tests passing
- [ ] Code reviewed
- [ ] Documentation updated

## Notes
- Facebook search is limited - may need to use graph search
- Liked pages search requires authentication
- Consider using Facebook's mobile site for easier scraping

## References
- Task 008: `/tasks/008-post-scout-setup.md`
- Task 002: `/tasks/002-keyword-strategist-service.md`
