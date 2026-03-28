import { Elysia, t } from 'elysia';
import { KeywordStrategist } from '../services/keyword-strategist';
import { KeywordController } from '../controllers/keyword-controller';

export function createKeywordRoutes(strategist: KeywordStrategist) {
  const controller = new KeywordController(strategist);

  return new Elysia({ prefix: '/api/keywords' })
    // Generate keywords
    .post(
      '/generate',
      ({ body }) => controller.generateKeywords({ 
        body: {
          ...body,
          language: body.language || 'en'
        } 
      }),
      {
        body: t.Object({
          productTitle: t.String({ minLength: 1, maxLength: 200 }),
          productDescription: t.String({ minLength: 1, maxLength: 2000 }),
          productUrl: t.Optional(t.String()),
          category: t.Optional(t.String()),
          targetAudience: t.Optional(t.String()),
          language: t.Optional(t.Enum({ en: 'en', th: 'th' }))
        })
      }
    )
    // Get generation history
    .get('/history', () => controller.getHistory())
    // Get specific generation by ID
    .get('/:id', ({ params: { id } }) => controller.getById(id))
    // Clear cache
    .delete('/cache', () => controller.clearCache(''))
    // Delete history entry
    .delete('/:id', ({ params: { id } }) => controller.deleteHistory(id));
}
