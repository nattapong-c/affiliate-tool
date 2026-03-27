# Task 010: Post Scout - Post Filtering & Engagement Metrics

## Overview
Implement post filtering logic to extract engagement metrics (likes, comments, shares) and rank posts by engagement density.

## Type
- [x] Backend
- [ ] Frontend
- [x] Database
- [ ] Integration
- [ ] Testing
- [ ] Documentation

## Priority
- [x] High (P1)
- [ ] Critical (P0)
- [ ] Medium (P2)
- [ ] Low (P3)

## Dependencies
- [x] Depends on: Task 009 (Post Search)
- [x] Blocks: Task 011 (Post Scout API)

## Requirements

### Functional Requirements
1. Scrape detailed post information from URLs
2. Extract engagement metrics (likes, comments, shares)
3. Calculate engagement density score
4. Filter posts older than 1 month
5. Rank posts by engagement score
6. Store filtered posts in database

### Technical Requirements
1. Use Playwright for detailed post scraping
2. Implement engagement density algorithm
3. Handle different post types (text, image, video)
4. Implement retry logic for failed scrapes
5. Cache scraped post data
6. Index posts for efficient queries

## Implementation Details

### Files to Create
- `service/src/scrapers/post-detail-scraper.ts` - Detailed scraping
- `service/src/services/post-filter-service.ts` - Filtering logic
- `service/src/models/scraped-post.ts` - Post schema
- `service/src/utils/engagement-calculator.ts` - Scoring algorithm
- `service/src/controllers/post-controller.ts` - Post API
- `service/src/routes/post-routes.ts` - Post routes

### Files to Modify
- `service/src/index.ts` - Add post routes
- `service/src/models/keyword-history.ts` - Link posts to keywords

### Code Snippets
```typescript
// service/src/models/scraped-post.ts
import mongoose, { Document, Schema } from 'mongoose';

export interface ScrapedPostDocument extends Document {
  url: string;
  postId: string;
  content: string;
  author: {
    name: string;
    profileUrl: string;
  };
  timestamp: Date;
  engagement: {
    likes: number;
    comments: number;
    shares: number;
    total: number;
  };
  engagementDensity: number;
  images: string[];
  keywords: string[];
  language: 'en' | 'th';
  scrapedAt: Date;
  status: 'new' | 'processed' | 'engaged' | 'skipped';
}

const ScrapedPostSchema = new Schema({
  url: { type: String, required: true, unique: true },
  postId: { type: String, required: true, index: true },
  content: { type: String, required: true },
  author: {
    name: String,
    profileUrl: String
  },
  timestamp: { type: Date, required: true, index: true },
  engagement: {
    likes: Number,
    comments: Number,
    shares: Number,
    total: Number
  },
  engagementDensity: { type: Number, index: true },
  images: [String],
  keywords: [String],
  language: { type: String, enum: ['en', 'th'], default: 'en' },
  scrapedAt: { type: Date, default: Date.now },
  status: { 
    type: String, 
    enum: ['new', 'processed', 'engaged', 'skipped'],
    default: 'new'
  }
});

export const ScrapedPostModel = mongoose.model<ScrapedPostDocument>(
  'ScrapedPost',
  ScrapedPostSchema
);
```

```typescript
// service/src/utils/engagement-calculator.ts
export class EngagementCalculator {
  /**
   * Calculate engagement density score
   * Formula: (likes + comments*2 + shares*3) / postAgeInHours
   * Higher weight for comments and shares as they indicate stronger engagement
   */
  static calculateDensity(
    likes: number,
    comments: number,
    shares: number,
    postTimestamp: Date
  ): number {
    const totalEngagement = likes + (comments * 2) + (shares * 3);
    const ageInHours = (Date.now() - postTimestamp.getTime()) / (1000 * 60 * 60);
    
    // Avoid division by zero for very recent posts
    const normalizedAge = Math.max(ageInHours, 1);
    
    return totalEngagement / normalizedAge;
  }

  /**
   * Rank posts by engagement density
   */
  static rankPosts(posts: Array<{ engagementDensity: number }>) {
    return posts.sort((a, b) => b.engagementDensity - a.engagementDensity);
  }
}
```

```typescript
// service/src/scrapers/post-detail-scraper.ts
export class PostDetailScraper {
  async scrapePostDetail(url: string, sessionId: string) {
    const browser = await this.browserPool.getBrowser(sessionId);
    const page = await browser.newPage();

    try {
      await page.goto(url, { waitUntil: 'networkidle' });

      // Extract post content
      const content = await page.evaluate(() => {
        const postElement = document.querySelector('[data-pagelet="PostText"]');
        return postElement?.textContent || '';
      });

      // Extract engagement metrics
      const engagement = await page.evaluate(() => {
        const likeElements = document.querySelectorAll('[aria-label*="Like"]');
        const commentElements = document.querySelectorAll('[aria-label*="Comment"]');
        const shareElements = document.querySelectorAll('[aria-label*="Share"]');

        return {
          likes: this.parseCount(likeElements[0]?.textContent),
          comments: this.parseCount(commentElements[0]?.textContent),
          shares: this.parseCount(shareElements[0]?.textContent)
        };
      });

      // Extract timestamp
      const timestamp = await page.evaluate(() => {
        const timeElement = document.querySelector('abbr[data-utime]');
        return timeElement?.getAttribute('data-utime');
      });

      return {
        url,
        content,
        engagement,
        timestamp: new Date(parseInt(timestamp) * 1000)
      };
    } finally {
      await page.close();
    }
  }

  private parseCount(text?: string): number {
    if (!text) return 0;
    const match = text.match(/[\d,.]+/);
    if (!match) return 0;
    return parseInt(match[0].replace(/,/g, ''));
  }
}
```

## Acceptance Criteria

### Must Have
- [ ] Scrape post content successfully
- [ ] Extract likes, comments, shares
- [ ] Calculate engagement density
- [ ] Filter posts older than 30 days
- [ ] Rank posts by engagement score
- [ ] Store posts in MongoDB

### Should Have
- [ ] Handle different post types
- [ ] Extract images from posts
- [ ] Detect post language
- [ ] Retry failed scrapes

## Testing Requirements

### Unit Tests
- [ ] Test engagement density calculation
- [ ] Test post content extraction
- [ ] Test metric parsing

### Integration Tests
- [ ] Test full post scraping flow
- [ ] Test filtering logic
- [ ] Test ranking algorithm

### Manual Testing
- [ ] Verify engagement metrics accuracy
- [ ] Test with various post types
- [ ] Verify filtering works correctly

## Definition of Done
- [ ] Code implemented
- [ ] Tests passing
- [ ] Code reviewed
- [ ] Documentation updated

## Notes
- Facebook changes HTML structure frequently - use resilient selectors
- Some posts may be private or deleted - handle 404s
- Engagement metrics may be abbreviated (1K, 1M) - parse correctly

## References
- Task 009: `/tasks/009-post-scout-search.md`
