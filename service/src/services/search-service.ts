import pino from 'pino';
import { PostSearchScraper } from '../scrapers/post-search';
import { SearchHistoryModel } from '../models/search-history';
import { SearchResult, SearchQuery } from '../types/scraper';

const logger = pino();

export class SearchService {
  private scraper: PostSearchScraper;

  constructor(scraper: PostSearchScraper) {
    this.scraper = scraper;
  }

  /**
   * Execute a search and save to history
   */
  async executeSearch(
    sessionId: string,
    query: SearchQuery,
    userId?: string
  ): Promise<SearchResult> {
    const startTime = Date.now();

    try {
      logger.info({ sessionId, query, userId }, 'Executing search');

      // Execute search
      const result = await this.scraper.searchPosts(sessionId, query);

      // Save to history
      await SearchHistoryModel.create({
        userId,
        keywords: query.keywords,
        pages: query.pages,
        dateFrom: query.dateFrom,
        dateTo: query.dateTo,
        results: result.posts,
        totalFound: result.totalFound,
        duration: Date.now() - startTime,
        status: 'completed',
        searchedAt: new Date(),
      });

      logger.info(
        { totalFound: result.totalFound, duration: Date.now() - startTime },
        'Search completed and saved'
      );

      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      
      logger.error({ sessionId, query, error }, 'Search failed');

      // Save failed search to history
      await SearchHistoryModel.create({
        userId,
        keywords: query.keywords,
        pages: query.pages,
        dateFrom: query.dateFrom,
        dateTo: query.dateTo,
        results: [],
        totalFound: 0,
        duration: Date.now() - startTime,
        status: 'failed',
        errorMessage,
        searchedAt: new Date(),
      });

      throw error;
    }
  }

  /**
   * Get search history
   */
  async getHistory(userId?: string, limit: number = 20) {
    return SearchHistoryModel.findRecent(userId, limit);
  }

  /**
   * Get search by ID
   */
  async getSearchById(id: string) {
    return SearchHistoryModel.findById(id);
  }

  /**
   * Search by keyword
   */
  async searchByKeyword(keyword: string) {
    return SearchHistoryModel.findByKeyword(keyword);
  }

  /**
   * Get search statistics
   */
  async getStatistics(userId?: string) {
    return SearchHistoryModel.getStatistics(userId);
  }

  /**
   * Delete search history
   */
  async deleteHistory(id: string) {
    return SearchHistoryModel.findByIdAndDelete(id);
  }

  /**
   * Clear old search history
   */
  async clearOldHistory(daysOld: number = 30) {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysOld);

    const result = await SearchHistoryModel.deleteMany({
      searchedAt: { $lt: cutoffDate }
    });

    logger.info({ deletedCount: result.deletedCount, daysOld }, 'Cleared old search history');
    return result;
  }
}

// Factory function
export function createSearchService(scraper?: PostSearchScraper): SearchService {
  const searchScraper = scraper || new PostSearchScraper(
    new (require('../scrapers/browser-pool').BrowserPool)(3)
  );
  return new SearchService(searchScraper);
}
