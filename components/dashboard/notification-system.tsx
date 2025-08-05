"use client"

import React, { createContext, useContext, useState, useCallback } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { 
  CheckCircle, 
  AlertCircle, 
  Info, 
  AlertTriangle, 
  X,
  Wifi,
  WifiOff
} from "lucide-react"
import { cn } from "@/lib/utils"

export type NotificationType = 'success' | 'error' | 'warning' | 'info'

export interface Notification {
  id: string
  type: NotificationType
  title: string
  message?: string
  duration?: number
  persistent?: boolean
  action?: {
    label: string
    onClick: () => void
  }
}

interface NotificationContextType {
  notifications: Notification[]
  addNotification: (notification: Omit<Notification, 'id'>) => string
  removeNotification: (id: string) => void
  clearAll: () => void
}

const NotificationContext = createContext<NotificationContextType | null>(null)

export function useNotifications() {
  const context = useContext(NotificationContext)
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider')
  }
  return context
}

interface NotificationProviderProps {
  children: React.ReactNode
  maxNotifications?: number
}

export function NotificationProvider({ 
  children, 
  maxNotifications = 5 
}: NotificationProviderProps) {
  const [notifications, setNotifications] = useState<Notification[]>([])

  const addNotification = useCallback((notification: Omit<Notification, 'id'>) => {
    const id = Math.random().toString(36).substr(2, 9)
    const newNotification: Notification = {
      ...notification,
      id,
      duration: notification.duration ?? (notification.persistent ? undefined : 5000),
    }

    setNotifications(prev => {
      const updated = [newNotification, ...prev].slice(0, maxNotifications)
      return updated
    })

    // Auto-remove non-persistent notifications
    if (!notification.persistent && newNotification.duration) {
      setTimeout(() => {
        removeNotification(id)
      }, newNotification.duration)
    }

    return id
  }, [maxNotifications])

  const removeNotification = useCallback((id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id))
  }, [])

  const clearAll = useCallback(() => {
    setNotifications([])
  }, [])

  return (
    <NotificationContext.Provider value={{
      notifications,
      addNotification,
      removeNotification,
      clearAll,
    }}>
      {children}
      <NotificationContainer />
    </NotificationContext.Provider>
  )
}

function NotificationContainer() {
  const { notifications, removeNotification } = useNotifications()

  if (notifications.length === 0) return null

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2 max-w-sm">
      {notifications.map((notification) => (
        <NotificationCard
          key={notification.id}
          notification={notification}
          onClose={() => removeNotification(notification.id)}
        />
      ))}
    </div>
  )
}

interface NotificationCardProps {
  notification: Notification
  onClose: () => void
}

function NotificationCard({ notification, onClose }: NotificationCardProps) {
  const getIcon = () => {
    switch (notification.type) {
      case 'success':
        return <CheckCircle className="h-5 w-5 text-green-600" />
      case 'error':
        return <AlertCircle className="h-5 w-5 text-red-600" />
      case 'warning':
        return <AlertTriangle className="h-5 w-5 text-yellow-600" />
      case 'info':
        return <Info className="h-5 w-5 text-blue-600" />
      default:
        return <Info className="h-5 w-5 text-gray-600" />
    }
  }

  const getCardClassName = () => {
    const baseClasses = "border shadow-lg animate-in slide-in-from-right-full duration-300"
    
    switch (notification.type) {
      case 'success':
        return cn(baseClasses, "border-green-200 bg-green-50")
      case 'error':
        return cn(baseClasses, "border-red-200 bg-red-50")
      case 'warning':
        return cn(baseClasses, "border-yellow-200 bg-yellow-50")
      case 'info':
        return cn(baseClasses, "border-blue-200 bg-blue-50")
      default:
        return cn(baseClasses, "border-gray-200 bg-gray-50")
    }
  }

  return (
    <Card className={getCardClassName()}>
      <CardContent className="p-4">
        <div className="flex items-start space-x-3">
          <div className="flex-shrink-0">
            {getIcon()}
          </div>
          
          <div className="flex-1 min-w-0">
            <h4 className="text-sm font-medium text-gray-900">
              {notification.title}
            </h4>
            {notification.message && (
              <p className="mt-1 text-sm text-gray-600">
                {notification.message}
              </p>
            )}
            
            {notification.action && (
              <div className="mt-3">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={notification.action.onClick}
                  className="text-xs"
                >
                  {notification.action.label}
                </Button>
              </div>
            )}
          </div>
          
          <div className="flex-shrink-0">
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="h-6 w-6 p-0 hover:bg-gray-200"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

/**
 * Connection status indicator
 */
export function ConnectionStatus() {
  const [isOnline, setIsOnline] = useState(true)
  const { addNotification } = useNotifications()

  React.useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true)
      addNotification({
        type: 'success',
        title: 'Connection restored',
        message: 'You are back online.',
        duration: 3000,
      })
    }

    const handleOffline = () => {
      setIsOnline(false)
      addNotification({
        type: 'warning',
        title: 'Connection lost',
        message: 'You are currently offline. Some features may not work.',
        persistent: true,
      })
    }

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [addNotification])

  if (isOnline) return null

  return (
    <div className="fixed bottom-4 left-4 z-50">
      <Card className="border-yellow-200 bg-yellow-50">
        <CardContent className="flex items-center space-x-2 p-3">
          <WifiOff className="h-4 w-4 text-yellow-600" />
          <span className="text-sm text-yellow-800">Offline</span>
        </CardContent>
      </Card>
    </div>
  )
}

/**
 * Convenience hooks for different notification types
 */
export function useNotificationHelpers() {
  const { addNotification } = useNotifications()

  const showSuccess = useCallback((title: string, message?: string, action?: Notification['action']) => {
    return addNotification({ type: 'success', title, message, action })
  }, [addNotification])

  const showError = useCallback((title: string, message?: string, action?: Notification['action']) => {
    return addNotification({ type: 'error', title, message, action, persistent: true })
  }, [addNotification])

  const showWarning = useCallback((title: string, message?: string, action?: Notification['action']) => {
    return addNotification({ type: 'warning', title, message, action })
  }, [addNotification])

  const showInfo = useCallback((title: string, message?: string, action?: Notification['action']) => {
    return addNotification({ type: 'info', title, message, action })
  }, [addNotification])

  return {
    showSuccess,
    showError,
    showWarning,
    showInfo,
  }
}