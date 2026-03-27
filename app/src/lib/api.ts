import apiClient from './axios';
import { handleApiError } from '@/utils/api-error';

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

// Post Scout Types
export interface ScrapedPost {
  _id: string;
  url: string;
  postId: string;
  content: string;
  author: {
    name: string;
    profileUrl: string;
  };
  timestamp: string;
  engagement: {
    likes: number;
    comments: number;
    shares: number;
    total: number;
  };
  engagementDensity: number;
  images: string[];
  videos: string[];
  keywords: string[];
  language: LanguageCode;
  scrapedAt: string;
  status: 'new' | 'processed' | 'engaged' | 'skipped';
}

export interface PostStats {
  totalPosts: number;
  avgLikes: number;
  avgComments: number;
  avgShares: number;
  avgDensity: number;
  maxDensity: number;
}

export interface PostFilterParams {
  status?: 'new' | 'processed' | 'engaged' | 'skipped';
  minEngagement?: number;
  minDensity?: number;
  language?: LanguageCode;
  dateFrom?: string;
  dateTo?: string;
  keywords?: string;
  limit?: number;
  page?: number;
}

// Product Scraper Types
export interface ProductWithKeywords {
  _id: string;
  productTitle: string;
  category?: string;
  language: LanguageCode;
  keywordCount: number;
  lastGenerated: string;
  scrapeCount: number;
  lastScraped?: string;
}

export interface ScrapeResult {
  success: boolean;
  postsFound: number;
  searchQueries: number;
  duration: number;
  jobId: string;
}

// Keyword API
export const keywordApi = {
  generate: async (request: KeywordGenerationRequest): Promise<KeywordGenerationResponse> => {
    try {
      const response = await apiClient.post('/api/keywords/generate', request);
      return response.data.data;
    } catch (error) {
      handleApiError(error);
    }
  },

  getHistory: async (): Promise<KeywordHistoryItem[]> => {
    try {
      const response = await apiClient.get('/api/keywords/history');
      return response.data.data;
    } catch (error) {
      handleApiError(error);
    }
  },

  getById: async (id: string): Promise<KeywordHistoryItem> => {
    try {
      const response = await apiClient.get(`/api/keywords/${id}`);
      return response.data.data;
    } catch (error) {
      handleApiError(error);
    }
  },

  deleteHistory: async (id: string): Promise<void> => {
    try {
      await apiClient.delete(`/api/keywords/${id}`);
    } catch (error) {
      handleApiError(error);
    }
  },
};

// Post API
export const postApi = {
  getPosts: async (filter: PostFilterParams): Promise<{ posts: ScrapedPost[]; pagination: any }> => {
    try {
      const params = new URLSearchParams();
      if (filter.status) params.append('status', filter.status);
      if (filter.minDensity) params.append('minDensity', filter.minDensity.toString());
      if (filter.language) params.append('language', filter.language);
      if (filter.limit) params.append('limit', filter.limit.toString());
      if (filter.page) params.append('page', filter.page.toString());

      const response = await apiClient.get('/api/posts', { params });
      return response.data;
    } catch (error) {
      handleApiError(error);
    }
  },

  getHighEngagement: async (minDensity?: number, limit?: number): Promise<ScrapedPost[]> => {
    try {
      const params: any = {};
      if (minDensity) params.minDensity = minDensity;
      if (limit) params.limit = limit;

      const response = await apiClient.get('/api/posts/high-engagement', { params });
      return response.data.data;
    } catch (error) {
      handleApiError(error);
    }
  },

  getStatistics: async (): Promise<PostStats> => {
    try {
      const response = await apiClient.get('/api/posts/statistics');
      return response.data.data;
    } catch (error) {
      handleApiError(error);
    }
  },

  updateStatus: async (id: string, status: ScrapedPost['status']): Promise<ScrapedPost> => {
    try {
      const response = await apiClient.patch(`/api/posts/${id}/status`, { status });
      return response.data.data;
    } catch (error) {
      handleApiError(error);
    }
  },

  deletePost: async (id: string): Promise<void> => {
    try {
      await apiClient.delete(`/api/posts/${id}`);
    } catch (error) {
      handleApiError(error);
    }
  },

  getForEngagement: async (limit?: number): Promise<ScrapedPost[]> => {
    try {
      const params = limit ? { params: { limit } } : {};
      const response = await apiClient.get('/api/posts/for-engagement', params);
      return response.data.data;
    } catch (error) {
      handleApiError(error);
    }
  },
};

// Product Scraper API
export const productScraperApi = {
  getProducts: async (filters?: { language?: LanguageCode; search?: string }): Promise<ProductWithKeywords[]> => {
    try {
      const params: any = {};
      if (filters?.language) params.language = filters.language;
      if (filters?.search) params.search = filters.search;

      const response = await apiClient.get('/api/products', { params });
      return response.data;
    } catch (error) {
      handleApiError(error);
    }
  },

  getProductById: async (id: string): Promise<any> => {
    try {
      const response = await apiClient.get(`/api/products/${id}`);
      return response.data.data;
    } catch (error) {
      handleApiError(error);
    }
  },

  triggerScrape: async (
    id: string,
    options?: { maxResults?: number; daysBack?: number }
  ): Promise<ScrapeResult> => {
    try {
      const body: any = {};
      if (options?.maxResults) body.maxResults = options.maxResults;
      if (options?.daysBack) body.dateRange = { daysBack: options.daysBack };

      const response = await apiClient.post(`/api/products/${id}/scrape`, body, {
        params: { sessionId: 'web' },
      });
      return response.data.data;
    } catch (error) {
      handleApiError(error);
    }
  },

  getScrapeHistory: async (id: string, limit?: number): Promise<any[]> => {
    try {
      const params = limit ? { params: { limit } } : {};
      const response = await apiClient.get(`/api/products/${id}/scrape-history`, params);
      return response.data.data;
    } catch (error) {
      handleApiError(error);
    }
  },

  // Scrape from keyword history
  scrapeFromHistory: async (
    productTitle: string,
    keywords: string[],
    options?: { maxResults?: number; daysBack?: number }
  ): Promise<ScrapeResult> => {
    try {
      // Create a temporary product entry or use existing search endpoint
      const body: any = {
        keywords,
        productTitle,
      };
      if (options?.maxResults) body.maxResults = options.maxResults;
      if (options?.daysBack) body.dateRange = { daysBack: options.daysBack };

      const response = await apiClient.post('/api/products/scrape-from-keywords', body, {
        params: { sessionId: 'web' },
      });
      return response.data.data;
    } catch (error) {
      handleApiError(error);
    }
  },
};
