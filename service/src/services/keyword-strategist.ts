import OpenAI from 'openai';
import pino from 'pino';
import { KeywordGenerationRequest, Keyword, KeywordGenerationResponse, LanguageCode } from '../types/keyword';
import { KEYWORD_GENERATION_PROMPT, SYSTEM_PROMPT, LANGUAGE_INSTRUCTIONS } from '../utils/prompt-templates';
import { RateLimiter } from '../utils/rate-limiter';
import { KeywordCache } from '../cache/keyword-cache';

const logger = pino();

const rateLimiter = new RateLimiter(
  parseInt(process.env.RATE_LIMIT_MAX || '10'),
  parseInt(process.env.RATE_LIMIT_WINDOW_MS || '60000')
);

const cache = new KeywordCache(
  parseInt(process.env.CACHE_TTL_MS || '86400000')
);

export class KeywordStrategist {
  private openai: OpenAI;
  private model: string;
  private baseURL: string;

  constructor(apiKey: string) {
    this.baseURL = process.env.OPENAI_BASE_URL || 'https://api.openai.com/v1';
    this.openai = new OpenAI({ 
      baseURL: this.baseURL,
      apiKey 
    });
    this.model = process.env.OPENAI_MODEL || 'gpt-4o-mini';
  }

  async generateKeywords(request: KeywordGenerationRequest): Promise<KeywordGenerationResponse> {
    const startTime = Date.now();
    const language = request.language || 'en';
    
    // Generate cache key (include language)
    const cacheKey = this.getCacheKey(request, language);
    
    // Check cache first
    const cached = await cache.get(cacheKey);
    if (cached) {
      logger.info({ cacheKey, processingTimeMs: Date.now() - startTime, language }, 'Cache hit');
      return { ...cached, cacheHit: true, language };
    }

    // Check rate limit
    if (!rateLimiter.allow()) {
      const resetTime = rateLimiter.getResetTime();
      logger.warn({ resetTime }, 'Rate limit exceeded');
      throw new Error(`Rate limit exceeded. Please try again in ${Math.ceil(resetTime / 1000)} seconds.`);
    }

    // Get language-specific instruction
    const languageInstruction = LANGUAGE_INSTRUCTIONS[language] || LANGUAGE_INSTRUCTIONS.en;
    
    // Generate prompt with language instruction
    const prompt = KEYWORD_GENERATION_PROMPT
      .replace('{title}', request.productTitle)
      .replace('{description}', request.productDescription)
      .replace('{category}', request.category || 'General')
      .replace('{language_instruction}', languageInstruction);

    logger.info({
      productTitle: request.productTitle,
      category: request.category,
      language,
      model: this.model,
      baseURL: this.baseURL
    }, 'Generating keywords');

    // Call OpenAI
    const response = await this.openai.chat.completions.create({
      model: this.model,
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: prompt }
      ],
      temperature: 0.7,
    });

    logger.info({ 
      choices: response.choices?.length,
      finishReason: response.choices?.[0]?.finish_reason,
      usage: response.usage 
    }, 'OpenAI response received');

    // Check if response has content
    if (!response.choices || response.choices.length === 0 || !response.choices[0]?.message?.content) {
      logger.error({ response }, 'Empty or invalid OpenAI response');
      throw new Error('AI returned empty response. Check your API key and model configuration.');
    }

    const keywords = this.parseKeywords(response.choices[0].message.content, language);
    
    if (keywords.length === 0) {
      logger.warn({ response: response.choices[0].message.content }, 'No keywords generated');
      throw new Error('Failed to generate keywords from AI response');
    }

    const result: KeywordGenerationResponse = {
      keywords,
      processingTimeMs: Date.now() - startTime,
      cacheHit: false,
      language,
    };

    // Cache the result
    await cache.set(cacheKey, result);

    logger.info({
      keywordsCount: keywords.length,
      processingTimeMs: result.processingTimeMs,
      cacheSize: cache.getSize(),
      language
    }, 'Keywords generated successfully');
    
    return result;
  }

  private getCacheKey(request: KeywordGenerationRequest, language: string): string {
    const normalized = {
      title: request.productTitle.toLowerCase().trim(),
      description: request.productDescription.toLowerCase().trim().substring(0, 100),
      category: (request.category || '').toLowerCase().trim(),
      language
    };
    return `${normalized.title}|${normalized.description}|${normalized.category}|${normalized.language}`;
  }

  private parseKeywords(content: string | null, language: string): Keyword[] {
    if (!content) {
      logger.warn('Content is null');
      return [];
    }

    logger.info({ rawContentLength: content.length, rawContentPreview: content.substring(0, 200) }, 'Parsing AI response');

    try {
      // Remove markdown code blocks if present
      let cleanContent = content.replace(/```json\s*/g, '').replace(/```\s*/g, '').trim();
      
      // Try to extract JSON from the response
      const jsonMatch = cleanContent.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        logger.warn({ content: cleanContent }, 'No JSON found in response');
        return [];
      }

      const parsed = JSON.parse(jsonMatch[0]);

      if (!parsed.keywords || !Array.isArray(parsed.keywords)) {
        logger.warn({ parsed }, 'Invalid keywords structure');
        return [];
      }

      logger.info({ keywordCount: parsed.keywords.length }, 'Keywords parsed successfully');

      // Validate and normalize each keyword
      return parsed.keywords
        .filter((k: any) => k.text && typeof k.text === 'string')
        .map((k: any) => ({
          text: k.text.trim(),
          category: (k.category === 'topic' ? 'topic' : 'intent') as 'intent' | 'topic',
          relevanceScore: Math.min(100, Math.max(0, parseInt(k.relevanceScore) || 50)),
          searchVolume: (['low', 'medium', 'high'].includes(k.searchVolume) ? k.searchVolume : 'medium') as 'low' | 'medium' | 'high',
          language: language as LanguageCode
        }))
        .slice(0, 20); // Limit to 20 keywords max
    } catch (error) {
      logger.error({ error, content }, 'Failed to parse keywords');
      return [];
    }
  }

  async clearCache(): Promise<void> {
    await cache.clear();
    logger.info('Cache cleared');
  }

  getCacheSize(): number {
    return cache.getSize();
  }
}
