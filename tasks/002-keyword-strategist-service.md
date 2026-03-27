# Task 002: Keyword Strategist - Backend Service

## Overview
Implement the Keyword Strategist AI agent service that generates keywords from Shopee product data using OpenAI GPT-4o.

## Type
- [x] Backend
- [ ] Frontend
- [ ] Database
- [ ] Integration
- [ ] Testing
- [ ] Documentation

## Priority
- [x] Critical (P0)
- [ ] High (P1)
- [ ] Medium (P2)
- [ ] Low (P3)

## Dependencies
- [x] Depends on: Task 001 (project setup)
- [x] Blocks: Task 003, Task 004

## Requirements

### Functional Requirements
1. Accept product title and description as input
2. Generate 10-20 relevant keywords using OpenAI GPT-4o
3. Categorize keywords into "Intent-based" (users looking for solutions) and "Topic-based" (users discussing related niches)
4. Return keywords with relevance scores (0-100)
5. Optimize keywords for Facebook's search algorithm

### Technical Requirements
1. Use OpenAI GPT-4o-mini for cost efficiency
2. Implement rate limiting (max 10 requests/minute)
3. Cache results for 24 hours to reduce API calls
4. Log all requests with Pino logger
5. Use Zod for input/output validation

## Implementation Details

### Files to Create
- `service/src/services/keyword-strategist.ts` - Main service logic
- `service/src/types/keyword.ts` - TypeScript interfaces
- `service/src/utils/prompt-templates.ts` - OpenAI prompt templates
- `service/src/utils/rate-limiter.ts` - Rate limiting utility
- `service/src/cache/keyword-cache.ts` - In-memory cache implementation

### Files to Modify
- `service/src/index.ts` - Add new route (will be done in Task 003)

### Code Snippets
```typescript
// service/src/types/keyword.ts
import { z } from 'zod';

export const KeywordGenerationRequestSchema = z.object({
  productTitle: z.string().min(1).max(200),
  productDescription: z.string().min(1).max(2000),
  category: z.string().optional(),
  targetAudience: z.string().optional(),
});

export type KeywordGenerationRequest = z.infer<typeof KeywordGenerationRequestSchema>;

export interface Keyword {
  text: string;
  category: 'intent' | 'topic';
  relevanceScore: number;
  searchVolume: 'low' | 'medium' | 'high';
}

export interface KeywordGenerationResponse {
  keywords: Keyword[];
  processingTimeMs: number;
  cacheHit: boolean;
}
```

```typescript
// service/src/utils/prompt-templates.ts
export const KEYWORD_GENERATION_PROMPT = `You are a Keyword Strategist for Facebook affiliate marketing.

Analyze this Shopee product and generate high-relevance keywords for Facebook search.

Product Title: {title}
Product Description: {description}
Category: {category}

Generate 10-20 keywords categorized as:
- Intent-based: Users actively looking for this solution (e.g., "best wireless earbuds under 500")
- Topic-based: Users discussing related niches (e.g., "workout music setup", "commute essentials")

For each keyword, provide:
1. The keyword text
2. Category (intent/topic)
3. Relevance score (0-100)
4. Estimated search volume (low/medium/high)

Optimize for Facebook's search algorithm - prioritize natural language queries.

Respond in JSON format:
{
  "keywords": [
    {
      "text": "keyword phrase",
      "category": "intent",
      "relevanceScore": 95,
      "searchVolume": "high"
    }
  ]
}`;
```

```typescript
// service/src/services/keyword-strategist.ts
import OpenAI from 'openai';
import pino from 'pino';
import { KeywordGenerationRequest, Keyword, KeywordGenerationResponse } from '../types/keyword';
import { KEYWORD_GENERATION_PROMPT } from '../utils/prompt-templates';
import { RateLimiter } from '../utils/rate-limiter';
import { KeywordCache } from '../cache/keyword-cache';

const logger = pino();
const rateLimiter = new RateLimiter(10, 60); // 10 requests per 60 seconds
const cache = new KeywordCache(24 * 60 * 60 * 1000); // 24 hours TTL

export class KeywordStrategist {
  private openai: OpenAI;

  constructor(apiKey: string) {
    this.openai = new OpenAI({ apiKey });
  }

  async generateKeywords(request: KeywordGenerationRequest): Promise<KeywordGenerationResponse> {
    const startTime = Date.now();
    
    // Check cache first
    const cacheKey = this.getCacheKey(request);
    const cached = await cache.get(cacheKey);
    if (cached) {
      logger.info({ cacheKey }, 'Cache hit');
      return { ...cached, cacheHit: true };
    }

    // Check rate limit
    if (!rateLimiter.allow()) {
      throw new Error('Rate limit exceeded. Please try again later.');
    }

    // Generate prompt
    const prompt = KEYWORD_GENERATION_PROMPT
      .replace('{title}', request.productTitle)
      .replace('{description}', request.productDescription)
      .replace('{category}', request.category || 'General');

    // Call OpenAI
    const response = await this.openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: 'You are a keyword strategist for Facebook affiliate marketing.' },
        { role: 'user', content: prompt }
      ],
      temperature: 0.7,
      max_tokens: 2000,
    });

    const keywords = this.parseKeywords(response.choices[0].message.content);
    
    const result: KeywordGenerationResponse = {
      keywords,
      processingTimeMs: Date.now() - startTime,
      cacheHit: false,
    };

    // Cache the result
    await cache.set(cacheKey, result);

    logger.info({ keywordsCount: keywords.length, processingTimeMs: result.processingTimeMs }, 'Keywords generated');
    
    return result;
  }

  private getCacheKey(request: KeywordGenerationRequest): string {
    return `${request.productTitle}:${request.productDescription}:${request.category || ''}`;
  }

  private parseKeywords(content: string | null): Keyword[] {
    if (!content) return [];
    try {
      const parsed = JSON.parse(content);
      return parsed.keywords || [];
    } catch (error) {
      logger.error({ error, content }, 'Failed to parse keywords');
      return [];
    }
  }
}
```

## Acceptance Criteria

### Must Have
- [ ] KeywordStrategist class accepts product data and returns keywords
- [ ] Returns 10-20 keywords with categories (intent/topic)
- [ ] Each keyword has relevanceScore (0-100) and searchVolume
- [ ] Rate limiting enforced (throws error when exceeded)
- [ ] Cache works (24 hour TTL)
- [ ] All requests logged with Pino
- [ ] Zod validation for input/output

### Should Have
- [ ] Response includes processing time
- [ ] Cache hit/miss indicator in response
- [ ] Graceful error handling for OpenAI API failures

## Testing Requirements

### Unit Tests
- [ ] Test keyword generation with valid input
- [ ] Test rate limiting behavior
- [ ] Test cache hit/miss logic
- [ ] Test error handling for invalid input
- [ ] Test prompt template generation

### Integration Tests
- [ ] Test OpenAI API integration (mocked)
- [ ] Test full flow: request → cache check → API call → response

### Manual Testing
- [ ] Send sample product data via test script
- [ ] Verify keyword quality and categorization
- [ ] Verify rate limiting triggers after 10 requests/minute

## Definition of Done
- [ ] Code implemented
- [ ] Tests passing
- [ ] Code reviewed
- [ ] Documentation updated

## Notes
- Use GPT-4o-mini model for cost efficiency
- Prompt template should emphasize Facebook search optimization
- Cache key should be hashed for long product descriptions

## References
- Project spec: `AGENTS.md`
- OpenAI docs: https://platform.openai.com/docs
- Task 001: `/tasks/001-project-setup.md`
