// Utility for consistent error logging across the application

interface ErrorContext {
  component?: string
  action?: string
  userId?: string
  additionalData?: Record<string, any>
}

export function logError(error: unknown, context: ErrorContext = {}) {
  const timestamp = new Date().toISOString()
  const errorInfo = {
    timestamp,
    context,
    error: error instanceof Error ? {
      name: error.name,
      message: error.message,
      stack: error.stack,
    } : {
      message: String(error),
    },
  }

  // Log to console in development
  if (process.env.NODE_ENV === 'development') {
    console.error('Application Error:', errorInfo)
  }

  // In production, you might want to send this to an error tracking service
  // like Sentry, LogRocket, or similar
  if (process.env.NODE_ENV === 'production') {
    // Example: Send to error tracking service
    // errorTrackingService.captureException(error, { extra: errorInfo })
  }

  return errorInfo
}

export function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message
  }
  
  if (typeof error === 'string') {
    return error
  }
  
  return 'An unexpected error occurred'
}

export function isNetworkError(error: unknown): boolean {
  if (error instanceof Error) {
    return error.message.includes('network') || 
           error.message.includes('fetch') || 
           error.message.includes('timeout') ||
           error.name === 'NetworkError'
  }
  return false
}

export function isAuthError(error: unknown): boolean {
  if (error instanceof Error) {
    return error.message.includes('unauthorized') || 
           error.message.includes('authentication') || 
           error.message.includes('credentials') ||
           error.message.includes('session')
  }
  return false
}