# Task 003: Keyword API Endpoints

## Overview
Create REST API endpoints for keyword generation using ElysiaJS, exposing the Keyword Strategist service functionality.

## Type
- [x] Backend
- [ ] Frontend
- [x] Database
- [ ] Integration
- [ ] Testing
- [ ] Documentation

## Priority
- [x] High (P1)
- [ ] Critical (P0)
- [ ] Medium (P2)
- [ ] Low (P3)

## Dependencies
- [x] Depends on: Task 001 (project setup), Task 002 (keyword service)
- [x] Blocks: Task 004 (frontend UI)

## Requirements

### Functional Requirements
1. POST /api/keywords/generate - Generate keywords from product data
2. GET /api/keywords/history - Get keyword generation history
3. GET /api/keywords/:id - Get specific keyword generation result
4. DELETE /api/keywords/:id/cache - Clear cache for specific product
5. GET /api/health - Health check endpoint

### Technical Requirements
1. Use ElysiaJS for routing
2. Implement CORS for frontend access
3. Use Zod for request/response validation
4. Implement error handling middleware
5. Add request logging with Pino
6. Store generation history in MongoDB

## Implementation Details

### Files to Create
- `service/src/controllers/keyword-controller.ts` - Request handlers
- `service/src/routes/keyword-routes.ts` - Route definitions
- `service/src/models/keyword-history.ts` - Mongoose schema
- `service/src/middleware/error-handler.ts` - Error handling
- `service/src/middleware/logger.ts` - Request logging
- `service/src/index.ts` - Main entry point (modify)

### Files to Modify
- `service/src/index.ts` - Add routes and middleware

### Code Snippets
```typescript
// service/src/models/keyword-history.ts
import mongoose, { Document, Schema } from 'mongoose';
import { Keyword } from '../types/keyword';

export interface KeywordHistoryDocument extends Document {
  productTitle: string;
  productDescription: string;
  category?: string;
  keywords: Keyword[];
  processingTimeMs: number;
  cacheHit: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const KeywordHistorySchema = new Schema<KeywordHistoryDocument>({
  productTitle: { type: String, required: true },
  productDescription: { type: String, required: true },
  category: String,
  keywords: [{
    text: String,
    category: { type: String, enum: ['intent', 'topic'] },
    relevanceScore: Number,
    searchVolume: { type: String, enum: ['low', 'medium', 'high'] }
  }],
  processingTimeMs: Number,
  cacheHit: Boolean
}, {
  timestamps: true
});

// Index for efficient queries
KeywordHistorySchema.index({ createdAt: -1 });
KeywordHistorySchema.index({ productTitle: 'text' });

export const KeywordHistoryModel = mongoose.model<KeywordHistoryDocument>(
  'KeywordHistory',
  KeywordHistorySchema
);
```

```typescript
// service/src/controllers/keyword-controller.ts
import { Elysia, t } from 'elysia';
import { KeywordStrategist } from '../services/keyword-strategist';
import { KeywordHistoryModel } from '../models/keyword-history';
import { KeywordGenerationRequestSchema } from '../types/keyword';
import pino from 'pino';

const logger = pino();

export class KeywordController {
  private strategist: KeywordStrategist;

  constructor(strategist: KeywordStrategist) {
    this.strategist = strategist;
  }

  async generateKeywords(request: { body: KeywordGenerationRequest }) {
    try {
      const { productTitle, productDescription, category, targetAudience } = request.body;
      
      const result = await this.strategist.generateKeywords({
        productTitle,
        productDescription,
        category,
        targetAudience
      });

      // Save to history
      await KeywordHistoryModel.create({
        productTitle,
        productDescription,
        category,
        keywords: result.keywords,
        processingTimeMs: result.processingTimeMs,
        cacheHit: result.cacheHit
      });

      return {
        success: true,
        data: result
      };
    } catch (error) {
      logger.error({ error }, 'Failed to generate keywords');
      throw error;
    }
  }

  async getHistory() {
    const history = await KeywordHistoryModel.find()
      .sort({ createdAt: -1 })
      .limit(50);
    
    return {
      success: true,
      data: history,
      count: history.length
    };
  }

  async getById(id: string) {
    const result = await KeywordHistoryModel.findById(id);
    
    if (!result) {
      throw new Error('Keyword generation not found');
    }

    return {
      success: true,
      data: result
    };
  }

  async clearCache(id: string) {
    // Implement cache clearing logic
    return {
      success: true,
      message: 'Cache cleared successfully'
    };
  }
}
```

