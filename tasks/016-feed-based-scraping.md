# Task 016: Feed-Based Post Scraping - Remove Keyword Scraping

## Overview
Refactor the Facebook scraper to scrape posts from the user's Facebook feed instead of keyword-based search. Display high-engagement posts (high likes, shares, comments) in the web app. Remove all keyword-based scraping functionality and related UI.

## Type
- [x] Backend
- [x] Frontend
- [x] Database
- [x] Integration
- [ ] Testing
- [x] Documentation

## Priority
- [x] Critical (P0)
- [ ] High (P1)
- [ ] Medium (P2)
- [ ] Low (P3)

## Dependencies
- [x] Depends on: Task 008 (Post Scout Setup)
- [x] Blocks: All future scraping features

## Requirements

### Functional Requirements
1. Scrape posts from user's Facebook feed (homepage timeline)
2. Extract post content, author, timestamp, engagement metrics
3. Filter posts by engagement threshold (configurable likes/comments/shares)
4. Display scraped posts in dashboard with key information
5. Remove keyword-based search functionality
6. Remove /scout/products page
7. Remove "Scrape Now" buttons from history items
8. Remove unused API endpoints and code

### Technical Requirements
1. Update Facebook scraper to navigate to facebook.com/feed instead of search
2. Remove PostSearchScraper and related search functionality
3. Remove keyword history scrape functionality
4. Clean up database models (remove keyword dependencies from posts)
5. Update frontend to remove product selection UI
6. Remove unused API endpoints from routes
7. Update environment variables (remove keyword-related configs)
8. Update documentation

## Implementation Details

### Files to Create
- `service/src/scrapers/feed-scraper.ts` - New feed scraper
- `service/FACEBOOK_FEED_SETUP.md` - Feed scraping setup guide

### Files to Modify
**Backend:**
- `service/src/index.ts` - Remove search routes
- `service/src/routes/product-scraper-routes.ts` - Remove keyword endpoints
- `service/src/routes/search-routes.ts` - DELETE or gut content
- `service/src/scrapers/post-search.ts` - DELETE or replace with feed scraper
- `service/src/services/product-scraper-service.ts` - Simplify to feed scraping only
- `service/src/services/search-service.ts` - DELETE
- `service/src/models/scraped-post.ts` - Remove keyword fields
- `service/src/types/scraper.ts` - Remove search types
- `service/src/types/product-scraper.ts` - Simplify types
- `service/src/utils/search-query-builder.ts` - DELETE
- `service/tests/task-009-search.test.ts` - DELETE
- `service/tests/post-scout-setup.test.ts` - Update for feed scraping

**Frontend:**
- `app/src/app/scout/products/page.tsx` - DELETE
- `app/src/components/product-*.tsx` - DELETE all product components
- `app/src/components/history-item.tsx` - Remove scrape button
- `app/src/components/keyword-history.tsx` - Remove scrape functionality
- `app/src/app/page.tsx` - Remove scrape from history
- `app/src/app/scout/page.tsx` - Update to show feed posts only
- `app/src/lib/api.ts` - Remove product scraper and search APIs
- `app/src/hooks/use-product-scraper.ts` - DELETE
- `app/src/hooks/use-posts.ts` - Simplify
- `app/src/components/post-filters.tsx` - Remove product filters
- `app/src/components/post-stats.tsx` - Update stats display
- `app/src/components/post-table.tsx` - Update to show feed posts
- `app/src/components/keyword-preview.tsx` - Keep (for keyword display only)

