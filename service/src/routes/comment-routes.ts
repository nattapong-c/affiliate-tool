import { Elysia, t } from 'elysia';
import { EngagementSpecialist } from '../services/engagement-specialist';
import { CommentController } from '../controllers/comment-controller';

export function createCommentRoutes(engagementSpecialist: EngagementSpecialist) {
  const controller = new CommentController(engagementSpecialist);

  return new Elysia({ prefix: '/api/comments' })
    // Generate comment options
    .post(
      '/generate',
      (request) => controller.generate(request as any),
      {
        body: t.Object({
          postId: t.String(),
          productId: t.String(),
          settings: t.Object({
            language: t.Enum({ en: 'en', th: 'th' }),
            emotion: t.String(),
            length: t.Enum({ short: 'short', medium: 'medium', long: 'long' }),
            customPrompt: t.Optional(t.String()),
          }),
        }),
      }
    )
    // Get comments for a post
    .get('/post/:postId', ({ params: { postId } }) => controller.getByPost(postId))
    // Select a comment option
    .patch(
      '/:id/select',
      (request) => controller.selectOption(request as any),
      {
        body: t.Object({
          index: t.Number(),
        }),
      }
    );
}
