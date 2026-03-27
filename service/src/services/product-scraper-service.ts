import pino from 'pino';
import { KeywordHistoryModel } from '../models/keyword-history';
import { ScrapedPostModel } from '../models/scraped-post';
import { FeedScraper, createFeedScraper } from '../scrapers/feed-scraper';
import { BrowserPool } from '../scrapers/browser-pool';
import { PostSearchScraper, createPostSearchScraper } from '../scrapers/post-search';
import { PostDetailScraper, createPostDetailScraper } from '../scrapers/post-detail-scraper';
import { ProductWithKeywords, ScrapeResult, TriggerScrapeRequest } from '../types/product-scraper';

const logger = pino();

export class ProductScraperService {
  private feedScraper: FeedScraper;
  private postSearchScraper: PostSearchScraper;
  private postDetailScraper: PostDetailScraper;
  private browserPool: BrowserPool;

  constructor() {
    this.browserPool = new BrowserPool(1);
    this.feedScraper = createFeedScraper(this.browserPool);
    this.postSearchScraper = createPostSearchScraper(this.browserPool);
    this.postDetailScraper = createPostDetailScraper(this.browserPool);
  }

  /**
   * Get all products with keyword counts
   */
  async getProducts(filter?: {
    language?: 'en' | 'th';
    searchQuery?: string;
  }): Promise<ProductWithKeywords[]> {
    const matchQuery: any = {};

    if (filter?.language) {
      matchQuery.language = filter.language;
    }

    if (filter?.searchQuery) {
      matchQuery.productTitle = new RegExp(filter.searchQuery, 'i');
    }

    // Aggregate to group by product title
    const products = await KeywordHistoryModel.aggregate([
      { $match: matchQuery },
      {
        $group: {
          _id: {
            productTitle: '$productTitle',
            language: '$language',
            category: '$category'
          },
          keywordCount: { $sum: 1 },
          totalKeywords: { $sum: { $size: { $ifNull: ['$keywords', []] } } },
          lastGenerated: { $max: '$createdAt' },
          scrapeCount: { $sum: 0 },
          category: { $first: '$category' },
          language: { $first: '$language' }
        }
      },
      {
        $project: {
          _id: { 
            $concat: [
              { $ifNull: ['$_id.productTitle', 'unknown'] }, 
              '-', 
              { $ifNull: ['$_id.language', ''] }
            ] 
          },
          productTitle: { $ifNull: ['$_id.productTitle', 'Unknown Product'] },
          category: '$_id.category',
          language: 1,
          keywordCount: '$totalKeywords',
          lastGenerated: 1,
          scrapeCount: 1
        }
      },
      { $sort: { lastGenerated: -1 } }
    ]);

    logger.info({ count: products.length }, 'Products aggregated');

    if (products.length === 0) {
      logger.warn('No products found - generate keywords first');
      return [];
    }

    // Get scrape counts for each product
    const productsWithScrapes = await Promise.all(
      products.map(async (product) => {
        const scrapeCount = await ScrapedPostModel.countDocuments({
          keywords: { $regex: new RegExp(product.productTitle, 'i') }
        });

        const lastScrape = await ScrapedPostModel.findOne({
          keywords: { $regex: new RegExp(product.productTitle, 'i') }
        }).sort({ scrapedAt: -1 });

        return {
          ...product,
          scrapeCount,
          lastScraped: lastScrape?.scrapedAt
        };
      })
    );

    logger.info({ count: productsWithScrapes.length }, 'Products retrieved');
    return productsWithScrapes;
  }

  /**
   * Get product by ID with keywords
   */
  async getProductById(id: string) {
    const keywordHistory = await KeywordHistoryModel.findById(id);
    
    if (!keywordHistory) {
      throw new Error('Product not found');
    }

    const scrapeCount = await ScrapedPostModel.countDocuments({
      keywords: { $in: keywordHistory.keywords }
    });

    const lastScrape = await ScrapedPostModel.findOne({
      keywords: { $in: keywordHistory.keywords }
    }).sort({ scrapedAt: -1 });

    return {
      ...keywordHistory.toObject(),
      scrapeCount,
      lastScraped: lastScrape?.scrapedAt
    };
  }

