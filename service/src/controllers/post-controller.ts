import { Elysia, t } from 'elysia';
import { PostFilterService } from '../services/post-filter-service';
import pino from 'pino';

const logger = pino();

export class PostController {
  private postFilterService: PostFilterService;

  constructor(postFilterService: PostFilterService) {
    this.postFilterService = postFilterService;
  }

  /**
   * Get filtered posts
   */
  async getPosts(request: {
    query?: {
      status?: 'new' | 'processed' | 'engaged' | 'skipped';
      minEngagement?: number;
      minDensity?: number;
      language?: 'en' | 'th';
      dateFrom?: string;
      dateTo?: string;
      keywords?: string;
      limit?: number;
      page?: number;
    };
  }) {
    const filter: any = {};

    // Default to showing 'new' and 'processed' posts if no status specified
    if (request.query?.status) {
      filter.status = request.query.status;
    } else {
      // Show all posts except 'skipped' by default
      filter.status = ['new', 'processed', 'engaged'];
    }
    
    if (request.query?.minEngagement) filter.minEngagement = request.query.minEngagement;
    if (request.query?.minDensity) filter.minDensity = request.query.minDensity;
    if (request.query?.language) filter.language = request.query.language;
    if (request.query?.dateFrom) filter.dateFrom = new Date(request.query.dateFrom);
    if (request.query?.dateTo) filter.dateTo = new Date(request.query.dateTo);
    if (request.query?.keywords) filter.keywords = request.query.keywords.split(',');
    if (request.query?.limit) filter.limit = request.query.limit;
    if (request.query?.page) filter.page = request.query.page;

    logger.info({ filter, query: request.query }, 'Getting posts with filter');

    const result = await this.postFilterService.getFilteredPosts(filter);

    logger.info({ count: result.posts.length, total: result.pagination.total }, 'Posts retrieved');

    return {
      success: true,
      data: {
        posts: result.posts,
        pagination: result.pagination,
      },
    };
  }

  /**
   * Get high engagement posts
   */
  async getHighEngagement(request: {
    query?: { minDensity?: number; limit?: number };
  }) {
    const minDensity = request.query?.minDensity || 1;
    const limit = request.query?.limit || 20;

    const posts = await this.postFilterService.getHighEngagementPosts(minDensity, limit);

    return {
      success: true,
      data: posts,
      count: posts.length,
    };
  }

  /**
   * Get recent posts
   */
  async getRecent(request: {
    query?: { daysBack?: number; limit?: number };
  }) {
    const daysBack = request.query?.daysBack || 30;
    const limit = request.query?.limit || 50;

    const posts = await this.postFilterService.getRecentPosts(daysBack, limit);

    return {
      success: true,
      data: posts,
      count: posts.length,
    };
  }

  /**
   * Get posts by keyword
   */
  async getByKeyword(request: { query: { keyword: string } }) {
    const posts = await this.postFilterService.getPostsByKeyword(request.query.keyword);

    return {
      success: true,
      data: posts,
      count: posts.length,
    };
  }

  /**
   * Get engagement statistics
   */
  async getStatistics() {
    const stats = await this.postFilterService.getEngagementStats();

    return {
      success: true,
      data: stats,
    };
  }

  /**
   * Update post status
   */
  async updateStatus(request: {
    params: { id: string };
    body: { status: 'new' | 'processed' | 'engaged' | 'skipped' };
  }) {
    const post = await this.postFilterService.updatePostStatus(
      request.params.id,
      request.body.status
    );

    if (!post) {
      throw new Error('Post not found');
    }

    return {
      success: true,
      data: post,
    };
  }

  /**
   * Delete post
   */
  async deletePost(request: { params: { id: string } }) {
    await this.postFilterService.deletePost(request.params.id);

    return {
      success: true,
      message: 'Post deleted',
    };
  }

  /**
   * Mark posts as processed
   */
  async markAsProcessed(request: { body: { ids: string[] } }) {
    await this.postFilterService.markAsProcessed(request.body.ids);

    return {
      success: true,
      message: 'Posts marked as processed',
    };
  }

  /**
   * Get posts for engagement
   */
  async getForEngagement(request: { query?: { limit?: number } }) {
    const limit = request.query?.limit || 10;
    const posts = await this.postFilterService.getPostsForEngagement(limit);

    return {
      success: true,
      data: posts,
      count: posts.length,
    };
  }

  /**
   * Analyze and rank posts
   */
  async analyzeAndRank(request: { query?: { limit?: number } }) {
    const limit = request.query?.limit || 20;
    const posts = await this.postFilterService.analyzeAndRank(limit);

    return {
      success: true,
      data: posts,
      count: posts.length,
    };
  }
}
