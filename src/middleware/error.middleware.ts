import { Elysia } from 'elysia';
import { AppError } from '../utils/errors';

export const errorHandler = new Elysia()
  .onError(({ code, error, set }) => {
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

    // Log unexpected errors
    console.error('Unexpected error:', error);

    set.status = 500;
    return {
      success: false,
      error: {
        message: 'Internal server error',
        code: 500,
      },
    };
  }); 