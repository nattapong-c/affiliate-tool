import { treaty } from '@elysiajs/eden';
import type { App } from '../../service/src/index';

export const api = treaty<App>(process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080');

export type LanguageCode = 'en' | 'th';

export interface KeywordGenerationRequest {
  productTitle: string;
  productDescription: string;
  category?: string;
  targetAudience?: string;
  language?: LanguageCode;
}

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

export interface KeywordHistoryItem {
  _id: string;
  productTitle: string;
  productDescription: string;
  category?: string;
  language: LanguageCode;
  keywords: Keyword[];
  processingTimeMs: number;
  cacheHit: boolean;
  createdAt: string;
  updatedAt: string;
}

export const keywordApi = {
  generate: async (request: KeywordGenerationRequest): Promise<KeywordGenerationResponse> => {
    const { data, error } = await api.api.keywords.generate.post(request);
    if (error) {
      throw new Error(error.value?.error?.message || 'Failed to generate keywords');
    }
    return data.data as KeywordGenerationResponse;
  },

  getHistory: async (): Promise<KeywordHistoryItem[]> => {
    const { data, error } = await api.api.keywords.history.get();
    if (error) {
      throw new Error(error.value?.error?.message || 'Failed to get history');
    }
    return data.data as KeywordHistoryItem[];
  },

  getById: async (id: string): Promise<KeywordHistoryItem> => {
    const { data, error } = await api.api.keywords[id].get();
    if (error) {
      throw new Error(error.value?.error?.message || 'Failed to get keyword generation');
    }
    return data.data as KeywordHistoryItem;
  },

  deleteHistory: async (id: string): Promise<void> => {
    const { error } = await api.api.keywords[id].delete();
    if (error) {
      throw new Error(error.value?.error?.message || 'Failed to delete history');
    }
  }
};
