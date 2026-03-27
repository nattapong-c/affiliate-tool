import { describe, it, expect, beforeAll, afterAll, mock } from 'bun:test';
import { KeywordStrategist } from '../src/services/keyword-strategist';
import { KeywordHistoryModel } from '../src/models/keyword-history';
import mongoose from 'mongoose';

// Mock OpenAI
mock.module('openai', () => {
  return {
    default: class MockOpenAI {
      constructor() {}
      chat = {
        completions: {
          create: mock(() => Promise.resolve({
            choices: [{
              message: {
                content: JSON.stringify({
                  keywords: [
                    { text: 'test keyword 1', category: 'intent', relevanceScore: 90, searchVolume: 'high' },
                    { text: 'test keyword 2', category: 'topic', relevanceScore: 85, searchVolume: 'medium' }
                  ]
                })
              }
            }]
          }))
        }
      };
    }
  };
});

describe('Keyword Generator Integration', () => {
  let strategist: KeywordStrategist;

  beforeAll(async () => {
    // Connect to test database
    const testUri = process.env.TEST_MONGODB_URI || 'mongodb://localhost:27017/facebook-automation-test';
    await mongoose.connect(testUri);
    strategist = new KeywordStrategist('test-api-key');
  });

  afterAll(async () => {
    await mongoose.connection.dropDatabase();
    await mongoose.disconnect();
  });

  it('should generate keywords from product data', async () => {
    const request = {
      productTitle: 'Wireless Bluetooth Earbuds TWS',
      productDescription: 'High quality wireless earbuds with noise cancellation',
      category: 'Electronics'
    };

    const result = await strategist.generateKeywords(request);

    expect(result.keywords).toBeDefined();
    expect(result.keywords.length).toBeGreaterThan(0);
    expect(result.keywords[0]).toHaveProperty('text');
    expect(result.keywords[0]).toHaveProperty('category');
    expect(result.keywords[0]).toHaveProperty('relevanceScore');
    expect(result.cacheHit).toBe(false);
  });

  it('should return cached results on second request', async () => {
    const request = {
      productTitle: 'Cached Product Test',
      productDescription: 'Same description for caching test',
      category: 'Test'
    };

    // First request (not cached)
    const result1 = await strategist.generateKeywords(request);
    expect(result1.cacheHit).toBe(false);

    // Second request (should be cached)
    const result2 = await strategist.generateKeywords(request);
    expect(result2.cacheHit).toBe(true);
  });

  it('should save generation history to database', async () => {
    const request = {
      productTitle: 'History Test Product',
      productDescription: 'Testing history persistence',
      category: 'Test'
    };

    await strategist.generateKeywords(request);

    const history = await KeywordHistoryModel.findOne({ productTitle: request.productTitle });
    expect(history).toBeTruthy();
    expect(history?.keywords.length).toBeGreaterThan(0);
  });

  it('should handle invalid input gracefully', async () => {
    const request = {
      productTitle: '', // Invalid: empty title
      productDescription: 'Description',
      category: 'Test'
    };

    // This should fail validation
    await expect(strategist.generateKeywords(request as any)).rejects.toThrow();
  });
});
