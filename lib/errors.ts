// Error handling utilities

import { NextResponse } from 'next/server';
import { ApiError } from './types';

/**
 * Custom error class for application errors
 */
export class AppError extends Error {
  constructor(
    message: string,
    public statusCode: number = 500,
    public code?: string
  ) {
    super(message);
    this.name = 'AppError';
  }
}

/**
 * Create a safe error response (doesn't expose sensitive information)
 */
export function createErrorResponse(
  error: unknown,
  defaultMessage: string = 'An error occurred'
): NextResponse<ApiError> {
  // Log the actual error server-side (could integrate with logging service)
  if (process.env.NODE_ENV === 'development') {
    console.error('Error:', error);
  }

  // Don't expose sensitive error details in production
  if (error instanceof AppError) {
    return NextResponse.json(
      {
        error: error.message,
        code: error.code,
      },
      { status: error.statusCode }
    );
  }

  if (error instanceof Error && process.env.NODE_ENV === 'development') {
    return NextResponse.json(
      {
        error: defaultMessage,
        message: error.message,
      },
      { status: 500 }
    );
  }

  // Production: return generic error
  return NextResponse.json(
    {
      error: defaultMessage,
    },
    { status: 500 }
  );
}

/**
 * Validate required fields in request body
 */
export function validateRequiredFields<T extends Record<string, any>>(
  data: T,
  requiredFields: Array<keyof T | string>
): void {
  const missing = requiredFields.filter(field => {
    const value = data[field as keyof T];
    return value === undefined || value === null || value === '';
  });

  if (missing.length > 0) {
    throw new AppError(
      `Missing required fields: ${missing.join(', ')}`,
      400,
      'MISSING_FIELDS'
    );
  }
}

/**
 * Handle async errors in route handlers
 */
export function asyncHandler<T>(
  handler: (request: Request, context?: T) => Promise<NextResponse>
) {
  return async (request: Request, context?: T) => {
    try {
      return await handler(request, context);
    } catch (error) {
      return createErrorResponse(error);
    }
  };
}

/**
 * Client-side error message extractor
 */
export function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }
  if (typeof error === 'string') {
    return error;
  }
  return 'An unexpected error occurred';
}
