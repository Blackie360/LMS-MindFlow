/**
 * Comprehensive error handling utilities for the dashboard system
 */

import { toast } from "@/hooks/use-toast"

export interface ErrorDetails {
  message: string
  code?: string
  context?: Record<string, any>
  timestamp?: Date
  userId?: string
}

export interface RetryOptions {
  maxAttempts?: number
  delay?: number
  backoff?: boolean
}

/**
 * Enhanced error class with additional context
 */
export class DashboardError extends Error {
  public readonly code?: string
  public readonly context?: Record<string, any>
  public readonly timestamp: Date
  public readonly userId?: string

  constructor(details: ErrorDetails) {
    super(details.message)
    this.name = 'DashboardError'
    this.code = details.code
    this.context = details.context
    this.timestamp = details.timestamp || new Date()
    this.userId = details.userId
  }
}

/**
 * Error types for different dashboard scenarios
 */
export const ErrorTypes = {
  NETWORK_ERROR: 'NETWORK_ERROR',
  DATA_FETCH_ERROR: 'DATA_FETCH_ERROR',
  PERMISSION_ERROR: 'PERMISSION_ERROR',
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  UNKNOWN_ERROR: 'UNKNOWN_ERROR',
} as const

/**
 * User-friendly error messages
 */
export const ErrorMessages = {
  [ErrorTypes.NETWORK_ERROR]: {
    title: 'Connection Problem',
    description: 'Unable to connect to the server. Please check your internet connection and try again.',
  },
  [ErrorTypes.DATA_FETCH_ERROR]: {
    title: 'Data Loading Failed',
    description: 'We couldn\'t load your dashboard data. Please try refreshing the page.',
  },
  [ErrorTypes.PERMISSION_ERROR]: {
    title: 'Access Denied',
    description: 'You don\'t have permission to access this resource.',
  },
  [ErrorTypes.VALIDATION_ERROR]: {
    title: 'Invalid Data',
    description: 'The data provided is invalid. Please check your input and try again.',
  },
  [ErrorTypes.UNKNOWN_ERROR]: {
    title: 'Something Went Wrong',
    description: 'An unexpected error occurred. Please try again or contact support if the problem persists.',
  },
} as const

/**
 * Log error with context for debugging
 */
export function logError(error: Error | DashboardError, context?: Record<string, any>) {
  const errorDetails = {
    message: error.message,
    stack: error.stack,
    timestamp: new Date().toISOString(),
    context: {
      ...context,
      ...(error instanceof DashboardError ? error.context : {}),
    },
  }

  console.error('Dashboard Error:', errorDetails)

  // In production, you might want to send this to an error tracking service
  if (process.env.NODE_ENV === 'production') {
    // Example: Send to error tracking service
    // errorTrackingService.captureException(error, errorDetails)
  }
}

/**
 * Show user-friendly error toast
 */
export function showErrorToast(error: Error | DashboardError, customMessage?: string) {
  let errorType = ErrorTypes.UNKNOWN_ERROR
  
  if (error instanceof DashboardError && error.code) {
    errorType = error.code as keyof typeof ErrorTypes
  } else if (error.message.includes('fetch')) {
    errorType = ErrorTypes.NETWORK_ERROR
  } else if (error.message.includes('permission') || error.message.includes('unauthorized')) {
    errorType = ErrorTypes.PERMISSION_ERROR
  }

  const errorMessage = ErrorMessages[errorType] || ErrorMessages[ErrorTypes.UNKNOWN_ERROR]

  toast({
    variant: "destructive",
    title: errorMessage.title,
    description: customMessage || errorMessage.description,
  })
}

/**
 * Show success toast
 */
export function showSuccessToast(title: string, description?: string) {
  toast({
    title,
    description,
  })
}

/**
 * Retry function with exponential backoff
 */
export async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  options: RetryOptions = {}
): Promise<T> {
  const { maxAttempts = 3, delay = 1000, backoff = true } = options
  
  let lastError: Error
  
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await fn()
    } catch (error) {
      lastError = error as Error
      
      if (attempt === maxAttempts) {
        throw lastError
      }
      
      const waitTime = backoff ? delay * Math.pow(2, attempt - 1) : delay
      await new Promise(resolve => setTimeout(resolve, waitTime))
    }
  }
  
  throw lastError!
}

/**
 * Safe async function wrapper with error handling
 */
export function withErrorHandling<T extends any[], R>(
  fn: (...args: T) => Promise<R>,
  context?: Record<string, any>
) {
  return async (...args: T): Promise<R | null> => {
    try {
      return await fn(...args)
    } catch (error) {
      logError(error as Error, context)
      showErrorToast(error as Error)
      return null
    }
  }
}

/**
 * Create error boundary fallback component props
 */
export function createErrorFallback(
  title: string = "Something went wrong",
  description: string = "We encountered an error while loading this section.",
  onRetry?: () => void
) {
  return {
    title,
    description,
    onRetry,
  }
}

/**
 * Handle API response errors
 */
export async function handleApiResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    let errorMessage = `HTTP ${response.status}: ${response.statusText}`
    
    try {
      const errorData = await response.json()
      errorMessage = errorData.message || errorMessage
    } catch {
      // If we can't parse the error response, use the default message
    }
    
    throw new DashboardError({
      message: errorMessage,
      code: response.status >= 500 ? ErrorTypes.NETWORK_ERROR : ErrorTypes.DATA_FETCH_ERROR,
      context: {
        status: response.status,
        statusText: response.statusText,
        url: response.url,
      },
    })
  }
  
  return response.json()
}