### Code Snippets
```typescript
// service/src/scrapers/feed-scraper.ts
export class FeedScraper {
  async scrapeFeed(sessionId: string, options: FeedScrapeOptions) {
    const browserSession = await this.browserPool.getSession(sessionId);
    const { page } = browserSession;
    
    // Navigate to Facebook feed (homepage)
    await page.goto('https://www.facebook.com/', {
      waitUntil: 'networkidle',
      timeout: 60000,
    });
    
    // Wait for feed to load
    await page.waitForSelector('[data-pagelet="FeedUnit"], [role="article"]');
    
    // Scroll to load more posts
    await this.scrollAndLoad(page, options.scrollCount || 3);
    
    // Extract posts
    const posts = await this.extractFeedPosts(page);
    
    // Filter by engagement
    const filteredPosts = posts.filter(post => 
      post.engagement.likes >= options.minLikes &&
      post.engagement.comments >= options.minComments &&
      post.engagement.shares >= options.minShares
    );
    
    return filteredPosts;
  }
  
  private async extractFeedPosts(page: any) {
    return await page.evaluate(() => {
      const postElements = document.querySelectorAll('[data-pagelet="FeedUnit"], [role="article"]');
      const posts = [];
      
      postElements.forEach(el => {
        const content = el.querySelector('[data-pagelet="PostText"]')?.textContent || '';
        const author = el.querySelector('[data-pagelet="PageHeader"] a')?.textContent || 'Unknown';
        const timestamp = el.querySelector('abbr[data-utime]')?.getAttribute('data-utime');
        
        // Extract engagement
        const likes = parseInt(el.querySelector('[aria-label*="Like"]')?.textContent || '0');
        const comments = parseInt(el.querySelector('[aria-label*="Comment"]')?.textContent || '0');
        const shares = parseInt(el.querySelector('[aria-label*="Share"]')?.textContent || '0');
        
        posts.push({
          url: el.querySelector('a[href*="/posts/"]')?.href || '',
          content,
          author,
          timestamp: timestamp ? new Date(parseInt(timestamp) * 1000) : new Date(),
          engagement: { likes, comments, shares, total: likes + comments + shares }
        });
      });
      
      return posts;
    });
  }
}

// app/src/app/scout/page.tsx - Simplified
export default function ScoutPage() {
  const { posts, isLoading, refreshFeed } = useFeedPosts();
  
  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1>📰 Facebook Feed Posts</h1>
        <Button onClick={refreshFeed}>
          <Refresh className="h-4 w-4 mr-2" />
          Refresh Feed
        </Button>
      </div>
      
      <PostFilters filters={filters} onFilterChange={setFilters} />
      <PostTable posts={posts} isLoading={isLoading} />
    </div>
  );
}
```

## Acceptance Criteria

### Must Have
- [ ] Scraper navigates to Facebook feed (homepage)
- [ ] Extracts posts with engagement metrics
- [ ] Filters posts by minimum engagement (configurable)
- [ ] Displays posts in dashboard with: content, author, timestamp, likes, comments, shares
- [ ] /scout/products page removed
- [ ] Product selection components removed
- [ ] Scrape buttons removed from history
- [ ] Keyword search API endpoints removed
- [ ] No errors in console or backend logs

### Should Have
- [ ] Auto-scroll to load more posts
- [ ] Engagement threshold configuration in UI
- [ ] Last scrape timestamp display
- [ ] Manual refresh button
- [ ] Post engagement sorting (high to low)

## Testing Requirements

### Manual Testing
- [ ] Start backend with headful mode
- [ ] Log in to Facebook when browser opens
- [ ] Trigger feed scrape
- [ ] Verify posts appear in dashboard
- [ ] Verify engagement metrics are accurate
- [ ] Test engagement filters
- [ ] Verify no errors in console
- [ ] Test on mobile responsive

### Integration Tests
- [ ] Feed scraper extracts posts correctly
- [ ] Engagement filtering works
- [ ] Database saves posts correctly
- [ ] API returns filtered posts

## Definition of Done
- [ ] Code implemented
- [ ] Unused code removed
- [ ] Tests passing
- [ ] Code reviewed
- [ ] Documentation updated
- [ ] No console errors
- [ ] All pages functional

## Notes
- This is a breaking change - keyword scraping will no longer work
- Database schema changes may require migration
- Users will need to re-authenticate Facebook
- Consider keeping keyword generation for other purposes (just not for scraping)

## References
- Task 008: `/tasks/008-post-scout-setup.md` (to be replaced)
- Current scraper: `service/src/scrapers/post-search.ts`
- Facebook homepage: `https://www.facebook.com/`
