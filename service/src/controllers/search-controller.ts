import { Elysia, t } from 'elysia';
import { SearchService } from '../services/search-service';
import pino from 'pino';

const logger = pino();

export class SearchController {
  private searchService: SearchService;

  constructor(searchService: SearchService) {
    this.searchService = searchService;
  }

  /**
   * Execute search
   */
  async search(request: {
    body: {
      keywords: string[];
      pages?: string[];
      dateFrom: string;
      dateTo: string;
      maxResults?: number;
    };
    query?: { sessionId?: string; userId?: string };
  }) {
    try {
      const sessionId = request.query?.sessionId || 'default';
      const userId = request.query?.userId;

      const result = await this.searchService.executeSearch(sessionId, {
        keywords: request.body.keywords,
        pages: request.body.pages,
        dateFrom: new Date(request.body.dateFrom),
        dateTo: new Date(request.body.dateTo),
        maxResults: request.body.maxResults || 20,
      }, userId);

      return {
        success: true,
        data: result,
      };
    } catch (error) {
      logger.error({ error }, 'Search failed');
      throw error;
    }
  }

  /**
   * Get search history
   */
  async getHistory(request: { query?: { userId?: string; limit?: number } }) {
    const userId = request.query?.userId;
    const limit = request.query?.limit || 20;

    const history = await this.searchService.getHistory(userId, limit);

    return {
      success: true,
      data: history,
      count: history.length,
    };
  }

  /**
   * Get search by ID
   */
  async getSearchById(request: { params: { id: string } }) {
    const search = await this.searchService.getSearchById(request.params.id);

    if (!search) {
      throw new Error('Search not found');
    }

    return {
      success: true,
      data: search,
    };
  }

  /**
   * Get search statistics
   */
  async getStatistics(request: { query?: { userId?: string } }) {
    const stats = await this.searchService.getStatistics(request.query?.userId);

    return {
      success: true,
      data: stats,
    };
  }

  /**
   * Delete search history
   */
  async deleteHistory(request: { params: { id: string } }) {
    await this.searchService.deleteHistory(request.params.id);

    return {
      success: true,
      message: 'Search history deleted',
    };
  }
}
