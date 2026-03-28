import pino from 'pino';
import { ScrapedPostModel as ScrapedPostModelInstance, ScrapedPostModel as ScrapedPostModelType } from '../models/scraped-post';
import { engagementCalculator } from '../utils/engagement-calculator';

const logger = pino();
const ScrapedPostModel = ScrapedPostModelInstance as any as ScrapedPostModelType;

export interface PostFilter {
  status?: 'new' | 'processed' | 'engaged' | 'skipped';
  minEngagement?: number;
  minDensity?: number;
  dateFrom?: Date;
  dateTo?: Date;
  keywords?: string[];
  limit?: number;
  page?: number;
}

export class PostFilterService {
  /**
   * Get filtered posts
   */
  async getFilteredPosts(filter: PostFilter) {
    const query: any = {};

    // Status filter - support both single status and array of statuses
    if (filter.status) {
      if (Array.isArray(filter.status)) {
        query.status = { $in: filter.status };
      } else {
        query.status = filter.status;
      }
    }

    // Date filter
    if (filter.dateFrom || filter.dateTo) {
      query.timestamp = {};
      if (filter.dateFrom) {
        query.timestamp.$gte = filter.dateFrom;
      }
      if (filter.dateTo) {
        query.timestamp.$lte = filter.dateTo;
      }
    }

    // Keyword filter
    if (filter.keywords && filter.keywords.length > 0) {
      query.$or = [
        { keywords: { $in: filter.keywords.map(k => new RegExp(k, 'i')) } },
        { content: { $regex: filter.keywords.join('|'), $options: 'i' } }
      ];
    }

    // Execute query
    let postsQuery = ScrapedPostModel.find(query);

    // Engagement density filter
    if (filter.minDensity !== undefined) {
      postsQuery = postsQuery.gte('engagementDensity', filter.minDensity);
    }

    // Sorting
    postsQuery = postsQuery.sort({ engagementDensity: -1, scrapedAt: -1 });

    // Pagination
    const limit = filter.limit || 50;
    const page = filter.page || 1;
    const skip = (page - 1) * limit;

    postsQuery = postsQuery.skip(skip).limit(limit);

    const posts = await postsQuery.exec();
    const total = await ScrapedPostModel.countDocuments(query);

    logger.info(
      { filter, total, returned: posts.length, page, limit },
      'Posts filtered'
    );

    return {
      posts,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
        hasMore: skip + posts.length < total,
      },
    };
  }

  /**
   * Get high-engagement posts
   */
  async getHighEngagementPosts(minDensity: number = 1, limit: number = 20) {
    const posts = await ScrapedPostModel.findHighEngagement(minDensity, limit);
    
    logger.info({ count: posts.length, minDensity }, 'High engagement posts retrieved');
    
    return posts;
  }

  /**
   * Get recent posts
   */
  async getRecentPosts(daysBack: number = 30, limit: number = 50) {
    const posts = await ScrapedPostModel.findRecent(daysBack, limit);
    
    logger.info({ count: posts.length, daysBack }, 'Recent posts retrieved');
    
    return posts;
  }

  /**
   * Get posts by keyword
   */
  async getPostsByKeyword(keyword: string) {
    const posts = await ScrapedPostModel.findByKeyword(keyword);
    
    logger.info({ keyword, count: posts.length }, 'Posts by keyword retrieved');
    
    return posts;
  }

  /**
   * Get engagement statistics
   */
  async getEngagementStats() {
    const stats = await ScrapedPostModel.getEngagementStats();
    
    logger.info({ stats }, 'Engagement statistics retrieved');
    
    return stats;
  }

  /**
   * Get posts by status
   */
  async getPostsByStatus(status: string) {
    const posts = await ScrapedPostModel.findByStatus(status);
    
    logger.info({ status, count: posts.length }, 'Posts by status retrieved');
    
    return posts;
  }

  /**
   * Update post status
   */
  async updatePostStatus(id: string, status: 'new' | 'processed' | 'engaged' | 'skipped') {
    const post = await ScrapedPostModel.updateStatus(id, status);
    
    if (post) {
      logger.info({ id, status }, 'Post status updated');
    } else {
      logger.warn({ id }, 'Post not found for status update');
    }
    
    return post;
  }

  /**
   * Delete post
   */
  async deletePost(id: string) {
    const result = await ScrapedPostModel.findByIdAndDelete(id);
    
    if (result) {
      logger.info({ id }, 'Post deleted');
    } else {
      logger.warn({ id }, 'Post not found for deletion');
    }
    
    return result;
  }

  /**
   * Mark posts as processed
   */
  async markAsProcessed(ids: string[]) {
    const result = await ScrapedPostModel.updateMany(
      { _id: { $in: ids } },
      { $set: { status: 'processed' } }
    );
    
    logger.info({ modified: result.modifiedCount }, 'Posts marked as processed');
    
    return result;
  }

  /**
   * Get posts for engagement (high density, not yet engaged)
   */
  async getPostsForEngagement(limit: number = 10) {
    const posts = await ScrapedPostModel.find({
      status: { $in: ['new', 'processed'] },
      engagementDensity: { $gte: 1 }
    })
      .sort({ engagementDensity: -1 })
      .limit(limit);
    
    logger.info({ count: posts.length }, 'Posts for engagement retrieved');
    
    return posts;
  }

  /**
   * Analyze posts and rank by engagement potential
   */
  async analyzeAndRank(limit: number = 20) {
    const posts = await ScrapedPostModel.find({
      status: { $in: ['new', 'processed'] }
    })
      .sort({ engagementDensity: -1 })
      .limit(limit);
    
    // Add analysis to each post
    const rankedPosts = posts.map(post => {
      const analysis = engagementCalculator.analyze(
        post.engagement,
        post.timestamp
      );
      
      return {
        ...post.toObject(),
        analysis,
        qualityScore: engagementCalculator.getQualityScore(post.engagement),
      };
    });
    
    logger.info({ count: rankedPosts.length }, 'Posts analyzed and ranked');
    
    return rankedPosts;
  }

  /**
   * Clean up old posts
   */
  async cleanupOldPosts(daysOld: number = 90) {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysOld);
    
    const result = await ScrapedPostModel.deleteMany({
      timestamp: { $lt: cutoffDate },
      status: { $in: ['skipped'] }
    });
    
    logger.info({ deletedCount: result.deletedCount, daysOld }, 'Old posts cleaned up');
    
    return result;
  }
}

// Factory function
export function createPostFilterService(): PostFilterService {
  return new PostFilterService();
}
