"use client"

import React, { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { 
  Bug, 
  AlertTriangle, 
  Network, 
  Database, 
  Shield,
  RefreshCw
} from "lucide-react"
import { 
  DashboardError, 
  ErrorTypes, 
  showErrorToast, 
  showSuccessToast 
} from "@/lib/error-handling"
import { useNotificationHelpers } from "@/components/dashboard/notification-system"
import { useDashboardData } from "@/hooks/use-dashboard-data"

interface ErrorTestComponentProps {
  userId: string
}

export function ErrorTestComponent({ userId }: ErrorTestComponentProps) {
  const [isVisible, setIsVisible] = useState(false)
  const { showError, showSuccess, showWarning, showInfo } = useNotificationHelpers()

  if (process.env.NODE_ENV !== 'development') {
    return null
  }

  const testErrors = [
    {
      name: "Network Error",
      icon: <Network className="h-4 w-4" />,
      color: "destructive" as const,
      test: () => {
        const error = new DashboardError({
          message: "Failed to connect to server",
          code: ErrorTypes.NETWORK_ERROR,
          context: { component: "ErrorTestComponent", action: "testNetworkError" }
        })
        showErrorToast(error)
        showError("Network Error", "This is a test network error notification")
      }
    },
    {
      name: "Database Error",
      icon: <Database className="h-4 w-4" />,
      color: "destructive" as const,
      test: () => {
        const error = new DashboardError({
          message: "Database query failed",
          code: "DATABASE_ERROR",
          context: { component: "ErrorTestComponent", action: "testDatabaseError" }
        })
        showErrorToast(error)
        showError("Database Error", "This is a test database error notification")
      }
    },
    {
      name: "Permission Error",
      icon: <Shield className="h-4 w-4" />,
      color: "secondary" as const,
      test: () => {
        const error = new DashboardError({
          message: "Access denied",
          code: ErrorTypes.PERMISSION_ERROR,
          context: { component: "ErrorTestComponent", action: "testPermissionError" }
        })
        showErrorToast(error)
        showError("Permission Error", "This is a test permission error notification")
      }
    },
    {
      name: "Validation Error",
      icon: <AlertTriangle className="h-4 w-4" />,
      color: "outline" as const,
      test: () => {
        const error = new DashboardError({
          message: "Invalid input data",
          code: ErrorTypes.VALIDATION_ERROR,
          context: { component: "ErrorTestComponent", action: "testValidationError" }
        })
        showErrorToast(error)
        showWarning("Validation Error", "This is a test validation error notification")
      }
    },
    {
      name: "Component Error",
      icon: <Bug className="h-4 w-4" />,
      color: "destructive" as const,
      test: () => {
        // This will trigger the error boundary
        throw new Error("Test component error for error boundary")
      }
    },
    {
      name: "Success Test",
      icon: <RefreshCw className="h-4 w-4" />,
      color: "default" as const,
      test: () => {
        showSuccessToast("Test Success", "This is a test success notification")
        showSuccess("Success Test", "This is a test success notification")
      }
    }
  ]

  const testNotifications = [
    {
      name: "Info Notification",
      test: () => showInfo("Info Test", "This is a test info notification")
    },
    {
      name: "Warning Notification", 
      test: () => showWarning("Warning Test", "This is a test warning notification")
    },
    {
      name: "Error Notification",
      test: () => showError("Error Test", "This is a test error notification")
    },
    {
      name: "Success Notification",
      test: () => showSuccess("Success Test", "This is a test success notification")
    }
  ]

  if (!isVisible) {
    return (
      <div className="fixed bottom-20 right-4 z-40">
        <Button
          onClick={() => setIsVisible(true)}
          variant="outline"
          size="sm"
          className="shadow-lg"
        >
          <Bug className="h-4 w-4 mr-2" />
          Error Tests
        </Button>
      </div>
    )
  }

  return (
    <div className="fixed bottom-20 right-4 z-40">
      <Card className="w-80 shadow-lg">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              <Bug className="h-4 w-4" />
              Error Testing Panel
            </div>
            <Button
              onClick={() => setIsVisible(false)}
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0"
            >
              ×
            </Button>
          </CardTitle>
        </CardHeader>
        
        <CardContent className="space-y-3">
          <div>
            <h4 className="text-xs font-medium mb-2">Error Types</h4>
            <div className="grid grid-cols-2 gap-2">
              {testErrors.map((error, index) => (
                <Button
                  key={index}
                  onClick={error.test}
                  variant="outline"
                  size="sm"
                  className="h-auto p-2 flex flex-col items-center gap-1"
                >
                  {error.icon}
                  <span className="text-xs">{error.name}</span>
                </Button>
              ))}
            </div>
          </div>

          <div>
            <h4 className="text-xs font-medium mb-2">Notifications</h4>
            <div className="grid grid-cols-2 gap-2">
              {testNotifications.map((notification, index) => (
                <Button
                  key={index}
                  onClick={notification.test}
                  variant="outline"
                  size="sm"
                  className="text-xs"
                >
                  {notification.name}
                </Button>
              ))}
            </div>
          </div>

          <div className="pt-2 border-t">
            <p className="text-xs text-muted-foreground">
              Development only - Test error handling and notifications
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

/**
 * Component that demonstrates data fetching with error handling
 */
export function DataFetchTestComponent() {
  const { data, loading, error, retry } = useDashboardData<any>(
    '/api/test/error-endpoint',
    {
      retryAttempts: 2,
      showErrorToasts: true,
    }
  )

  if (process.env.NODE_ENV !== 'development') {
    return null
  }

  return (
    <Card className="mt-4">
      <CardHeader>
        <CardTitle className="text-sm">Data Fetch Error Test</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Badge variant={loading ? "secondary" : error ? "destructive" : "default"}>
              {loading ? "Loading" : error ? "Error" : "Success"}
            </Badge>
            {error && (
              <Button onClick={retry} size="sm" variant="outline">
                Retry
              </Button>
            )}
          </div>
          
          {error && (
            <p className="text-xs text-muted-foreground">
              Error: {error.message}
            </p>
          )}
          
          {data && (
            <p className="text-xs text-muted-foreground">
              Data loaded successfully
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  )
}