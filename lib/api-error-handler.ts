/**
 * API error handling utilities for consistent error responses
 */

import { NextResponse } from "next/server"
import { logError, ErrorTypes } from "./error-handling"

export interface ApiError {
  message: string
  code?: string
  status?: number
  details?: Record<string, any>
}

export class ApiErrorResponse extends Error {
  public readonly status: number
  public readonly code?: string
  public readonly details?: Record<string, any>

  constructor(message: string, status: number = 500, code?: string, details?: Record<string, any>) {
    super(message)
    this.name = 'ApiErrorResponse'
    this.status = status
    this.code = code
    this.details = details
  }
}

/**
 * Standard API error responses
 */
export const ApiErrors = {
  UNAUTHORIZED: new ApiErrorResponse('Unauthorized access', 401, ErrorTypes.PERMISSION_ERROR),
  FORBIDDEN: new ApiErrorResponse('Access forbidden', 403, ErrorTypes.PERMISSION_ERROR),
  NOT_FOUND: new ApiErrorResponse('Resource not found', 404, 'NOT_FOUND'),
  VALIDATION_ERROR: new ApiErrorResponse('Invalid request data', 400, ErrorTypes.VALIDATION_ERROR),
  INTERNAL_ERROR: new ApiErrorResponse('Internal server error', 500, ErrorTypes.UNKNOWN_ERROR),
  DATABASE_ERROR: new ApiErrorResponse('Database operation failed', 500, 'DATABASE_ERROR'),
  NETWORK_ERROR: new ApiErrorResponse('Network request failed', 503, ErrorTypes.NETWORK_ERROR),
} as const

/**
 * Wrap API route handlers with error handling
 */
export function withApiErrorHandling(
  handler: (request: Request, context?: any) => Promise<Response>
) {
  return async (request: Request, context?: any): Promise<Response> => {
    try {
      return await handler(request, context)
    } catch (error) {
      return handleApiError(error, request)
    }
  }
}

/**
 * Handle API errors and return appropriate responses
 */
export function handleApiError(error: unknown, request?: Request): Response {
  let apiError: ApiErrorResponse

  if (error instanceof ApiErrorResponse) {
    apiError = error
  } else if (error instanceof Error) {
    // Map common error types
    if (error.message.includes('unauthorized') || error.message.includes('authentication')) {
      apiError = ApiErrors.UNAUTHORIZED
    } else if (error.message.includes('forbidden') || error.message.includes('permission')) {
      apiError = ApiErrors.FORBIDDEN
    } else if (error.message.includes('not found')) {
      apiError = ApiErrors.NOT_FOUND
    } else if (error.message.includes('validation') || error.message.includes('invalid')) {
      apiError = ApiErrors.VALIDATION_ERROR
    } else if (error.message.includes('database') || error.message.includes('prisma')) {
      apiError = ApiErrors.DATABASE_ERROR
    } else {
      apiError = new ApiErrorResponse(error.message, 500, ErrorTypes.UNKNOWN_ERROR)
    }
  } else {
    apiError = ApiErrors.INTERNAL_ERROR
  }

  // Log the error with context
  logError(error instanceof Error ? error : new Error(String(error)), {
    url: request?.url,
    method: request?.method,
    status: apiError.status,
    code: apiError.code,
  })

  // Return error response
  return NextResponse.json(
    {
      error: {
        message: apiError.message,
        code: apiError.code,
        status: apiError.status,
        ...(process.env.NODE_ENV === 'development' && apiError.details && {
          details: apiError.details
        }),
      },
    },
    { status: apiError.status }
  )
}

/**
 * Validate request data and throw validation error if invalid
 */
export function validateRequest<T>(
  data: unknown,
  validator: (data: unknown) => data is T,
  errorMessage: string = 'Invalid request data'
): T {
  if (!validator(data)) {
    throw new ApiErrorResponse(errorMessage, 400, ErrorTypes.VALIDATION_ERROR)
  }
  return data
}

/**
 * Ensure user is authenticated
 */
export function requireAuth(user: unknown): asserts user is NonNullable<typeof user> {
  if (!user) {
    throw ApiErrors.UNAUTHORIZED
  }
}

/**
 * Ensure user has required role
 */
export function requireRole(user: { role: string }, requiredRole: string) {
  requireAuth(user)
  if (user.role !== requiredRole) {
    throw ApiErrors.FORBIDDEN
  }
}

/**
 * Create success response with consistent format
 */
export function createSuccessResponse<T>(data: T, message?: string, status: number = 200) {
  return NextResponse.json(
    {
      success: true,
      data,
      ...(message && { message }),
    },
    { status }
  )
}

/**
 * Handle database operations with error mapping
 */
export async function withDatabaseErrorHandling<T>(
  operation: () => Promise<T>,
  context?: string
): Promise<T> {
  try {
    return await operation()
  } catch (error) {
    const message = context 
      ? `Database operation failed: ${context}` 
      : 'Database operation failed'
    
    throw new ApiErrorResponse(
      message,
      500,
      'DATABASE_ERROR',
      { originalError: error instanceof Error ? error.message : String(error) }
    )
  }
}