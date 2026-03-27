export interface ScrapeSettings {
  scrollCount: number;      // 1-10
  minLikes: number;         // 0+
  minComments: number;      // 0+
  minShares: number;        // 0+
  maxPosts: number;         // 1-100
}

export const DEFAULT_SCRAPER_SETTINGS: ScrapeSettings = {
  scrollCount: 3,
  minLikes: 0,
  minComments: 0,
  minShares: 0,
  maxPosts: 20,
};

export interface ScrapeFeedRequest {
  scrollCount?: number;
  minLikes?: number;
  minComments?: number;
  minShares?: number;
  maxPosts?: number;
}

export interface ScrapeFeedResponse {
  postsFound: number;
  scrapedAt: string;
}
