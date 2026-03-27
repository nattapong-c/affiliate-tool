import { z } from 'zod';

export type LanguageCode = 'en' | 'th';

export const KeywordGenerationRequestSchema = z.object({
  productTitle: z.string().min(1).max(200),
  productDescription: z.string().min(1).max(2000),
  category: z.string().optional(),
  targetAudience: z.string().optional(),
  language: z.enum(['en', 'th']).optional().default('en'),
});

export type KeywordGenerationRequest = z.infer<typeof KeywordGenerationRequestSchema>;

export interface Keyword {
  text: string;
  category: 'intent' | 'topic';
  relevanceScore: number;
  searchVolume: 'low' | 'medium' | 'high';
  language?: LanguageCode;
}

export interface KeywordGenerationResponse {
  keywords: Keyword[];
  processingTimeMs: number;
  cacheHit: boolean;
  language: LanguageCode;
}
