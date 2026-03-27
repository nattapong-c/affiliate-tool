import { describe, it, expect, beforeAll, afterAll, mock } from 'bun:test';
import mongoose from 'mongoose';
import { KeywordHistoryModel } from '../src/models/keyword-history';
import { config } from 'dotenv';

config();

describe('Thai Language Keyword History - Database Operations', () => {
  const testUri = process.env.MONGODB_URI || 'mongodb+srv://bhijack:uH35WXhXHV5CaAkz@personal-0.hsi02.mongodb.net/affiliate-test';

  // Mock Thai keywords data
  const mockThaiKeywords = [
    {
      text: 'หูฟังไร้สาย ราคาถูก',
      category: 'intent' as const,
      relevanceScore: 95,
      searchVolume: 'high' as const,
      language: 'th' as const
    },
    {
      text: 'หูฟังบลูทูธ TWS',
      category: 'intent' as const,
      relevanceScore: 90,
      searchVolume: 'high' as const,
      language: 'th' as const
    },
    {
      text: 'อุปกรณ์ออกกำลังกาย',
      category: 'topic' as const,
      relevanceScore: 75,
      searchVolume: 'medium' as const,
      language: 'th' as const
    },
    {
      text: 'หูฟังออกกำลังกาย กันน้ำ',
      category: 'intent' as const,
      relevanceScore: 85,
      searchVolume: 'medium' as const,
      language: 'th' as const
    }
  ];

  // Mock English keywords data
  const mockEnglishKeywords = [
    {
      text: 'wireless earbuds under 500',
      category: 'intent' as const,
      relevanceScore: 92,
      searchVolume: 'high' as const,
      language: 'en' as const
    },
    {
      text: 'bluetooth headphones review',
      category: 'topic' as const,
      relevanceScore: 80,
      searchVolume: 'medium' as const,
      language: 'en' as const
    }
  ];

  beforeAll(async () => {
    // Connect to MongoDB
    await mongoose.connect(testUri);
    console.log('✅ Connected to MongoDB for testing');
  });

  afterAll(async () => {
    // Clean up test data
    const result = await KeywordHistoryModel.deleteMany({ 
      productTitle: { $in: ['หูฟังไร้สาย TWS Test', 'Wireless Earbuds Test', 'Mixed Language Test'] } 
    });
    console.log(`🧹 Cleaned up ${result.deletedCount} test documents`);
    
    await mongoose.disconnect();
    console.log('👋 Disconnected from MongoDB');
  });

  it('should save Thai keywords to database', async () => {
    const testData = {
      productTitle: 'หูฟังไร้สาย TWS Test',
      productDescription: 'หูฟังบลูทูธไร้สายคุณภาพสูง ตัดเสียงรบกวน แบตเตอรี่ใช้งานได้นาน 30 ชั่วโมง',
      category: 'อิเล็กทรอนิกส์',
      language: 'th' as const,
      keywords: mockThaiKeywords,
      processingTimeMs: 1250,
      cacheHit: false
    };

    const saved = await KeywordHistoryModel.create(testData);

    expect(saved).toBeDefined();
    expect(saved._id).toBeDefined();
    expect(saved.language).toBe('th');
    expect(saved.keywords.length).toBe(4);
    expect(saved.productTitle).toBe(testData.productTitle);

    // Verify keyword structure
    saved.keywords.forEach((keyword, idx) => {
      expect(keyword.text).toBeDefined();
      expect(keyword.category).toBeOneOf(['intent', 'topic']);
      expect(keyword.relevanceScore).toBeGreaterThanOrEqual(0);
      expect(keyword.relevanceScore).toBeLessThanOrEqual(100);
      
      // Verify Thai characters in keywords
      if (mockThaiKeywords[idx]) {
        expect(keyword.text).toBe(mockThaiKeywords[idx].text);
        expect(/[\u0E00-\u0E7F]/.test(keyword.text)).toBe(true);
      }
    });

    console.log(`💾 Saved Thai keyword generation: ${saved._id}`);
    console.log('✅ Thai keyword save test passed');
  });

  it('should save English keywords to database', async () => {
    const testData = {
      productTitle: 'Wireless Earbuds Test',
      productDescription: 'High quality wireless Bluetooth earbuds with noise cancellation',
      category: 'Electronics',
      language: 'en' as const,
      keywords: mockEnglishKeywords,
      processingTimeMs: 980,
      cacheHit: true
    };

    const saved = await KeywordHistoryModel.create(testData);

    expect(saved).toBeDefined();
    expect(saved._id).toBeDefined();
    expect(saved.language).toBe('en');
    expect(saved.keywords.length).toBe(2);
    expect(saved.cacheHit).toBe(true);

    console.log(`💾 Saved English keyword generation: ${saved._id}`);
    console.log('✅ English keyword save test passed');
  });

  it('should query Thai keywords by language', async () => {
    const thaiGenerations = await KeywordHistoryModel.find({ language: 'th' })
      .sort({ createdAt: -1 })
      .limit(10);

    expect(thaiGenerations).toBeDefined();
    expect(thaiGenerations.length).toBeGreaterThan(0);
    
    // Verify all returned documents have Thai language
    thaiGenerations.forEach(gen => {
      expect(gen.language).toBe('th');
    });

    console.log(`🔍 Found ${thaiGenerations.length} Thai keyword generations`);
    console.log('✅ Thai language query test passed');
  });

  it('should query English keywords by language', async () => {
    const englishGenerations = await KeywordHistoryModel.find({ language: 'en' })
      .sort({ createdAt: -1 })
      .limit(10);

    expect(englishGenerations).toBeDefined();
    expect(englishGenerations.length).toBeGreaterThan(0);
    
    // Verify all returned documents have English language
    englishGenerations.forEach(gen => {
      expect(gen.language).toBe('en');
    });

    console.log(`🔍 Found ${englishGenerations.length} English keyword generations`);
    console.log('✅ English language query test passed');
  });

  it('should search Thai text in productTitle', async () => {
    const results = await KeywordHistoryModel.find({
      productTitle: { $regex: 'หูฟัง', $options: 'i' }
    });

    expect(results).toBeDefined();
    expect(results.length).toBeGreaterThan(0);

    console.log(`🔍 Found ${results.length} documents with Thai text 'หูฟัง'`);
    console.log('✅ Thai text search test passed');
  });

  it('should handle mixed language product titles', async () => {
    const mixedKeywords = [
      {
        text: 'หูฟัง wireless',
        category: 'intent' as const,
        relevanceScore: 88,
        searchVolume: 'medium' as const,
        language: 'th' as const
      }
    ];

    const testData = {
      productTitle: 'Mixed Language หูฟัง Wireless Test',
      productDescription: 'หูฟังบลูทูธไร้สาย wireless bluetooth earbuds',
      category: 'Electronics',
      language: 'th' as const,
      keywords: mixedKeywords,
      processingTimeMs: 500,
      cacheHit: false
    };

    const saved = await KeywordHistoryModel.create(testData);

    expect(saved).toBeDefined();
    expect(saved.productTitle).toContain('หูฟัง');
    expect(saved.productTitle).toContain('Wireless');
    expect(saved.language).toBe('th');

    console.log(`💾 Saved mixed language generation: ${saved._id}`);
    console.log('✅ Mixed language test passed');
  });

  it('should update Thai keyword document', async () => {
    const testData = {
      productTitle: 'หูฟังไร้สาย TWS Test',
      productDescription: 'หูฟังบลูทูธไร้สายคุณภาพสูง ตัดเสียงรบกวน แบตเตอรี่ใช้งานได้นาน 30 ชั่วโมง',
      category: 'อิเล็กทรอนิกส์',
      language: 'th' as const,
      keywords: mockThaiKeywords,
      processingTimeMs: 1250,
      cacheHit: false
    };

    const created = await KeywordHistoryModel.create(testData);
    
    // Update the document
    const updated = await KeywordHistoryModel.findByIdAndUpdate(
      created._id,
      { 
        $set: { category: 'Audio & Electronics' },
        $push: { 
          keywords: {
            text: 'หูฟังเกมมิ่ง',
            category: 'intent',
            relevanceScore: 70,
            searchVolume: 'low',
            language: 'th'
          }
        }
      },
      { new: true }
    );

    expect(updated).toBeDefined();
    expect(updated?.category).toBe('Audio & Electronics');
    expect(updated?.keywords.length).toBeGreaterThan(mockThaiKeywords.length);

    console.log(`✏️ Updated document: ${updated?._id}`);
    console.log('✅ Thai keyword update test passed');
  });

  it('should delete Thai keyword document', async () => {
    const testData = {
      productTitle: 'หูฟังไร้สาย TWS Test',
      productDescription: 'หูฟังบลูทูธไร้สายคุณภาพสูง ตัดเสียงรบกวน แบตเตอรี่ใช้งานได้นาน 30 ชั่วโมง',
      category: 'อิเล็กทรอนิกส์',
      language: 'th' as const,
      keywords: mockThaiKeywords,
      processingTimeMs: 1250,
      cacheHit: false
    };

    const created = await KeywordHistoryModel.create(testData);
    
    // Delete the document
    const deleted = await KeywordHistoryModel.findByIdAndDelete(created._id);
    
    expect(deleted).toBeDefined();
    expect(deleted?._id).toEqual(created._id);
    expect(deleted?.language).toBe('th');

    // Verify it's deleted
    const found = await KeywordHistoryModel.findById(created._id);
    expect(found).toBeNull();

    console.log(`🗑️ Deleted document: ${deleted?._id}`);
    console.log('✅ Thai keyword delete test passed');
  });
});
