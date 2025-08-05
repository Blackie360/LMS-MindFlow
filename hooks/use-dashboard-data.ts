"use client"

import { useState, useEffect, useCallback } from "react"
import { 
  logError, 
  showErrorToast, 
  showSuccessToast, 
  retryWithBackoff, 
  handleApiResponse,
  DashboardError,
  ErrorTypes 
} from "@/lib/error-handling"

interface UseDashboardDataOptions {
  retryAttempts?: number
  retryDelay?: number
  showErrorToasts?: boolean
  showSuccessToasts?: boolean
  onError?: (error: Error) => void
  onSuccess?: (data: any) => void
}

interface DashboardDataState<T> {
  data: T | null
  loading: boolean
  error: Error | null
  lastFetch: Date | null
  retryCount: number
}

export function useDashboardData<T>(
  endpoint: string,
  options: UseDashboardDataOptions = {}
) {
  const {
    retryAttempts = 3,
    retryDelay = 1000,
    showErrorToasts = true,
    showSuccessToasts = false,
    onError,
    onSuccess,
  } = options

  const [state, setState] = useState<DashboardDataState<T>>({
    data: null,
    loading: true,
    error: null,
    lastFetch: null,
    retryCount: 0,
  })

  const fetchData = useCallback(async (isRetry = false) => {
    try {
      setState(prev => ({
        ...prev,
        loading: true,
        error: null,
        retryCount: isRetry ? prev.retryCount + 1 : 0,
      }))

      const data = await retryWithBackoff(
        async () => {
          const response = await fetch(endpoint)
          return handleApiResponse<T>(response)
        },
        {
          maxAttempts: retryAttempts,
          delay: retryDelay,
          backoff: true,
        }
      )

      setState(prev => ({
        ...prev,
        data,
        loading: false,
        error: null,
        lastFetch: new Date(),
      }))

      if (showSuccessToasts && isRetry) {
        showSuccessToast("Data loaded successfully", "Your dashboard has been updated.")
      }

      onSuccess?.(data)
    } catch (error) {
      const dashboardError = error instanceof DashboardError 
        ? error 
        : new DashboardError({
            message: error instanceof Error ? error.message : 'Unknown error occurred',
            code: ErrorTypes.DATA_FETCH_ERROR,
            context: { endpoint, retryCount: state.retryCount },
          })

      setState(prev => ({
        ...prev,
        loading: false,
        error: dashboardError,
      }))

      logError(dashboardError, { endpoint, retryCount: state.retryCount })

      if (showErrorToasts) {
        showErrorToast(dashboardError)
      }

      onError?.(dashboardError)
    }
  }, [endpoint, retryAttempts, retryDelay, showErrorToasts, showSuccessToasts, onError, onSuccess, state.retryCount])

  const retry = useCallback(() => {
    fetchData(true)
  }, [fetchData])

  const refresh = useCallback(() => {
    setState(prev => ({ ...prev, retryCount: 0 }))
    fetchData(false)
  }, [fetchData])

  useEffect(() => {
    fetchData(false)
  }, [fetchData])

  return {
    ...state,
    retry,
    refresh,
    isStale: state.lastFetch ? Date.now() - state.lastFetch.getTime() > 5 * 60 * 1000 : false, // 5 minutes
  }
}

/**
 * Hook for handling form submissions with error handling
 */
interface UseFormSubmissionOptions {
  onSuccess?: (data: any) => void
  onError?: (error: Error) => void
  showToasts?: boolean
}

export function useFormSubmission<T>(
  submitFn: (data: T) => Promise<any>,
  options: UseFormSubmissionOptions = {}
) {
  const { onSuccess, onError, showToasts = true } = options
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  const submit = useCallback(async (data: T) => {
    try {
      setLoading(true)
      setError(null)

      const result = await submitFn(data)

      if (showToasts) {
        showSuccessToast("Success", "Your changes have been saved.")
      }

      onSuccess?.(result)
      return result
    } catch (error) {
      const dashboardError = error instanceof DashboardError 
        ? error 
        : new DashboardError({
            message: error instanceof Error ? error.message : 'Submission failed',
            code: ErrorTypes.VALIDATION_ERROR,
          })

      setError(dashboardError)
      logError(dashboardError)

      if (showToasts) {
        showErrorToast(dashboardError)
      }

      onError?.(dashboardError)
      throw dashboardError
    } finally {
      setLoading(false)
    }
  }, [submitFn, onSuccess, onError, showToasts])

  return {
    submit,
    loading,
    error,
    clearError: () => setError(null),
  }
}

/**
 * Hook for handling optimistic updates
 */
export function useOptimisticUpdate<T>(
  initialData: T,
  updateFn: (data: T) => Promise<T>
) {
  const [data, setData] = useState<T>(initialData)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  const update = useCallback(async (optimisticData: T) => {
    const previousData = data
    
    try {
      // Apply optimistic update immediately
      setData(optimisticData)
      setLoading(true)
      setError(null)

      // Perform actual update
      const result = await updateFn(optimisticData)
      setData(result)
      
      showSuccessToast("Updated", "Your changes have been saved.")
    } catch (error) {
      // Revert optimistic update on error
      setData(previousData)
      
      const dashboardError = error instanceof DashboardError 
        ? error 
        : new DashboardError({
            message: error instanceof Error ? error.message : 'Update failed',
            code: ErrorTypes.VALIDATION_ERROR,
          })

      setError(dashboardError)
      logError(dashboardError)
      showErrorToast(dashboardError)
    } finally {
      setLoading(false)
    }
  }, [data, updateFn])

  return {
    data,
    update,
    loading,
    error,
    clearError: () => setError(null),
  }
}