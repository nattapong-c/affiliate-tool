import { Elysia, t } from 'elysia';
import { createProductScraperService } from '../services/product-scraper-service';

export function createProductScraperRoutes() {
  const service = createProductScraperService();

  return new Elysia({ prefix: '/api/products' })
    // Get all products with keywords
    .get('/', ({ query }) => service.getProducts({
      language: query.language as 'en' | 'th' | undefined,
      searchQuery: query.search,
    }))
    
    // Get product by ID with keywords
    .get('/:id', ({ params: { id } }) => service.getProductById(id))
    
    // Trigger scraping for product
    .post(
      '/:id/scrape',
      async ({ params: { id }, body, query }) => {
        const result = await service.triggerScrape(id, body, query.sessionId);
        return {
          success: true,
          data: result,
        };
      },
      {
        body: t.Object({
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
        service.getScrapeHistory(id, parseInt(query.limit || '10')),
      {
        query: t.Object({
          limit: t.Optional(t.Number({ minimum: 1, maximum: 100 })),
        }),
      }
    );
}
