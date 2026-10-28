export interface PaginatedMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: PaginatedMeta;
}

export function paginatedResponse<T>(
  data: T[],
  total: number,
  offset: number,
  limit: number
): PaginatedResponse<T> {
  const safeLimit = Math.max(1, limit);
  const page = Math.floor(offset / safeLimit) + 1;
  const totalPages = Math.ceil(total / safeLimit);

  return {
    data,
    meta: {
      total,
      page,
      limit: safeLimit,
      totalPages,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1,
    },
  };
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  message?: string;
}

export function successResponse<T>(data: T, message?: string): ApiResponse<T> {
  return {
    success: true,
    data,
    ...(message ? { message } : {}),
  };
}

export function attachSessionExpires<T extends object>(data: T, expires?: Date | null): T & { expires?: Date } {
  if (!expires) return data;
  return { ...data, expires };
}

export function createSuccessResponse<T>(data: T, meta?: Record<string, any>) {
  return {
    success: true,
    data,
    ...(meta ? { meta } : {}),
  };
}

export function createErrorResponse(
  code: string,
  message: string,
  statusCode = 400,
  details?: unknown
) {
  return {
    success: false,
    error: {
      code,
      message,
      statusCode,
      ...(details ? { details } : {}),
    },
  };
}

export function createPaginatedResponse<T>(
  data: T[],
  total: number,
  page: number,
  pageSize: number
) {
  const safePageSize = Math.max(1, pageSize);
  const totalPages = Math.ceil(total / safePageSize);

  return {
    success: true,
    data,
    pagination: {
      total,
      page,
      pageSize: safePageSize,
      totalPages,
      hasNext: page < totalPages,
      hasPrev: page > 1,
    },
  };
}
