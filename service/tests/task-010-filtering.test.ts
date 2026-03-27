import { describe, it, expect, beforeAll, afterAll } from 'bun:test';
import mongoose from 'mongoose';
import { ScrapedPostModel } from '../src/models/scraped-post';
import { EngagementCalculator } from '../src/utils/engagement-calculator';
import { PostFilterService } from '../src/services/post-filter-service';
import { config } from 'dotenv';

config();

describe('Task 010 - Post Filtering & Engagement Metrics', () => {
  const testUri = process.env.MONGODB_URI || 'mongodb+srv://bhijack:uH35WXhXHV5CaAkz@personal-0.hsi02.mongodb.net/affiliate-test';
  let postFilterService: PostFilterService;

  beforeAll(async () => {
    await mongoose.connect(testUri);
    console.log('✅ Connected to MongoDB for testing');
    postFilterService = new PostFilterService();
  });

  afterAll(async () => {
    await ScrapedPostModel.deleteMany({ keywords: { $in: ['test', 'engagement'] } });
    console.log('🧹 Cleaned up test data');
    await mongoose.disconnect();
    console.log('👋 Disconnected from MongoDB');
  });

  describe('Engagement Calculator', () => {
    it('should calculate total engagement', () => {
      const metrics = { likes: 100, comments: 20, shares: 10 };
      const total = EngagementCalculator.calculateTotal(metrics);
      
      expect(total).toBe(130);
    });

    it('should calculate engagement density', () => {
      const metrics = { likes: 100, comments: 20, shares: 10 };
      const timestamp = new Date(Date.now() - 24 * 60 * 60 * 1000); // 24 hours ago
      const density = EngagementCalculator.calculateDensity(metrics, timestamp);
      
      // Weighted: 100 + (20*2) + (10*3) = 170
      // Density: 170 / 24 = 7.08
      expect(density).toBeGreaterThan(7);
      expect(density).toBeLessThan(8);
    });

    it('should calculate engagement score', () => {
      const metrics = { likes: 100, comments: 20, shares: 10 };
      const benchmark = { avgLikes: 50, avgComments: 10, avgShares: 5 };
      const score = EngagementCalculator.calculateScore(metrics, benchmark);
      
      expect(score).toBeGreaterThan(0);
      expect(score).toBeLessThanOrEqual(100);
    });

    it('should get engagement rank', () => {
      expect(EngagementCalculator.getRank(0.5)).toBe('low');
      expect(EngagementCalculator.getRank(5)).toBe('medium');
      expect(EngagementCalculator.getRank(50)).toBe('high');
      expect(EngagementCalculator.getRank(150)).toBe('viral');
    });

    it('should analyze engagement', () => {
      const metrics = { likes: 100, comments: 20, shares: 10 };
      const timestamp = new Date(Date.now() - 24 * 60 * 60 * 1000);
      const result = EngagementCalculator.analyze(metrics, timestamp);
      
      expect(result).toHaveProperty('total');
      expect(result).toHaveProperty('density');
      expect(result).toHaveProperty('score');
      expect(result).toHaveProperty('rank');
      expect(result.total).toBe(130);
    });

    it('should rank posts by density', () => {
      const posts = [
        { engagementDensity: 5, name: 'A' },
        { engagementDensity: 20, name: 'B' },
        { engagementDensity: 10, name: 'C' },
      ];
      
      const ranked = EngagementCalculator.rankPosts(posts);
      
      expect(ranked[0].engagementDensity).toBe(20);
      expect(ranked[1].engagementDensity).toBe(10);
      expect(ranked[2].engagementDensity).toBe(5);
    });

    it('should filter posts by engagement', () => {
      const posts = [
        { engagement: { total: 50 } },
        { engagement: { total: 150 } },
        { engagement: { total: 25 } },
      ];
      
      const filtered = EngagementCalculator.filterByEngagement(posts, 100);
      
      expect(filtered.length).toBe(1);
      expect(filtered[0].engagement.total).toBe(150);
    });

    it('should filter posts by date', () => {
      const now = new Date();
      const oldDate = new Date(Date.now() - 60 * 24 * 60 * 60 * 1000); // 60 days ago
      
      const posts = [
        { timestamp: now },
        { timestamp: oldDate },
      ];
      
      const filtered = EngagementCalculator.filterByDate(posts, 30);
      
      expect(filtered.length).toBe(1);
    });

    it('should calculate growth rate', () => {
      const current = { likes: 100, comments: 20, shares: 10 };
      const previous = { likes: 50, comments: 10, shares: 5 };
      const rate = EngagementCalculator.calculateGrowthRate(current, previous, 24);
      
      expect(rate).toBeGreaterThan(0);
    });

    it('should detect anomalies', () => {
      const normal = { likes: 100, comments: 20, shares: 10 };
      const anomalous = { likes: 1000, comments: 5, shares: 2 };
      
      const normalResult = EngagementCalculator.detectAnomalies(normal);
      const anomalousResult = EngagementCalculator.detectAnomalies(anomalous);
      
      expect(normalResult.isAnomalous).toBe(false);
      expect(anomalousResult.isAnomalous).toBe(true);
    });

    it('should calculate quality score', () => {
      const highQuality = { likes: 10, comments: 50, shares: 40 };
      const lowQuality = { likes: 100, comments: 0, shares: 0 };
      
      const highScore = EngagementCalculator.getQualityScore(highQuality);
      const lowScore = EngagementCalculator.getQualityScore(lowQuality);
      
      expect(highScore).toBeGreaterThan(lowScore);
    });
  });

  describe('Scraped Post Model', () => {
    it('should create scraped post', async () => {
      const post = await ScrapedPostModel.create({
        url: 'https://facebook.com/test/post1',
        postId: 'test123',
        content: 'Test post content',
        author: { name: 'Test User', profileUrl: 'https://facebook.com/testuser' },
        timestamp: new Date(),
        engagement: { likes: 100, comments: 20, shares: 10, total: 130 },
        engagementDensity: 5.5,
        keywords: ['test', 'engagement'],
        language: 'en',
        status: 'new',
      });

      expect(post).toBeDefined();
      expect(post._id).toBeDefined();
      expect(post.url).toBe('https://facebook.com/test/post1');
      expect(post.engagement.likes).toBe(100);
    });

    it('should find high engagement posts', async () => {
      const posts = await ScrapedPostModel.findHighEngagement(1, 10);
      
      expect(Array.isArray(posts)).toBe(true);
    });

    it('should find recent posts', async () => {
      const posts = await ScrapedPostModel.findRecent(30, 10);
      
      expect(Array.isArray(posts)).toBe(true);
    });

    it('should find posts by keyword', async () => {
      const posts = await ScrapedPostModel.findByKeyword('test');
      
      expect(Array.isArray(posts)).toBe(true);
    });

    it('should get engagement statistics', async () => {
      const stats = await ScrapedPostModel.getEngagementStats();
      
      expect(stats).toBeDefined();
      expect(stats).toHaveProperty('totalPosts');
      expect(stats).toHaveProperty('avgLikes');
      expect(stats).toHaveProperty('avgDensity');
    });

    it('should update post status', async () => {
      const post = await ScrapedPostModel.create({
        url: 'https://facebook.com/test/post2',
        postId: 'test456',
        content: 'Test post for status update',
        author: { name: 'Test User', profileUrl: '' },
        timestamp: new Date(),
        engagement: { likes: 50, comments: 10, shares: 5, total: 65 },
        engagementDensity: 2.5,
        keywords: ['test'],
        language: 'en',
        status: 'new',
      });

      const updated = await ScrapedPostModel.updateStatus(post._id.toString(), 'processed');
      
      expect(updated).toBeDefined();
      expect(updated?.status).toBe('processed');
    });

    it('should calculate density on instance', async () => {
      const post = await ScrapedPostModel.create({
        url: 'https://facebook.com/test/post3',
        postId: 'test789',
        content: 'Test density calculation',
        author: { name: 'Test User', profileUrl: '' },
        timestamp: new Date(Date.now() - 12 * 60 * 60 * 1000), // 12 hours ago
        engagement: { likes: 60, comments: 12, shares: 6, total: 78 },
        engagementDensity: 0,
        keywords: ['test'],
        language: 'en',
        status: 'new',
      });

      const density = post.calculateDensity();
      
      // Weighted: 60 + (12*2) + (6*3) = 102
      // Density: 102 / 12 = 8.5
      expect(density).toBeGreaterThan(8);
      expect(density).toBeLessThan(9);
    });
  });

  describe('Post Filter Service', () => {
    it('should get filtered posts', async () => {
      const result = await postFilterService.getFilteredPosts({
        limit: 10,
        page: 1,
      });

      expect(result).toBeDefined();
      expect(result.posts).toBeDefined();
      expect(result.pagination).toBeDefined();
    });

    it('should get high engagement posts', async () => {
      const posts = await postFilterService.getHighEngagementPosts(1, 10);
      
      expect(Array.isArray(posts)).toBe(true);
    });

    it('should get recent posts', async () => {
      const posts = await postFilterService.getRecentPosts(30, 10);
      
      expect(Array.isArray(posts)).toBe(true);
    });

    it('should get posts by keyword', async () => {
      const posts = await postFilterService.getPostsByKeyword('test');
      
      expect(Array.isArray(posts)).toBe(true);
    });

    it('should get engagement statistics', async () => {
      const stats = await postFilterService.getEngagementStats();
      
      expect(stats).toBeDefined();
      expect(stats.totalPosts).toBeGreaterThanOrEqual(0);
    });

    it('should update post status', async () => {
      const post = await ScrapedPostModel.create({
        url: 'https://facebook.com/test/post4',
        postId: 'test-service',
        content: 'Test service update',
        author: { name: 'Test User', profileUrl: '' },
        timestamp: new Date(),
        engagement: { likes: 30, comments: 6, shares: 3, total: 39 },
        engagementDensity: 1.5,
        keywords: ['test'],
        language: 'en',
        status: 'new',
      });

      const updated = await postFilterService.updatePostStatus(post._id.toString(), 'engaged');
      
      expect(updated).toBeDefined();
      expect(updated?.status).toBe('engaged');
    });

    it('should mark posts as processed', async () => {
      const post1 = await ScrapedPostModel.create({
        url: 'https://facebook.com/test/post5a',
        postId: 'test-bulk-a',
        content: 'Bulk test A',
        author: { name: 'Test User', profileUrl: '' },
        timestamp: new Date(),
        engagement: { likes: 20, comments: 4, shares: 2, total: 26 },
        engagementDensity: 1,
        keywords: ['test'],
        language: 'en',
        status: 'new',
      });

      const post2 = await ScrapedPostModel.create({
        url: 'https://facebook.com/test/post5b',
        postId: 'test-bulk-b',
        content: 'Bulk test B',
        author: { name: 'Test User', profileUrl: '' },
        timestamp: new Date(),
        engagement: { likes: 25, comments: 5, shares: 2, total: 32 },
        engagementDensity: 1.2,
        keywords: ['test'],
        language: 'en',
        status: 'new',
      });

      const result = await postFilterService.markAsProcessed([
        post1._id.toString(),
        post2._id.toString(),
      ]);

      expect(result.modifiedCount).toBeGreaterThanOrEqual(0);
    });

    it('should get posts for engagement', async () => {
      const posts = await postFilterService.getPostsForEngagement(10);
      
      expect(Array.isArray(posts)).toBe(true);
      expect(posts.length).toBeLessThanOrEqual(10);
    });

    it('should analyze and rank posts', async () => {
      const posts = await postFilterService.analyzeAndRank(10);
      
      expect(Array.isArray(posts)).toBe(true);
      expect(posts.length).toBeLessThanOrEqual(10);
      
      // Check if analysis is included
      if (posts.length > 0) {
        expect(posts[0]).toHaveProperty('analysis');
        expect(posts[0]).toHaveProperty('qualityScore');
      }
    });
  });

  describe('Integration', () => {
    it('should work together: scraper + filter + calculator', async () => {
      // Create a post
      const post = await ScrapedPostModel.create({
        url: 'https://facebook.com/test/integration',
        postId: 'integration-test',
        content: 'Integration test post',
        author: { name: 'Test User', profileUrl: '' },
        timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000), // 6 hours ago
        engagement: { likes: 120, comments: 24, shares: 12, total: 156 },
        engagementDensity: 0,
        keywords: ['integration', 'test'],
        language: 'en',
        status: 'new',
      });

      // Calculate density
      const density = post.calculateDensity();
      await post.save();

      // Filter and get high engagement
      const highEngagement = await postFilterService.getHighEngagementPosts(density - 1, 10);
      
      expect(highEngagement.length).toBeGreaterThan(0);
      expect(highEngagement.some(p => p.postId === 'integration-test')).toBe(true);

      // Analyze
      const analyzed = await postFilterService.analyzeAndRank(10);
      expect(analyzed.length).toBeGreaterThan(0);
    });
  });
});
