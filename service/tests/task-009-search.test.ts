import { describe, it, expect, beforeAll, afterAll } from 'bun:test';
import mongoose from 'mongoose';
import { SearchQueryBuilder } from '../src/utils/search-query-builder';
import { SearchHistoryModel } from '../src/models/search-history';
import { config } from 'dotenv';

config();

describe('Task 009 - Keyword-Based Post Search', () => {
  const testUri = process.env.MONGODB_URI || 'mongodb+srv://bhijack:uH35WXhXHV5CaAkz@personal-0.hsi02.mongodb.net/affiliate-test';

  beforeAll(async () => {
    await mongoose.connect(testUri);
    console.log('✅ Connected to MongoDB for testing');
  });

  afterAll(async () => {
    await SearchHistoryModel.deleteMany({ keywords: { $in: ['test', 'หูฟัง'] } });
    console.log('🧹 Cleaned up test data');
    await mongoose.disconnect();
    console.log('👋 Disconnected from MongoDB');
  });

  describe('Search Query Builder', () => {
    let queryBuilder: SearchQueryBuilder;

    beforeAll(() => {
      queryBuilder = new SearchQueryBuilder();
    });

    it('should build search URL from keywords', () => {
      const url = queryBuilder.buildSearchUrl(['wireless', 'earbuds']);
      
      expect(url).toBeDefined();
      expect(url).toContain('facebook.com/search/posts');
      expect(url).toContain('q=');
      expect(url).toContain('wireless');
      expect(url).toContain('earbuds');
    });

    it('should build search URL with page name', () => {
      const url = queryBuilder.buildSearchUrl(['wireless'], 'TechPage');
      
      expect(url).toContain('sf=author');
      expect(url).toContain('user=TechPage');
    });

    it('should build date filter', () => {
      const filter = queryBuilder.buildDateFilter(30);
      
      expect(filter).toBeDefined();
      expect(filter.start).toBeLessThan(filter.end);
      expect(filter.end).toBeLessThanOrEqual(Date.now());
    });

    it('should optimize keywords', () => {
      const keywords = ['Best', 'wireless', 'earbuds!', '2024', 'a', 'th'];
      const optimized = queryBuilder.optimizeKeywords(keywords);
      
      expect(optimized).toBeDefined();
      expect(optimized.length).toBeLessThanOrEqual(10);
      expect(optimized).not.toContain('a'); // Too short
      expect(optimized).not.toContain('earbuds!'); // Special chars removed
    });

    it('should optimize Thai keywords', () => {
      const keywords = ['หูฟัง', 'ไร้สาย', 'ดีๆ'];
      const optimized = queryBuilder.optimizeKeywords(keywords);
      
      expect(optimized).toBeDefined();
      expect(optimized).toContain('หูฟัง');
      expect(optimized).toContain('ไร้สาย');
    });

    it('should build post type query', () => {
      const postsQuery = queryBuilder.buildPostTypeQuery(['wireless'], 'posts');
      const photosQuery = queryBuilder.buildPostTypeQuery(['wireless'], 'photos');
      const videosQuery = queryBuilder.buildPostTypeQuery(['wireless'], 'videos');
      
      expect(postsQuery).toBe('wireless');
      expect(photosQuery).toContain('photos');
      expect(videosQuery).toContain('videos');
    });

    it('should build location query', () => {
      const query = queryBuilder.buildLocationQuery(['wireless'], 'Thailand');
      
      expect(query).toContain('wireless');
      expect(query).toContain('Thailand');
    });

    it('should parse pagination', () => {
      const urlWithCursor = 'https://facebook.com/search?cursor=abc123';
      const urlWithoutCursor = 'https://facebook.com/search';
      
      const result1 = queryBuilder.parsePagination(urlWithCursor);
      const result2 = queryBuilder.parsePagination(urlWithoutCursor);
      
      expect(result1.hasMore).toBe(true);
      expect(result1.nextCursor).toBe('abc123');
      expect(result2.hasMore).toBe(false);
    });

    it('should validate query - valid', () => {
      const query = {
        keywords: ['wireless', 'earbuds'],
        dateFrom: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        dateTo: new Date(),
        maxResults: 20,
      };

      const validation = queryBuilder.validateQuery(query);
      
      expect(validation.valid).toBe(true);
      expect(validation.errors).toHaveLength(0);
    });

    it('should validate query - missing keywords', () => {
      const query = {
        keywords: [],
        dateFrom: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        dateTo: new Date(),
        maxResults: 20,
      };

      const validation = queryBuilder.validateQuery(query);
      
      expect(validation.valid).toBe(false);
      expect(validation.errors).toContain('Keywords are required');
    });

    it('should validate query - too many keywords', () => {
      const query = {
        keywords: Array(25).fill('test'),
        dateFrom: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        dateTo: new Date(),
        maxResults: 20,
      };

      const validation = queryBuilder.validateQuery(query);
      
      expect(validation.valid).toBe(false);
      expect(validation.errors).toContain('Maximum 20 keywords allowed');
    });

    it('should validate query - invalid date range', () => {
      const query = {
        keywords: ['test'],
        dateFrom: new Date(),
        dateTo: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        maxResults: 20,
      };

      const validation = queryBuilder.validateQuery(query);
      
      expect(validation.valid).toBe(false);
      expect(validation.errors).toContain('Date from must be before date to');
    });

    it('should validate query - date range too wide', () => {
      const query = {
        keywords: ['test'],
        dateFrom: new Date(Date.now() - 100 * 24 * 60 * 60 * 1000),
        dateTo: new Date(),
        maxResults: 20,
      };

      const validation = queryBuilder.validateQuery(query);
      
      expect(validation.valid).toBe(false);
      expect(validation.errors).toContain('Date range cannot exceed 90 days');
    });
  });

  describe('Search History Model', () => {
    it('should create search history record', async () => {
      const searchHistory = await SearchHistoryModel.create({
        userId: 'test-user',
        keywords: ['test', 'search'],
        dateFrom: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        dateTo: new Date(),
        results: [
          {
            url: 'https://facebook.com/post/123',
            snippet: 'Test post snippet',
            relevanceScore: 80,
          },
        ],
        totalFound: 1,
        duration: 1500,
        status: 'completed',
      });

      expect(searchHistory).toBeDefined();
      expect(searchHistory._id).toBeDefined();
      expect(searchHistory.keywords).toEqual(['test', 'search']);
      expect(searchHistory.results).toHaveLength(1);
      expect(searchHistory.status).toBe('completed');
    });

    it('should find recent searches', async () => {
      const searches = await SearchHistoryModel.findRecent('test-user', 10);
      
      expect(searches).toBeDefined();
      expect(Array.isArray(searches)).toBe(true);
    });

    it('should find searches by keyword', async () => {
      const searches = await SearchHistoryModel.findByKeyword('test');
      
      expect(searches).toBeDefined();
      expect(Array.isArray(searches)).toBe(true);
      expect(searches.length).toBeGreaterThan(0);
    });

    it('should get search statistics', async () => {
      const stats = await SearchHistoryModel.getStatistics('test-user');
      
      expect(stats).toBeDefined();
      expect(stats).toHaveProperty('totalSearches');
      expect(stats).toHaveProperty('totalResults');
      expect(stats).toHaveProperty('averageDuration');
      expect(stats).toHaveProperty('averageResults');
    });

    it('should update search status to failed', async () => {
      const searchHistory = await SearchHistoryModel.create({
        userId: 'test-user',
        keywords: ['failed', 'search'],
        dateFrom: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        dateTo: new Date(),
        results: [],
        totalFound: 0,
        duration: 100,
        status: 'failed',
        errorMessage: 'Test error',
      });

      expect(searchHistory.status).toBe('failed');
      expect(searchHistory.errorMessage).toBe('Test error');
    });

    it('should delete search history', async () => {
      const searchHistory = await SearchHistoryModel.create({
        userId: 'test-user',
        keywords: ['delete', 'me'],
        dateFrom: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        dateTo: new Date(),
        results: [],
        totalFound: 0,
        duration: 100,
        status: 'completed',
      });

      const deleted = await SearchHistoryModel.findByIdAndDelete(searchHistory._id);
      
      expect(deleted).toBeDefined();
      expect(deleted?._id).toEqual(searchHistory._id);

      // Verify it's deleted
      const found = await SearchHistoryModel.findById(searchHistory._id);
      expect(found).toBeNull();
    });
  });

  describe('Integration', () => {
    it('should work together: query builder + search history', async () => {
      const queryBuilder = new SearchQueryBuilder();
      
      // Build search
      const keywords = ['integration', 'test'];
      const url = queryBuilder.buildSearchUrl(keywords);
      const dateFilter = queryBuilder.buildDateFilter(30);
      
      expect(url).toBeDefined();
      expect(dateFilter).toBeDefined();

      // Save search to history
      const searchHistory = await SearchHistoryModel.create({
        userId: 'integration-user',
        keywords,
        dateFrom: new Date(dateFilter.start),
        dateTo: new Date(dateFilter.end),
        results: [],
        totalFound: 0,
        duration: 100,
        status: 'completed',
      });

      expect(searchHistory).toBeDefined();
      expect(searchHistory.keywords).toEqual(keywords);

      // Retrieve from history
      const searches = await SearchHistoryModel.findByKeyword('integration');
      expect(searches.length).toBeGreaterThan(0);
    });
  });
});
