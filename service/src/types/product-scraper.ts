import { LanguageCode } from './keyword';

export interface ProductWithKeywords {
  _id: string;
  productTitle: string;
  category?: string;
  keywordCount: number;
  lastGenerated: Date;
  scrapeCount: number;
  lastScraped?: Date;
}

export interface TriggerScrapeRequest {
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

export interface ScrapeHistory {
  _id: string;
  productId: string;
  keywordsUsed: string[];
  postsFound: number;
  status: 'completed' | 'failed' | 'partial';
  errorMessage?: string;
  duration: number;
  scrapedAt: Date;
}
