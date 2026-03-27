import { KeywordStrategist } from '../services/keyword-strategist';
import { KeywordHistoryModel } from '../models/keyword-history';
import { KeywordGenerationRequest } from '../types/keyword';
import { AppError } from '../middleware/error-handler';
import pino from 'pino';

const logger = pino();

export class KeywordController {
  private strategist: KeywordStrategist;

  constructor(strategist: KeywordStrategist) {
    this.strategist = strategist;
  }

  async generateKeywords(request: { body: KeywordGenerationRequest }) {
    try {
      const { productTitle, productDescription, category, targetAudience, language } = request.body;
      
      logger.info({ productTitle, category, language }, 'Generating keywords');
      
      const result = await this.strategist.generateKeywords({
        productTitle,
        productDescription,
        category,
        targetAudience,
        language
      });

      // Save to history
      await KeywordHistoryModel.create({
        productTitle,
        productDescription,
        category,
        targetAudience,
        language: result.language,
        keywords: result.keywords,
        processingTimeMs: result.processingTimeMs,
        cacheHit: result.cacheHit
      });

      logger.info({ keywordsCount: result.keywords.length, language: result.language }, 'Keywords saved to history');

      return {
        success: true,
        data: result
      };
    } catch (error) {
      if (error instanceof Error && error.message.includes('Rate limit')) {
        throw new AppError(error.message, 429, 'RATE_LIMIT_EXCEEDED');
      }
      logger.error({ error }, 'Failed to generate keywords');
      throw new AppError('Failed to generate keywords', 500, 'KEYWORD_GENERATION_FAILED');
    }
  }

  async getHistory() {
    try {
      const history = await KeywordHistoryModel.find()
        .sort({ createdAt: -1 })
        .limit(50)
        .lean();
      
      return {
        success: true,
        data: history,
        count: history.length
      };
    } catch (error) {
      logger.error({ error }, 'Failed to get history');
      throw new AppError('Failed to get history', 500, 'HISTORY_FETCH_FAILED');
    }
  }

  async getById(id: string) {
    try {
      const result = await KeywordHistoryModel.findById(id).lean();
      
      if (!result) {
        throw new AppError('Keyword generation not found', 404, 'NOT_FOUND');
      }

      return {
        success: true,
        data: result
      };
    } catch (error) {
      if (error instanceof AppError) throw error;
      logger.error({ error, id }, 'Failed to get keyword generation');
      throw new AppError('Failed to get keyword generation', 500, 'FETCH_FAILED');
    }
  }

  async clearCache(id: string) {
    try {
      await this.strategist.clearCache();
      
      return {
        success: true,
        message: 'Cache cleared successfully'
      };
    } catch (error) {
      logger.error({ error }, 'Failed to clear cache');
      throw new AppError('Failed to clear cache', 500, 'CACHE_CLEAR_FAILED');
    }
  }

  async deleteHistory(id: string) {
    try {
      const result = await KeywordHistoryModel.findByIdAndDelete(id);
      
      if (!result) {
        throw new AppError('Keyword generation not found', 404, 'NOT_FOUND');
      }

      return {
        success: true,
        message: 'History deleted successfully'
      };
    } catch (error) {
      if (error instanceof AppError) throw error;
      logger.error({ error, id }, 'Failed to delete history');
      throw new AppError('Failed to delete history', 500, 'DELETE_FAILED');
    }
  }
}
