"use client"

import React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { 
  AlertCircle, 
  RefreshCw, 
  Wifi, 
  Database, 
  Clock,
  BookOpen,
  Users,
  BarChart3
} from "lucide-react"

interface FallbackUIProps {
  type: 'loading' | 'error' | 'empty' | 'offline'
  title?: string
  description?: string
  onRetry?: () => void
  showRetryButton?: boolean
  className?: string
}

export function FallbackUI({ 
  type, 
  title, 
  description, 
  onRetry, 
  showRetryButton = true,
  className = ""
}: FallbackUIProps) {
  const getIcon = () => {
    switch (type) {
      case 'loading':
        return <Clock className="h-8 w-8 text-muted-foreground animate-pulse" />
      case 'error':
        return <AlertCircle className="h-8 w-8 text-destructive" />
      case 'empty':
        return <Database className="h-8 w-8 text-muted-foreground" />
      case 'offline':
        return <Wifi className="h-8 w-8 text-muted-foreground" />
      default:
        return <AlertCircle className="h-8 w-8 text-muted-foreground" />
    }
  }

  const getDefaultContent = () => {
    switch (type) {
      case 'loading':
        return {
          title: title || 'Loading...',
          description: description || 'Please wait while we load your data.',
        }
      case 'error':
        return {
          title: title || 'Something went wrong',
          description: description || 'We encountered an error while loading your data. Please try again.',
        }
      case 'empty':
        return {
          title: title || 'No data available',
          description: description || 'There\'s no data to display at the moment.',
        }
      case 'offline':
        return {
          title: title || 'You\'re offline',
          description: description || 'Please check your internet connection and try again.',
        }
      default:
        return {
          title: title || 'Something went wrong',
          description: description || 'An unexpected error occurred.',
        }
    }
  }

  const content = getDefaultContent()

  if (type === 'loading') {
    return (
      <Card className={className}>
        <CardContent className="flex flex-col items-center justify-center py-12">
          {getIcon()}
          <h3 className="text-lg font-medium mt-4 mb-2">{content.title}</h3>
          <p className="text-muted-foreground text-center">{content.description}</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className={className}>
      <CardContent className="flex flex-col items-center justify-center py-12">
        {getIcon()}
        <h3 className="text-lg font-medium mt-4 mb-2">{content.title}</h3>
        <p className="text-muted-foreground text-center mb-6 max-w-md">
          {content.description}
        </p>
        
        {showRetryButton && onRetry && (
          <Button
            onClick={onRetry}
            variant="outline"
            size="sm"
            className="flex items-center gap-2"
          >
            <RefreshCw className="h-4 w-4" />
            Try Again
          </Button>
        )}
      </CardContent>
    </Card>
  )
}

/**
 * Skeleton components for different dashboard sections
 */
export function DashboardCardSkeleton() {
  return (
    <Card>
      <CardHeader className="pb-2">
        <Skeleton className="h-4 w-24" />
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <Skeleton className="h-8 w-16" />
          <Skeleton className="h-3 w-32" />
        </div>
      </CardContent>
    </Card>
  )
}

export function ProgressCardSkeleton() {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-6 w-16" />
          </div>
          <Skeleton className="h-12 w-12 rounded-full" />
        </div>
      </CardContent>
    </Card>
  )
}

export function CourseListSkeleton() {
  return (
    <div className="space-y-4">
      {Array.from({ length: 3 }).map((_, i) => (
        <Card key={i}>
          <CardContent className="p-4">
            <div className="flex items-center space-x-4">
              <Skeleton className="h-12 w-12 rounded" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-48" />
                <Skeleton className="h-3 w-32" />
                <Skeleton className="h-2 w-full" />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

export function StatsSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <DashboardCardSkeleton key={i} />
      ))}
    </div>
  )
}

/**
 * Empty state components for different scenarios
 */
interface EmptyStateProps {
  icon?: React.ReactNode
  title: string
  description: string
  action?: {
    label: string
    onClick: () => void
  }
}

export function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <Card>
      <CardContent className="flex flex-col items-center justify-center py-12">
        {icon || <BookOpen className="h-12 w-12 text-muted-foreground" />}
        <h3 className="text-lg font-medium mt-4 mb-2">{title}</h3>
        <p className="text-muted-foreground text-center mb-6 max-w-md">
          {description}
        </p>
        {action && (
          <Button onClick={action.onClick} variant="outline">
            {action.label}
          </Button>
        )}
      </CardContent>
    </Card>
  )
}

export function EmptyCoursesState({ onCreateCourse }: { onCreateCourse?: () => void }) {
  return (
    <EmptyState
      icon={<BookOpen className="h-12 w-12 text-muted-foreground" />}
      title="No courses yet"
      description="You haven't enrolled in any courses yet. Browse our course catalog to get started with your learning journey."
      action={onCreateCourse ? {
        label: "Browse Courses",
        onClick: onCreateCourse
      } : undefined}
    />
  )
}

export function EmptyStudentsState() {
  return (
    <EmptyState
      icon={<Users className="h-12 w-12 text-muted-foreground" />}
      title="No students enrolled"
      description="No students have enrolled in your courses yet. Share your courses to start building your learning community."
    />
  )
}

export function EmptyAnalyticsState() {
  return (
    <EmptyState
      icon={<BarChart3 className="h-12 w-12 text-muted-foreground" />}
      title="No analytics data"
      description="Analytics data will appear here once you have student activity and course interactions."
    />
  )
}