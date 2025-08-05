"use client"

import React, { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { 
  Bug, 
  AlertTriangle, 
  Info, 
  Trash2, 
  RefreshCw,
  ChevronDown,
  ChevronRight,
  Clock,
  User,
  Globe
} from "lucide-react"
import { getStoredErrors, clearStoredErrors, getErrorStats } from "@/lib/error-logger"

interface ErrorDebugPanelProps {
  isOpen: boolean
  onToggle: () => void
}

export function ErrorDebugPanel({ isOpen, onToggle }: ErrorDebugPanelProps) {
  const [errors, setErrors] = useState<any[]>([])
  const [stats, setStats] = useState<ReturnType<typeof getErrorStats>>({
    total: 0,
    byLevel: {},
    bySeverity: {},
    recent: [],
  })
  const [expandedErrors, setExpandedErrors] = useState<Set<string>>(new Set())

  const refreshErrors = () => {
    setErrors(getStoredErrors())
    setStats(getErrorStats())
  }

  const clearErrors = () => {
    clearStoredErrors()
    refreshErrors()
  }

  const toggleErrorExpansion = (errorId: string) => {
    const newExpanded = new Set(expandedErrors)
    if (newExpanded.has(errorId)) {
      newExpanded.delete(errorId)
    } else {
      newExpanded.add(errorId)
    }
    setExpandedErrors(newExpanded)
  }

  useEffect(() => {
    refreshErrors()
    
    // Refresh every 5 seconds
    const interval = setInterval(refreshErrors, 5000)
    return () => clearInterval(interval)
  }, [])

  const getLevelIcon = (level: string) => {
    switch (level) {
      case 'error':
        return <AlertTriangle className="h-4 w-4 text-red-500" />
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />
      case 'info':
        return <Info className="h-4 w-4 text-blue-500" />
      default:
        return <Bug className="h-4 w-4 text-gray-500" />
    }
  }

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'error':
        return 'destructive'
      case 'warning':
        return 'secondary'
      case 'info':
        return 'outline'
      default:
        return 'outline'
    }
  }

  if (process.env.NODE_ENV !== 'development') {
    return null
  }

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {!isOpen && (
        <Button
          onClick={onToggle}
          variant="outline"
          size="sm"
          className="shadow-lg"
        >
          <Bug className="h-4 w-4 mr-2" />
          Errors ({stats.total})
        </Button>
      )}

      {isOpen && (
        <Card className="w-96 max-h-96 shadow-lg">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <Bug className="h-4 w-4" />
                Error Debug Panel
              </div>
              <div className="flex items-center gap-2">
                <Button
                  onClick={refreshErrors}
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 p-0"
                >
                  <RefreshCw className="h-3 w-3" />
                </Button>
                <Button
                  onClick={clearErrors}
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 p-0"
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
                <Button
                  onClick={onToggle}
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 p-0"
                >
                  ×
                </Button>
              </div>
            </CardTitle>
          </CardHeader>
          
          <CardContent className="space-y-3">
            {/* Stats */}
            <div className="grid grid-cols-3 gap-2 text-xs">
              <div className="text-center">
                <div className="font-medium">{stats.total}</div>
                <div className="text-muted-foreground">Total</div>
              </div>
              <div className="text-center">
                <div className="font-medium text-red-600">{stats.byLevel.error || 0}</div>
                <div className="text-muted-foreground">Errors</div>
              </div>
              <div className="text-center">
                <div className="font-medium text-yellow-600">{stats.byLevel.warning || 0}</div>
                <div className="text-muted-foreground">Warnings</div>
              </div>
            </div>

            {/* Error List */}
            <div className="max-h-64 overflow-y-auto space-y-2">
              {stats.recent.map((error) => (
                <div key={error.id} className="border rounded-md p-2">
                  <div 
                    className="flex items-center justify-between cursor-pointer"
                    onClick={() => toggleErrorExpansion(error.id)}
                  >
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      {getLevelIcon(error.level)}
                      <span className="text-xs font-medium truncate">
                        {error.error.name}
                      </span>
                      <Badge variant={getLevelColor(error.level) as any} className="text-xs">
                        {error.level}
                      </Badge>
                    </div>
                    {expandedErrors.has(error.id) ? (
                      <ChevronDown className="h-3 w-3" />
                    ) : (
                      <ChevronRight className="h-3 w-3" />
                    )}
                  </div>

                  {expandedErrors.has(error.id) && (
                    <div className="mt-2 space-y-2 text-xs">
                      <div>
                        <strong>Message:</strong> {error.error.message}
                      </div>
                      
                      <div className="flex items-center gap-4 text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {new Date(error.timestamp).toLocaleTimeString()}
                        </div>
                        {error.context.userId && (
                          <div className="flex items-center gap-1">
                            <User className="h-3 w-3" />
                            {error.context.userId.slice(0, 8)}...
                          </div>
                        )}
                        {error.context.component && (
                          <div className="flex items-center gap-1">
                            <Globe className="h-3 w-3" />
                            {error.context.component}
                          </div>
                        )}
                      </div>

                      {error.context.url && (
                        <div>
                          <strong>URL:</strong> {error.context.url}
                        </div>
                      )}

                      {error.error.code && (
                        <div>
                          <strong>Code:</strong> {error.error.code}
                        </div>
                      )}

                      {error.error.stack && (
                        <details className="mt-2">
                          <summary className="cursor-pointer font-medium">
                            Stack Trace
                          </summary>
                          <pre className="mt-1 p-2 bg-muted rounded text-xs overflow-auto whitespace-pre-wrap">
                            {error.error.stack}
                          </pre>
                        </details>
                      )}
                    </div>
                  )}
                </div>
              ))}

              {stats.recent.length === 0 && (
                <div className="text-center text-muted-foreground text-xs py-4">
                  No errors logged yet
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

/**
 * Hook to manage error debug panel state
 */
export function useErrorDebugPanel() {
  const [isOpen, setIsOpen] = useState(false)

  const toggle = () => setIsOpen(!isOpen)
  const open = () => setIsOpen(true)
  const close = () => setIsOpen(false)

  return {
    isOpen,
    toggle,
    open,
    close,
  }
}