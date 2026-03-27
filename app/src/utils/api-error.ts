import { AxiosError } from 'axios';

export interface ApiErrorResponse {
  success: boolean;
  error?: {
    code?: string;
    message?: string;
    details?: Array<{
      field?: string;
      message?: string;
    }>;
  };
}

export class ApiError extends Error {
  public status: number;
  public code: string;
  public details?: Array<{ field?: string; message?: string }>;

  constructor(status: number, code: string, message: string, details?: Array<{ field?: string; message?: string }>) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.code = code;
    this.details = details;
  }

  static fromAxiosError(error: AxiosError<ApiErrorResponse>): ApiError {
    const status = error.response?.status || 500;
    const data = error.response?.data;
    
    const message = data?.error?.message || error.message || 'An error occurred';
    const code = data?.error?.code || 'UNKNOWN_ERROR';
    const details = data?.error?.details;

    return new ApiError(status, code, message, details);
  }

  // Helper methods for common error types
  isValidationError(): boolean {
    return this.status === 400 || this.code === 'VALIDATION_ERROR';
  }

  isNotFoundError(): boolean {
    return this.status === 404 || this.code === 'NOT_FOUND';
  }

  isUnauthorizedError(): boolean {
    return this.status === 401 || this.code === 'UNAUTHORIZED';
  }

  isServerError(): boolean {
    return this.status >= 500;
  }

  // Get user-friendly error message
  getUserMessage(): string {
    if (this.isValidationError()) {
      return 'Please check your input and try again';
    }
    if (this.isNotFoundError()) {
      return 'The requested resource was not found';
    }
    if (this.isUnauthorizedError()) {
      return 'Please log in to continue';
    }
    if (this.isServerError()) {
      return 'A server error occurred. Please try again later';
    }
    return this.message;
  }
}

export function handleApiError(error: unknown): never {
  if (error instanceof AxiosError) {
    throw ApiError.fromAxiosError(error as AxiosError<ApiErrorResponse>);
  }
  if (error instanceof Error) {
    throw error;
  }
  throw new Error('An unknown error occurred');
}

export function getErrorMessage(error: unknown): string {
  if (error instanceof ApiError) {
    return error.getUserMessage();
  }
  if (error instanceof Error) {
    return error.message;
  }
  return 'An unknown error occurred';
}
