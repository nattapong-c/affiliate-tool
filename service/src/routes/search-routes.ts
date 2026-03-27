import { Elysia, t } from 'elysia';
import { SearchController } from '../controllers/search-controller';
import { createSearchService } from '../services/search-service';
import { createPostSearchScraper } from '../scrapers/post-search';

export function createSearchRoutes() {
  const scraper = createPostSearchScraper();
  const searchService = createSearchService(scraper);
  const controller = new SearchController(searchService);

  return new Elysia({ prefix: '/api/search' })
    // Execute search
    .post(
      '/',
      (request) => controller.search(request as any),
      {
        body: t.Object({
          keywords: t.Array(t.String()),
          pages: t.Optional(t.Array(t.String())),
          dateFrom: t.String({ format: 'date-time' }),
          dateTo: t.String({ format: 'date-time' }),
          maxResults: t.Optional(t.Number({ minimum: 1, maximum: 100 })),
        }),
      }
    )
    // Get search history
    .get('/history', (request) => controller.getHistory(request as any))
    // Get search by ID
    .get('/:id', (request) => controller.getSearchById(request as any))
    // Get statistics
    .get('/statistics', (request) => controller.getStatistics(request as any))
    // Delete search history
    .delete('/:id', (request) => controller.deleteHistory(request as any));
}
