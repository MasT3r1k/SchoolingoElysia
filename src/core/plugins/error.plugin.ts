import { Elysia } from 'elysia';
import { AppError } from '../errors/app-error';
import { captureException } from './sentry.plugin';

export const errorPlugin = new Elysia({ name: 'error-plugin' })
  .onError({ as: 'global' }, ({ code, error, set, request }) => {
    // 1. Handled Domain & HTTP Errors (AppError)
    if (error instanceof AppError || (error as any)?.isOperational !== undefined) {
      const appErr = error as AppError;
      set.status = appErr.statusCode || 500;

      if (!appErr.isOperational) {
        captureException(error, {
          url: request.url,
          method: request.method,
          errorCode: appErr.errorCode,
        });
      }

      return {
        success: false,
        error: {
          code: appErr.errorCode || 'APPLICATION_ERROR',
          message: appErr.message,
          statusCode: appErr.statusCode || 500,
          ...(appErr.details ? { details: appErr.details } : {}),
        },
      };
    }

    // 2. Elysia Built-in TypeBox Validation Errors
    if (code === 'VALIDATION') {
      set.status = 422;
      return {
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'The submitted request payload or parameters failed validation',
          statusCode: 422,
          details: (error as any).all ?? (error as any).message,
        },
      };
    }

    // 3. Not Found
    if (code === 'NOT_FOUND') {
      set.status = 404;
      return {
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Endpoint or resource not found',
          statusCode: 404,
        },
      };
    }

    // 4. Rate Limiting Error
    if (error instanceof Error && error.message.includes('Too many requests')) {
      set.status = 429;
      return {
        success: false,
        error: {
          code: 'TOO_MANY_REQUESTS',
          message: 'Too many requests. Please slow down and try again later.',
          statusCode: 429,
        },
      };
    }

    // 5. Unhandled Server Errors (500)
    console.error('[💥 Unhandled Server Exception]:', error);
    captureException(error, {
      url: request.url,
      method: request.method,
    });

    set.status = 500;
    return {
      success: false,
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: 'An unexpected internal error occurred on the server',
        statusCode: 500,
      },
    };
  });
