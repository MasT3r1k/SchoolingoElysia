import { AppError } from './app-error';

export class BadRequestError extends AppError {
  constructor(message = 'Bad Request', details?: unknown) {
    super(400, message, 'BAD_REQUEST', true, details);
  }
}

export class ValidationError extends AppError {
  constructor(message = 'Validation Failed', details?: unknown) {
    super(422, message, 'VALIDATION_ERROR', true, details);
  }
}

export class UnauthorizedError extends AppError {
  constructor(message = 'Unauthorized', errorCode = 'UNAUTHORIZED') {
    super(401, message, errorCode, true);
  }
}

export class ForbiddenError extends AppError {
  constructor(message = 'Forbidden: Insufficient Permissions', errorCode = 'FORBIDDEN') {
    super(403, message, errorCode, true);
  }
}

export class NotFoundError extends AppError {
  constructor(message = 'Resource Not Found', errorCode = 'NOT_FOUND') {
    super(404, message, errorCode, true);
  }
}

export class ConflictError extends AppError {
  constructor(message = 'Resource Conflict', errorCode = 'CONFLICT') {
    super(409, message, errorCode, true);
  }
}

export class TooManyRequestsError extends AppError {
  public readonly retryAfter?: number;

  constructor(message = 'Too Many Requests: Rate limit exceeded', retryAfter?: number) {
    super(429, message, 'TOO_MANY_REQUESTS', true, retryAfter ? { retryAfter } : undefined);
    this.retryAfter = retryAfter;
  }
}

export class InternalServerError extends AppError {
  constructor(message = 'Internal Server Error', details?: unknown) {
    super(500, message, 'INTERNAL_SERVER_ERROR', false, details);
  }
}