  /**
   * Trigger scraping for a product using its keywords
   */
  async triggerScrape(
    id: string,
    request: TriggerScrapeRequest,
    sessionId: string = 'default'
  ): Promise<ScrapeResult> {
    const startTime = Date.now();
    const jobId = `scrape-${id}-${Date.now()}`;

    try {
      logger.info({ id, jobId }, 'Starting product scrape');

      // Get product keywords
      const keywordHistory = await KeywordHistoryModel.findById(id);

      if (!keywordHistory) {
        logger.error({ id }, 'Product not found');
        throw new Error('Product not found');
      }

      if (keywordHistory.keywords.length === 0) {
        logger.error({ id }, 'Product has no keywords');
        throw new Error('Product has no keywords');
      }

      logger.info(
        { 
          id, 
          keywordCount: keywordHistory.keywords.length,
          language: keywordHistory.language 
        },
        'Found product with keywords'
      );

      // Prepare search query
      const dateTo = new Date();
      const dateFrom = new Date();
      dateFrom.setDate(dateFrom.getDate() - (request.dateRange?.daysBack || 30));

      // Search Facebook using keywords
      logger.info({ sessionId, keywords: keywordHistory.keywords.slice(0, 5) }, 'Searching Facebook');
      const searchResult = await this.postSearchScraper.searchPosts(sessionId, {
        keywords: keywordHistory.keywords.map(k => typeof k === 'string' ? k : (k as any).text),
        dateFrom,
        dateTo,
        maxResults: request.maxResults || 20,
      });

      logger.info({ jobId, postsFound: searchResult.totalFound }, 'Search completed');
      for (const post of searchResult.posts) {
        try {
          await ScrapedPostModel.findOneAndUpdate(
            { url: post.url },
            {
              url: post.url,
              postId: this.generatePostId(post.url),
              content: post.snippet,
              timestamp: new Date(),
              engagement: { likes: 0, comments: 0, shares: 0, total: 0 },
              reactions: { like: 0, love: 0, haha: 0, wow: 0, sad: 0, angry: 0 },
              engagementDensity: post.relevanceScore,
              keywords: keywordHistory.keywords,
              language: keywordHistory.language,
              status: 'new' as const,
              scrapedAt: new Date(),
            },
            { upsert: true }
          );
        } catch (error) {
          logger.error({ url: post.url, error }, 'Failed to save post');
        }
      }

      const duration = Date.now() - startTime;

      logger.info(
        { jobId, postsFound: searchResult.totalFound, duration },
        'Product scrape completed'
      );

      return {
        success: true,
        postsFound: searchResult.totalFound,
        searchQueries: 1,
        duration,
        jobId,
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      const errorStack = error instanceof Error ? error.stack : 'No stack';
      
      logger.error(
        { 
          id, 
          jobId, 
          errorMessage, 
          errorStack,
          errorType: error?.constructor?.name 
        }, 
        'Product scrape failed'
      );

      return {
        success: false,
        postsFound: 0,
        searchQueries: 0,
        duration: Date.now() - startTime,
        jobId,
      };
    }
  }

  /**
   * Scrape Facebook feed (for history tab scraping button)
   */
  async triggerScrapeFromKeywords(
    id: string,
    keywords: string[],
    language: string,
    request: TriggerScrapeRequest,
    sessionId: string = 'default'
  ): Promise<ScrapeResult> {
    const startTime = Date.now();
    const jobId = `feed-${id}-${Date.now()}`;

    try {
      logger.info({ id, jobId }, 'Starting feed scrape');

      // Scrape Facebook feed
      const feedOptions = {
        scrollCount: 3,
        minLikes: 0,
        minComments: 0,
        minShares: 0,
        maxPosts: request.maxResults || 20,
      };

      logger.info({ sessionId, options: feedOptions }, 'Scraping Facebook feed');
      const feedPosts = await this.feedScraper.scrapeFeed(sessionId, feedOptions);

      logger.info({ jobId, postsFound: feedPosts.length }, 'Feed scrape completed');

      // Save results to database
      const savedCount = await this.feedScraper.savePosts(feedPosts);

      const duration = Date.now() - startTime;

      logger.info(
        { jobId, postsFound: feedPosts.length, savedCount, duration },
        'Feed scrape completed and saved'
      );

      return {
        success: true,
        postsFound: savedCount,
        searchQueries: 1,
        duration,
        jobId,
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      const errorStack = error instanceof Error ? error.stack : 'No stack';
      
      logger.error(
        { 
          id, 
          jobId, 
          errorMessage, 
          errorStack,
          errorType: error?.constructor?.name 
        }, 
        'Feed scrape failed'
      );

      return {
        success: false,
        postsFound: 0,
        searchQueries: 0,
        duration: Date.now() - startTime,
        jobId,
      };
    }
  }

  /**
   * Get scraping history for a product
   */
  async getScrapeHistory(productId: string, limit: number = 10) {
    const history = await ScrapedPostModel.find({
      keywords: { $regex: new RegExp(productId, 'i') }
    })
      .sort({ scrapedAt: -1 })
      .limit(limit);

    return history.map(post => ({
      _id: post._id.toString(),
      productId: post.keywords.join(', '),
      keywordsUsed: post.keywords,
      postsFound: 1,
      status: post.status as 'completed' | 'failed' | 'partial',
      duration: 0,
      scrapedAt: post.scrapedAt,
    }));
  }

  /**
   * Generate post ID from URL
   */
  private generatePostId(url: string): string {
    const urlParts = url.split('/');
    const postId = urlParts[urlParts.length - 1] || urlParts[urlParts.length - 2];
    return postId.replace(/\D/g, '').substring(0, 20) || Date.now().toString();
  }

  /**
   * Close browser pool
   */
  async close() {
    await this.browserPool.closeAll();
  }
}

// Factory function
export function createProductScraperService(): ProductScraperService {
  return new ProductScraperService();
}
