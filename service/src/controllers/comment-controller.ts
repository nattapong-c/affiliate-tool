import { EngagementSpecialist, CommentSettings } from '../services/engagement-specialist';
import { AppError } from '../middleware/error-handler';
import pino from 'pino';

const logger = pino();

export class CommentController {
  private engagementSpecialist: EngagementSpecialist;

  constructor(engagementSpecialist: EngagementSpecialist) {
    this.engagementSpecialist = engagementSpecialist;
  }

  /**
   * Generate comment options for a post
   */
  async generate(request: {
    body: {
      postId: string;
      productId: string;
      settings: CommentSettings;
    };
  }) {
    try {
      const { postId, productId, settings } = request.body;

      if (!postId || !productId) {
        throw new AppError('postId and productId are required', 400, 'MISSING_FIELDS');
      }

      const result = await this.engagementSpecialist.generateComments(
        postId,
        productId,
        settings
      );

      return {
        success: true,
        data: result,
      };
    } catch (error) {
      if (error instanceof AppError) throw error;
      logger.error({ error }, 'Controller: Failed to generate comments');
      throw new AppError('Failed to generate comments', 500, 'GENERATION_FAILED');
    }
  }

  /**
   * Get comments for a post
   */
  async getByPost(postId: string) {
    try {
      const comments = await this.engagementSpecialist.getCommentsByPost(postId);
      return {
        success: true,
        data: comments,
      };
    } catch (error) {
      logger.error({ error, postId }, 'Controller: Failed to get comments');
      throw new AppError('Failed to retrieve comments', 500, 'FETCH_FAILED');
    }
  }

  /**
   * Select a comment option
   */
  async selectOption(request: {
    params: { id: string };
    body: { index: number };
  }) {
    try {
      const { id } = request.params;
      const { index } = request.body;

      const result = await this.engagementSpecialist.selectComment(id, index);

      if (!result) {
        throw new AppError('Comment not found', 404, 'NOT_FOUND');
      }

      return {
        success: true,
        data: result,
      };
    } catch (error) {
      if (error instanceof AppError) throw error;
      logger.error({ error }, 'Controller: Failed to select comment');
      throw new AppError('Failed to select comment', 500, 'SELECTION_FAILED');
    }
  }
}
