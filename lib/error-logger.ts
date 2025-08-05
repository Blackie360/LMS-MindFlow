// Enhanced utility for consistent error logging across the application
// This integrates with the comprehensive error handling system

import { DashboardError, ErrorTypes } from "./error-handling"

interface ErrorContext {
  component?: string
  action?: string
  userId?: string
  url?: string
  method?: string
  status?: number
  code?: string
  additionalData?: Record<string, any>
}

interface ErrorLogEntry {
  id: string
  timestamp: string
  level: 'error' | 'warning' | 'info'
  context: ErrorContext
  error: {
    name: string
    message: string
    stack?: string
    code?: string
  }
  userAgent?: string
  sessionId?: string
}

// In-memory error store for development (in production, use external service)
const errorStore: ErrorLogEntry[] = []
const MAX_STORED_ERRORS = 100

export function logError(error: unknown, context: ErrorContext = {}): ErrorLogEntry {
  const timestamp = new Date().toISOString()
  const id = `error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  
  const errorInfo: ErrorLogEntry = {
    id,
    timestamp,
    level: 'error',
    context,
    error: error instanceof Error ? {
      name: error.name,
      message: error.message,
      stack: error.stack,
      code: error instanceof DashboardError ? error.code : undefined,
    } : {
      name: 'UnknownError',
      message: String(error),
    },
    userAgent: typeof window !== 'undefined' ? window.navigator.userAgent : undefined,
    sessionId: context.userId ? `session_${context.userId}` : undefined,
  }

  // Store error for debugging
  errorStore.push(errorInfo)
  if (errorStore.length > MAX_STORED_ERRORS) {
    errorStore.shift()
  }

  // Log to console in development
  if (process.env.NODE_ENV === 'development') {
    console.group(`🚨 Application Error [${id}]`)
    console.error('Error:', errorInfo.error)
    console.log('Context:', errorInfo.context)
    console.log('Timestamp:', errorInfo.timestamp)
    if (errorInfo.error.stack) {
      console.log('Stack:', errorInfo.error.stack)
    }
    console.groupEnd()
  }

  // In production, send to error tracking service
  if (process.env.NODE_ENV === 'production') {
    // Example integrations:
    // Sentry.captureException(error, { extra: errorInfo })
    // LogRocket.captureException(error)
    // Bugsnag.notify(error, { metaData: errorInfo })
    
    // For now, we'll just log to console in production too
    console.error('Production Error:', {
      id: errorInfo.id,
      message: errorInfo.error.message,
      context: errorInfo.context,
      timestamp: errorInfo.timestamp,
    })
  }

  return errorInfo
}

export function logWarning(message: string, context: ErrorContext = {}): ErrorLogEntry {
  const warning = new Error(message)
  warning.name = 'Warning'
  
  const entry = logError(warning, context)
  entry.level = 'warning'
  
  return entry
}

export function logInfo(message: string, context: ErrorContext = {}): ErrorLogEntry {
  const info = new Error(message)
  info.name = 'Info'
  
  const entry = logError(info, context)
  entry.level = 'info'
  
  return entry
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
           error.name === 'NetworkError' ||
           (error instanceof DashboardError && error.code === ErrorTypes.NETWORK_ERROR)
  }
  return false
}

export function isAuthError(error: unknown): boolean {
  if (error instanceof Error) {
    return error.message.includes('unauthorized') || 
           error.message.includes('authentication') || 
           error.message.includes('credentials') ||
           error.message.includes('session') ||
           (error instanceof DashboardError && error.code === ErrorTypes.PERMISSION_ERROR)
  }
  return false
}

export function isDatabaseError(error: unknown): boolean {
  if (error instanceof Error) {
    return error.message.includes('database') || 
           error.message.includes('prisma') || 
           error.message.includes('connection') ||
           error.name.includes('Prisma')
  }
  return false
}

export function getErrorSeverity(error: unknown): 'low' | 'medium' | 'high' | 'critical' {
  if (isAuthError(error)) return 'high'
  if (isDatabaseError(error)) return 'critical'
  if (isNetworkError(error)) return 'medium'
  
  if (error instanceof DashboardError) {
    switch (error.code) {
      case ErrorTypes.PERMISSION_ERROR:
        return 'high'
      case ErrorTypes.DATA_FETCH_ERROR:
        return 'medium'
      case ErrorTypes.VALIDATION_ERROR:
        return 'low'
      case ErrorTypes.UNKNOWN_ERROR:
        return 'high'
      default:
        return 'medium'
    }
  }
  
  return 'medium'
}

// Development utilities
export function getStoredErrors(): ErrorLogEntry[] {
  return [...errorStore]
}

export function clearStoredErrors(): void {
  errorStore.length = 0
}

export function getErrorStats(): {
  total: number
  byLevel: Record<string, number>
  bySeverity: Record<string, number>
  recent: ErrorLogEntry[]
} {
  const byLevel: Record<string, number> = {}
  const bySeverity: Record<string, number> = {}
  
  errorStore.forEach(entry => {
    byLevel[entry.level] = (byLevel[entry.level] || 0) + 1
    
    const severity = getErrorSeverity(entry.error)
    bySeverity[severity] = (bySeverity[severity] || 0) + 1
  })
  
  return {
    total: errorStore.length,
    byLevel,
    bySeverity,
    recent: errorStore.slice(-10).reverse(), // Last 10 errors, most recent first
  }
}

// Export for backward compatibility
export { logError as default }