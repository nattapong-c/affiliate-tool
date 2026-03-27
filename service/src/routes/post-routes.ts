import { Elysia, t } from 'elysia';
import { PostController } from '../controllers/post-controller';
import { createPostFilterService } from '../services/post-filter-service';

export function createPostRoutes() {
  const postFilterService = createPostFilterService();
  const controller = new PostController(postFilterService);

  return new Elysia({ prefix: '/api/posts' })
    // Get filtered posts
    .get('/', (request) => controller.getPosts(request as any))
    // Get high engagement posts
    .get('/high-engagement', (request) => controller.getHighEngagement(request as any))
    // Get recent posts
    .get('/recent', (request) => controller.getRecent(request as any))
    // Get posts by keyword
    .get('/keyword', (request) => controller.getByKeyword(request as any))
    // Get engagement statistics
    .get('/statistics', () => controller.getStatistics())
    // Get posts for engagement
    .get('/for-engagement', (request) => controller.getForEngagement(request as any))
    // Analyze and rank posts
    .get('/analyze-rank', (request) => controller.analyzeAndRank(request as any))
    // Update post status
    .patch(
      '/:id/status',
      (request) => controller.updateStatus(request as any),
      {
        body: t.Object({
          status: t.Enum({
            new: 'new',
            processed: 'processed',
            engaged: 'engaged',
            skipped: 'skipped',
          }),
        }),
      }
    )
    // Mark posts as processed
    .post(
      '/mark-processed',
      (request) => controller.markAsProcessed(request as any),
      {
        body: t.Object({
          ids: t.Array(t.String()),
        }),
      }
    )
    // Delete post
    .delete('/:id', (request) => controller.deletePost(request as any));
}
