import { Elysia } from 'elysia';
import { AppError } from '../utils/errors';

export const errorHandler = new Elysia()
  .onError(({ code, error, set }) => {
    // Log error
    console.error('Error:', error);

    // Handle AppError
    if (error instanceof AppError) {
      set.status = error.statusCode;
      return {
        success: false,
        error: {
          message: error.message,
          code: error.statusCode,
        },
      };
    }

    // Handle rate limit error
    if (error instanceof Error && error.message === 'Too many requests') {
      set.status = 429;
      return {
        success: false,
        error: {
          message: 'Too many requests',
          code: 429,
        },
      };
    }

    // Handle other errors
    set.status = 500;
    return {
      success: false,
      error: {
        message: 'Internal server error',
        code: 500,
      },
    };
  }); 