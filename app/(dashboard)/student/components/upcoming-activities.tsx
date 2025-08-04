"use client"

import { useState } from "react"
import { Calendar, Clock, BookOpen, FileText, GraduationCap, ChevronLeft, ChevronRight, List } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import type { UpcomingActivity } from "../lib/student-data"

interface UpcomingActivitiesProps {
  activities: UpcomingActivity[]
}

export function UpcomingActivities({ activities }: UpcomingActivitiesProps) {
  const [viewMode, setViewMode] = useState<'calendar' | 'list'>('calendar')
  const [currentDate, setCurrentDate] = useState(new Date())

  if (activities.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Upcoming Activities
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground text-sm">
              No upcoming activities. Great job staying on top of your coursework!
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Upcoming Activities
          </CardTitle>
          <div className="flex items-center gap-1">
            <Button
              variant={viewMode === 'calendar' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('calendar')}
              className="h-8 px-2"
            >
              <Calendar className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === 'list' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('list')}
              className="h-8 px-2"
            >
              <List className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {viewMode === 'calendar' ? (
          <MiniCalendarView 
            activities={activities} 
            currentDate={currentDate}
            setCurrentDate={setCurrentDate}
          />
        ) : (
          <ListView activities={activities} />
        )}
      </CardContent>
    </Card>
  )
}

interface MiniCalendarViewProps {
  activities: UpcomingActivity[]
  currentDate: Date
  setCurrentDate: (date: Date) => void
}

function MiniCalendarView({ activities, currentDate, setCurrentDate }: MiniCalendarViewProps) {
  const today = new Date()
  const year = currentDate.getFullYear()
  const month = currentDate.getMonth()
  
  // Get first day of the month and number of days
  const firstDayOfMonth = new Date(year, month, 1)
  const lastDayOfMonth = new Date(year, month + 1, 0)
  const daysInMonth = lastDayOfMonth.getDate()
  const startingDayOfWeek = firstDayOfMonth.getDay()
  
  // Create calendar grid
  const calendarDays = []
  
  // Add empty cells for days before the first day of the month
  for (let i = 0; i < startingDayOfWeek; i++) {
    calendarDays.push(null)
  }
  
  // Add days of the month
  for (let day = 1; day <= daysInMonth; day++) {
    calendarDays.push(day)
  }
  
  // Group activities by date
  const activitiesByDate = activities.reduce((acc, activity) => {
    const dateKey = activity.dueDate.toDateString()
    if (!acc[dateKey]) {
      acc[dateKey] = []
    }
    acc[dateKey].push(activity)
    return acc
  }, {} as Record<string, UpcomingActivity[]>)
  
  const navigateMonth = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentDate)
    if (direction === 'prev') {
      newDate.setMonth(month - 1)
    } else {
      newDate.setMonth(month + 1)
    }
    setCurrentDate(newDate)
  }
  
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ]
  
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
  
  return (
    <div className="space-y-4">
      {/* Calendar Header */}
      <div className="flex items-center justify-between">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigateMonth('prev')}
          className="h-8 w-8 p-0"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <h3 className="font-medium text-sm">
          {monthNames[month]} {year}
        </h3>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigateMonth('next')}
          className="h-8 w-8 p-0"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
      
      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-1 text-xs">
        {/* Day headers */}
        {dayNames.map((day) => (
          <div key={day} className="text-center text-muted-foreground font-medium py-2">
            {day}
          </div>
        ))}
        
        {/* Calendar days */}
        {calendarDays.map((day, index) => {
          if (day === null) {
            return <div key={index} className="h-8" />
          }
          
          const date = new Date(year, month, day)
          const dateKey = date.toDateString()
          const dayActivities = activitiesByDate[dateKey] || []
          const isToday = date.toDateString() === today.toDateString()
          const hasActivities = dayActivities.length > 0
          
          // Get highest urgency for the day
          const highestUrgency = dayActivities.reduce((highest, activity) => {
            if (activity.urgency === 'high') return 'high'
            if (activity.urgency === 'medium' && highest !== 'high') return 'medium'
            return highest
          }, 'low' as 'low' | 'medium' | 'high')
          
          return (
            <div
              key={day}
              className={cn(
                "h-8 flex items-center justify-center rounded-md text-xs relative cursor-pointer hover:bg-accent/50 transition-colors",
                isToday && "bg-primary text-primary-foreground font-medium",
                hasActivities && !isToday && "bg-accent font-medium"
              )}
              title={hasActivities ? `${dayActivities.length} activities` : undefined}
            >
              {day}
              {hasActivities && (
                <div className={cn(
                  "absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full",
                  highestUrgency === 'high' && "bg-red-500",
                  highestUrgency === 'medium' && "bg-yellow-500",
                  highestUrgency === 'low' && "bg-green-500"
                )} />
              )}
            </div>
          )
        })}
      </div>
      
      {/* Activities for selected month */}
      <div className="space-y-2 max-h-48 overflow-y-auto">
        <h4 className="text-sm font-medium text-muted-foreground">
          Activities this month
        </h4>
        {activities
          .filter(activity => {
            const activityMonth = activity.dueDate.getMonth()
            const activityYear = activity.dueDate.getFullYear()
            return activityMonth === month && activityYear === year
          })
          .sort((a, b) => a.dueDate.getTime() - b.dueDate.getTime())
          .slice(0, 5)
          .map((activity) => (
            <CompactActivityItem key={activity.id} activity={activity} />
          ))}
      </div>
    </div>
  )
}

