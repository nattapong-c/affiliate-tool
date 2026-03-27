import { describe, it, expect, mock } from 'bun:test';
import { FeedScraper } from '../src/scrapers/feed-scraper';
import { ScrapedPostModel } from '../src/models/scraped-post';

// Mock ScrapedPostModel
mock.module('../src/models/scraped-post', () => ({
  ScrapedPostModel: {
    findOneAndUpdate: mock(() => Promise.resolve({})),
  },
}));

describe('FeedScraper Validation', () => {
  it('should skip posts with empty URLs in savePosts', async () => {
    const scraper = new FeedScraper({} as any);
    const mockPosts: any[] = [
      {
        url: 'https://facebook.com/post1',
        content: 'Valid post with URL',
        author: 'Author 1',
        timestamp: new Date(),
        engagement: { likes: 10, comments: 5, shares: 2, total: 17 },
        reactions: { like: 10, love: 0, haha: 0, wow: 0, sad: 0, angry: 0 },
        scrapedAt: new Date(),
      },
      {
        url: '', // Invalid empty URL
        content: 'Invalid post without URL',
        author: 'Author 2',
        timestamp: new Date(),
        engagement: { likes: 5, comments: 2, shares: 1, total: 8 },
        reactions: { like: 5, love: 0, haha: 0, wow: 0, sad: 0, angry: 0 },
        scrapedAt: new Date(),
      }
    ];

    const savedCount = await scraper.savePosts(mockPosts);
    
    // Should only save the one with a valid URL
    expect(savedCount).toBe(1);
    expect(ScrapedPostModel.findOneAndUpdate).toHaveBeenCalledTimes(1);
  });
});