```typescript
// service/src/routes/keyword-routes.ts
import { Elysia, t } from 'elysia';
import { KeywordController } from '../controllers/keyword-controller';
import { KeywordGenerationRequestSchema } from '../types/keyword';

export function createKeywordRoutes(strategist: any) {
  const controller = new KeywordController(strategist);

  return new Elysia({ prefix: '/api/keywords' })
    .post(
      '/generate',
      ({ body }) => controller.generateKeywords({ body }),
      {
        body: t.Object({
          productTitle: t.String({ minLength: 1, maxLength: 200 }),
          productDescription: t.String({ minLength: 1, maxLength: 2000 }),
          category: t.Optional(t.String()),
          targetAudience: t.Optional(t.String())
        })
      }
    )
    .get('/history', () => controller.getHistory())
    .get('/:id', ({ params: { id } }) => controller.getById(id))
    .delete('/:id/cache', ({ params: { id } }) => controller.clearCache(id));
}
```

```typescript
// service/src/index.ts
import { Elysia } from 'elysia';
import cors from '@elysiajs/cors';
import mongoose from 'mongoose';
import pino from 'pino';
import { KeywordStrategist } from './services/keyword-strategist';
import { createKeywordRoutes } from './routes/keyword-routes';
import { errorHandler } from './middleware/error-handler';

const logger = pino();
const PORT = process.env.PORT || 8080;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/facebook-automation';
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

// Connect to MongoDB
mongoose.connect(MONGODB_URI)
  .then(() => logger.info('Connected to MongoDB'))
  .catch(err => logger.error({ err }, 'MongoDB connection failed'));

// Initialize services
const strategist = new KeywordStrategist(OPENAI_API_KEY!);

// Create app
const app = new Elysia()
  .use(cors())
  .use(errorHandler)
  .get('/api/health', () => ({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    service: 'facebook-automation'
  }))
  .use(createKeywordRoutes(strategist))
  .listen(PORT);

logger.info(`Server running on http://localhost:${PORT}`);

export type App = typeof app;
```

## Acceptance Criteria

### Must Have
- [ ] POST /api/keywords/generate accepts product data and returns keywords
- [ ] GET /api/keywords/history returns last 50 generations
- [ ] GET /api/keywords/:id returns specific result
- [ ] DELETE /api/keywords/:id/cache clears cache
- [ ] GET /api/health returns service status
- [ ] CORS enabled for frontend
- [ ] All errors handled gracefully with proper HTTP status codes
- [ ] Request/response logged with Pino
- [ ] Zod validation on all endpoints

### Should Have
- [ ] Response times under 5 seconds (excluding OpenAI API call)
- [ ] Proper 404 handling for non-existent IDs
- [ ] Rate limit headers in responses

## Testing Requirements

### Unit Tests
- [ ] Test each controller method
- [ ] Test route definitions
- [ ] Test error handling middleware
- [ ] Test request validation

### Integration Tests
- [ ] Test full API flow with mocked OpenAI
- [ ] Test MongoDB persistence
- [ ] Test CORS headers
- [ ] Test health endpoint

### Manual Testing
- [ ] Test with Postman/curl
- [ ] Verify all endpoints return correct responses
- [ ] Test error cases (invalid input, missing fields)

## Definition of Done
- [ ] Code implemented
- [ ] Tests passing
- [ ] Code reviewed
- [ ] Documentation updated

## Notes
- Ensure proper error messages are returned to help frontend debugging
- Consider adding pagination for history endpoint in future

## References
- Task 001: `/tasks/001-project-setup.md`
- Task 002: `/tasks/002-keyword-strategist-service.md`
- ElysiaJS docs: https://elysiajs.com
