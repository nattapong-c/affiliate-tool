// Facebook session and scraper types

export interface FacebookSession {
  userId: string;
  cookies: Array<{
    name: string;
    value: string;
    domain: string;
    path: string;
    expires?: number;
    httpOnly?: boolean;
    secure?: boolean;
  }>;
  userAgent: string;
  createdAt: Date;
  lastUsed: Date;
  isActive: boolean;
}

export interface ScrapedPost {
  id: string;
  url: string;
  postId: string;
  content: string;
  author: {
    name: string;
    profileUrl: string;
  };
  timestamp: Date;
  engagement: {
    likes: number;
    comments: number;
    shares: number;
    total: number;
  };
  reactions: {
    like: number;
    love: number;
    haha: number;
    wow: number;
    sad: number;
    angry: number;
  };
  engagementDensity: number;
  images: string[];
  videos: string[];
  keywords: string[];
  scrapedAt: Date;
  status: 'new' | 'processed' | 'engaged' | 'skipped';
}

export interface ScraperConfig {
  headless: boolean;
  stealth: boolean;
  maxConcurrent: number;
  requestDelay: number;
  userAgent: string;
  timeout: number;
}

export interface SearchQuery {
  keywords: string[];
  pages?: string[]; // Liked pages to search
  dateFrom: Date;
  dateTo: Date;
  maxResults: number;
}

export interface SearchResult {
  query: SearchQuery;
  posts: Array<{
    url: string;
    snippet: string;
    relevanceScore: number;
  }>;
  totalFound: number;
  searchedAt: Date;
}

export interface BrowserSession {
  id: string;
  browser: any; // Playwright browser instance
  context: any; // Browser context
  page: any; // Page instance
  createdAt: Date;
  lastUsed: Date;
  isActive: boolean;
}

export interface ScraperStats {
  totalScraped: number;
  successfulScrapes: number;
  failedScrapes: number;
  averageResponseTime: number;
  lastScrapeAt: Date | null;
}
