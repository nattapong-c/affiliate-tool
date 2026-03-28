import OpenAI from 'openai';
import pino from 'pino';
import { COMMENT_GENERATION_PROMPT, COMMENT_SYSTEM_PROMPT } from '../utils/prompt-templates';
import { GeneratedCommentModel } from '../models/generated-comment';
import { ScrapedPostModel } from '../models/scraped-post';
import { KeywordHistoryModel } from '../models/keyword-history';

const logger = pino();

export interface CommentSettings {
  language: 'en' | 'th';
  emotion: string;
  length: 'short' | 'medium' | 'long';
  customPrompt?: string;
}

export class EngagementSpecialist {
  private openai: OpenAI;
  private model: string;

  constructor(apiKey: string) {
    this.openai = new OpenAI({ 
      baseURL: process.env.OPENAI_BASE_URL || 'https://api.openai.com/v1',
      apiKey 
    });
    this.model = process.env.OPENAI_MODEL || 'gpt-4o-mini';
  }

  async generateComments(
    postId: string,
    productId: string,
    settings: CommentSettings
  ) {
    try {
      // 1. Fetch Post and Product data
      const post = await ScrapedPostModel.findById(postId);
      const product = await KeywordHistoryModel.findById(productId);

      if (!post) {
        throw new Error('Post not found');
      }
      if (!product) {
        throw new Error('Product not found');
      }

      // 2. Prepare Prompt
      const prompt = COMMENT_GENERATION_PROMPT
        .replace('{postContent}', post.content)
        .replace('{productTitle}', product.productTitle)
        .replace('{productDescription}', product.productDescription)
        .replace('{language}', settings.language === 'th' ? 'Thai' : 'English')
        .replace('{emotion}', settings.emotion)
        .replace('{length}', settings.length)
        .replace('{customPrompt}', settings.customPrompt || 'None');

      logger.info({ postId, productId, settings }, 'Generating comments with AI');

      // 3. Call OpenAI
      const response = await this.openai.chat.completions.create({
        model: this.model,
        messages: [
          { role: 'system', content: COMMENT_SYSTEM_PROMPT },
          { role: 'user', content: prompt }
        ],
        response_format: { type: 'json_object' }
      });

      const content = response.choices[0]?.message?.content;
      if (!content) {
        throw new Error('AI returned empty response');
      }

      const parsed = JSON.parse(content);
      if (!parsed.options || !Array.isArray(parsed.options)) {
        throw new Error('Invalid AI response structure');
      }

      // 4. Save to Database
      const generatedComment = await GeneratedCommentModel.findOneAndUpdate(
        { postId, productId },
        {
          postId,
          productId,
          settings,
          options: parsed.options,
          status: 'draft'
        },
        { upsert: true, new: true }
      );

      logger.info({ id: generatedComment._id }, 'Comments generated and saved');

      return generatedComment;
    } catch (error) {
      logger.error({ error, postId, productId }, 'Failed to generate comments');
      throw error;
    }
  }

  async getCommentsByPost(postId: string) {
    return await GeneratedCommentModel.find({ postId }).populate('productId');
  }

  async selectComment(commentId: string, optionIndex: number) {
    return await GeneratedCommentModel.findByIdAndUpdate(
      commentId,
      { selectedOptionIndex: optionIndex },
      { new: true }
    );
  }
}
