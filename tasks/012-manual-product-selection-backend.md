# Task 012: Manual Product Selection for Scraping - Backend API

## Overview
Create backend API endpoints to retrieve saved keywords by product and trigger Facebook scraping using selected product's keywords.

## Type
- [x] Backend
- [ ] Frontend
- [x] Database
- [ ] Integration
- [ ] Testing
- [ ] Documentation

## Priority
- [x] Critical (P0)
- [ ] High (P1)
- [ ] Medium (P2)
- [ ] Low (P3)

## Dependencies
- [x] Depends on: Task 002 (Keyword Strategist Service)
- [x] Depends on: Task 009 (Post Search)
- [x] Blocks: Task 013 (Frontend Product Selector)

## Requirements

### Functional Requirements
1. Get list of all products with generated keywords
2. Get keywords for specific product by ID
3. Trigger scraping using selected product's keywords
4. Return scraping results with status
5. Support filtering products by date, language
6. Show scraping history per product

### Technical Requirements
1. Create new API endpoints in ElysiaJS
2. Query KeywordHistoryModel with product grouping
3. Integrate with existing PostSearchScraper
4. Implement async job tracking (scraping status)
5. Add rate limiting for scrape triggers
6. Log all scraping activities

## Implementation Details

### Files to Create
- `service/src/controllers/product-scraper-controller.ts` - Product scraper API
- `service/src/routes/product-scraper-routes.ts` - Product scraper routes
- `service/src/services/product-scraper-service.ts` - Business logic
- `service/src/types/product-scraper.ts` - TypeScript types

### Files to Modify
- `service/src/index.ts` - Add product scraper routes
- `service/src/models/keyword-history.ts` - Add product name field if needed

### Code Snippets
```typescript
// service/src/types/product-scraper.ts
export interface ProductWithKeywords {
  _id: string;
  productTitle: string;
  category?: string;
  language: LanguageCode;
  keywordCount: number;
  lastGenerated: Date;
  scrapeCount: number;
  lastScraped?: Date;
}

export interface TriggerScrapeRequest {
  productId: string;
  maxResults?: number;
  dateRange?: {
    daysBack: number;
  };
}

export interface ScrapeResult {
  success: boolean;
  postsFound: number;
  searchQueries: number;
  duration: number;
  jobId: string;
}

// service/src/routes/product-scraper-routes.ts
export function createProductScraperRoutes() {
  return new Elysia({ prefix: '/api/products' })
    // Get all products with keywords
    .get('/', () => productScraperController.getProducts())
    // Get product by ID with keywords
    .get('/:id', ({ params: { id } }) => 
      productScraperController.getProductById(id)
    )
    // Trigger scraping for product
    .post(
      '/:id/scrape',
      ({ params: { id }, body }) =>
        productScraperController.triggerScrape(id, body),
      {
        body: t.Object({
          maxResults: t.Optional(t.Number()),
          dateRange: t.Optional(t.Object({
            daysBack: t.Number()
          }))
        })
      }
    )
    // Get scraping history for product
    .get('/:id/scrape-history', ({ params: { id } }) =>
      productScraperController.getScrapeHistory(id)
    );
}
```

## Acceptance Criteria

### Must Have
- [ ] GET /api/products returns list of products with keyword counts
- [ ] GET /api/products/:id returns product details with keywords
- [ ] POST /api/products/:id/scrape triggers Facebook scraping
- [ ] GET /api/products/:id/scrape-history returns scraping history
- [ ] Scraping uses keywords from selected product only
- [ ] Rate limiting prevents abuse (max 5 scrapes per hour per product)
- [ ] Error handling for invalid product IDs

### Should Have
- [ ] Filter products by language
- [ ] Filter products by date range
- [ ] Sort products by last generated or keyword count
- [ ] Return estimated scraping time

## Testing Requirements

### Unit Tests
- [ ] Test product list endpoint
- [ ] Test product by ID endpoint
- [ ] Test scrape trigger endpoint
- [ ] Test rate limiting

### Integration Tests
- [ ] Test full flow: select product → scrape → save posts
- [ ] Test with products that have no keywords
- [ ] Test with invalid product IDs

### Manual Testing
- [ ] Generate keywords for multiple products
- [ ] Select each product and trigger scraping
- [ ] Verify correct keywords are used
- [ ] Check scraping history

## Definition of Done
- [ ] Code implemented
- [ ] Tests passing
- [ ] Code reviewed
- [ ] Documentation updated

## Notes
- Product = unique productTitle from keyword history
- Group keyword generations by product title
- Consider adding a "product name" field for better grouping
- Scraping may take 30-60 seconds per product

## References
- Task 002: `/tasks/002-keyword-strategist-service.md`
- Task 009: `/tasks/009-post-scout-search.md`
