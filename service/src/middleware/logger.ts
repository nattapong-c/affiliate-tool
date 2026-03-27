import { Elysia } from 'elysia';
import pino from 'pino';

const logger = pino();

export function loggerMiddleware() {
  return new Elysia()
    .onRequest(({ request }) => {
      const url = new URL(request.url);
      logger.info(
        {
          method: request.method,
          path: url.pathname,
          query: Object.fromEntries(url.searchParams)
        },
        'Request received'
      );
    })
    .onAfterHandle(({ request, code }) => {
      const url = new URL(request.url);
      logger.info(
        {
          method: request.method,
          path: url.pathname,
          status: code
        },
        'Response sent'
      );
    });
}