interface ListViewProps {
  activities: UpcomingActivity[]
}

function ListView({ activities }: ListViewProps) {
  // Sort activities chronologically
  const sortedActivities = [...activities].sort((a, b) => a.dueDate.getTime() - b.dueDate.getTime())
  
  return (
    <div className="space-y-3 max-h-96 overflow-y-auto">
      {sortedActivities.map((activity) => (
        <ActivityItem key={activity.id} activity={activity} />
      ))}
    </div>
  )
}

interface CompactActivityItemProps {
  activity: UpcomingActivity
}

function CompactActivityItem({ activity }: CompactActivityItemProps) {
  const getActivityIcon = (type: UpcomingActivity['type']) => {
    switch (type) {
      case 'lesson':
        return <BookOpen className="h-3 w-3" />
      case 'assignment':
        return <FileText className="h-3 w-3" />
      case 'test':
        return <GraduationCap className="h-3 w-3" />
      default:
        return <BookOpen className="h-3 w-3" />
    }
  }

  const getUrgencyColor = (urgency: UpcomingActivity['urgency']) => {
    switch (urgency) {
      case 'high':
        return 'text-red-600'
      case 'medium':
        return 'text-yellow-600'
      case 'low':
        return 'text-green-600'
      default:
        return 'text-muted-foreground'
    }
  }

  const formatCompactDate = (date: Date) => {
    const now = new Date()
    const diffTime = date.getTime() - now.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    
    if (diffDays === 0) {
      return 'Today'
    } else if (diffDays === 1) {
      return 'Tomorrow'
    } else if (diffDays < 7) {
      return `${diffDays}d`
    } else {
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    }
  }

  return (
    <div className="flex items-center gap-2 p-2 rounded-md border bg-card/50 hover:bg-accent/50 transition-colors">
      <div className={cn("flex-shrink-0", getUrgencyColor(activity.urgency))}>
        {getActivityIcon(activity.type)}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-medium truncate">{activity.title}</p>
        <p className="text-xs text-muted-foreground truncate">{activity.courseName}</p>
      </div>
      <div className="flex-shrink-0 text-xs text-muted-foreground">
        {formatCompactDate(activity.dueDate)}
      </div>
    </div>
  )
}

interface ActivityItemProps {
  activity: UpcomingActivity
}

function ActivityItem({ activity }: ActivityItemProps) {
  const getActivityIcon = (type: UpcomingActivity['type']) => {
    switch (type) {
      case 'lesson':
        return <BookOpen className="h-4 w-4" />
      case 'assignment':
        return <FileText className="h-4 w-4" />
      case 'test':
        return <GraduationCap className="h-4 w-4" />
      default:
        return <BookOpen className="h-4 w-4" />
    }
  }

  const getUrgencyColor = (urgency: UpcomingActivity['urgency']) => {
    switch (urgency) {
      case 'high':
        return 'bg-red-100 text-red-800 border-red-200 dark:bg-red-900/20 dark:text-red-300 dark:border-red-800'
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/20 dark:text-yellow-300 dark:border-yellow-800'
      case 'low':
        return 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/20 dark:text-green-300 dark:border-green-800'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700'
    }
  }

  const getUrgencyIndicator = (urgency: UpcomingActivity['urgency']) => {
    switch (urgency) {
      case 'high':
        return 'border-l-4 border-l-red-500'
      case 'medium':
        return 'border-l-4 border-l-yellow-500'
      case 'low':
        return 'border-l-4 border-l-green-500'
      default:
        return 'border-l-4 border-l-gray-300'
    }
  }

  const formatDueDate = (date: Date) => {
    const now = new Date()
    const diffTime = date.getTime() - now.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    
    if (diffDays === 0) {
      return 'Due today'
    } else if (diffDays === 1) {
      return 'Due tomorrow'
    } else if (diffDays < 7) {
      return `Due in ${diffDays} days`
    } else {
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
      })
    }
  }

  const getActivityTypeLabel = (type: UpcomingActivity['type']) => {
    switch (type) {
      case 'lesson':
        return 'Lesson'
      case 'assignment':
        return 'Assignment'
      case 'test':
        return 'Test'
      default:
        return 'Activity'
    }
  }

  return (
    <div className={cn(
      "flex items-start gap-3 p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors",
      getUrgencyIndicator(activity.urgency)
    )}>
      <div className="flex-shrink-0 mt-1">
        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary">
          {getActivityIcon(activity.type)}
        </div>
      </div>
      
      <div className="flex-1 min-w-0">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
          <div className="flex-1 min-w-0">
            <h4 className="font-medium text-sm leading-tight truncate">
              {activity.title}
            </h4>
            <p className="text-xs text-muted-foreground mt-1 truncate">
              {activity.courseName}
            </p>
          </div>
          
          <div className="flex flex-row sm:flex-col items-start sm:items-end gap-2 sm:gap-1 flex-shrink-0">
            <Badge 
              variant="outline" 
              className={cn("text-xs px-2 py-0.5", getUrgencyColor(activity.urgency))}
            >
              {getActivityTypeLabel(activity.type)}
            </Badge>
            <div className="flex items-center gap-1 text-xs text-muted-foreground sm:mt-1">
              <Clock className="h-3 w-3" />
              <span>{formatDueDate(activity.dueDate)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}