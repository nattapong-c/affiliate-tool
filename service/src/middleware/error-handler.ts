import { Elysia, ValidationError } from 'elysia';
import pino from 'pino';

const logger = pino();

export class AppError extends Error {
  constructor(
    public message: string,
    public statusCode: number = 500,
    public code?: string
  ) {
    super(message);
    this.name = 'AppError';
  }
}

export function errorHandler() {
  return new Elysia()
    .onError(({ code, error, set }) => {
      logger.error({ code, error: error.message, stack: error.stack }, 'Error occurred');

      if (code === 'VALIDATION') {
        const validationError = error as ValidationError;
        set.status = 400;
        return {
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Invalid request data',
            details: validationError.errors.map((e: any) => ({
              field: e.path,
              message: e.message
            }))
          }
        };
      }

      if (error instanceof AppError) {
        set.status = error.statusCode;
        return {
          success: false,
          error: {
            code: error.code || 'APP_ERROR',
            message: error.message
          }
        };
      }

      if (code === 'NOT_FOUND') {
        set.status = 404;
        return {
          success: false,
          error: {
            code: 'NOT_FOUND',
            message: 'Endpoint not found'
          }
        };
      }

      // Default error
      set.status = 500;
      return {
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
        }
      };
    });
}
