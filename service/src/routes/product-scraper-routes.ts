import { Elysia, t } from 'elysia';
import { createProductScraperService } from '../services/product-scraper-service';
import { createFeedScraper } from '../scrapers/feed-scraper';
import { BrowserPool } from '../scrapers/browser-pool';

export function createProductScraperRoutes() {
  const service = createProductScraperService();
  const feedScraper = createFeedScraper(new BrowserPool(1));

  return new Elysia({ prefix: '/api/products' })
    // Get all products with keywords (for history display)
    .get('/', ({ query }) => service.getProducts({
      searchQuery: query.search,
    }))
    
    // Get product by ID with keywords
    .get('/:id', ({ params: { id } }) => service.getProductById(id))
    
    // Scrape Facebook feed (main endpoint)
    .post(
      '/scrape-feed',
      async ({ body, query }) => {
        const result = await feedScraper.scrapeFeed(query.sessionId || 'web', {
          scrollCount: body.scrollCount || 3,
          minLikes: body.minLikes || 0,
          minComments: body.minComments || 0,
          minShares: body.minShares || 0,
          maxPosts: body.maxPosts || 50,
        });
        
        const savedCount = await feedScraper.savePosts(result);
        
        return {
          success: true,
          data: {
            postsFound: savedCount,
            scrapedAt: new Date(),
          },
        };
      },
      {
        body: t.Object({
          scrollCount: t.Optional(t.Number({ minimum: 1, maximum: 10 })),
          minLikes: t.Optional(t.Number({ minimum: 0 })),
          minComments: t.Optional(t.Number({ minimum: 0 })),
          minShares: t.Optional(t.Number({ minimum: 0 })),
          maxPosts: t.Optional(t.Number({ minimum: 1, maximum: 100 })),
        }),
        query: t.Object({
          sessionId: t.Optional(t.String()),
        }),
      }
    )
    
    // Scrape from keyword history (uses feed scraper now)
    .post(
      '/scrape-from-keywords',
      async ({ body, query }) => {
        const { productTitle, keywords, ...options } = body;
        
        if (!keywords || !Array.isArray(keywords) || keywords.length === 0) {
          throw new Error('Keywords are required');
        }
        
        const tempId = `history-${productTitle}-${Date.now()}`;
        
        const result = await service.triggerScrapeFromKeywords(
          tempId,
          keywords,
          {
            maxResults: options.maxResults,
            dateRange: options.dateRange,
          },
          query.sessionId
        );
        
        return {
          success: true,
          data: result,
        };
      },
      {
        body: t.Object({
          productTitle: t.String(),
          keywords: t.Array(t.String()),
          maxResults: t.Optional(t.Number({ minimum: 1, maximum: 100 })),
          dateRange: t.Optional(t.Object({
            daysBack: t.Number({ minimum: 1, maximum: 90 }),
          })),
        }),
        query: t.Object({
          sessionId: t.Optional(t.String()),
        }),
      }
    )
    
    // Get scraping history for product
    .get(
      '/:id/scrape-history',
      ({ params: { id }, query }) =>
        service.getScrapeHistory(id, Number(query.limit || 10)),
      {
        query: t.Object({
          limit: t.Optional(t.Number({ minimum: 1, maximum: 100 })),
        }),
      }
    );
}
