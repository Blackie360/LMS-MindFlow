import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { TrendingUp, TrendingDown, Minus, Users, UserPlus, Award } from "lucide-react"
import type { StudentAnalyticsData } from "../lib/admin-data"

interface StudentAnalyticsProps {
  analytics: StudentAnalyticsData
}

export function StudentAnalytics({ analytics }: StudentAnalyticsProps) {
  const getTrendIcon = (trend: 'up' | 'down' | 'stable') => {
    switch (trend) {
      case 'up':
        return <TrendingUp className="h-4 w-4 text-green-600" />
      case 'down':
        return <TrendingDown className="h-4 w-4 text-red-600" />
      default:
        return <Minus className="h-4 w-4 text-gray-600" />
    }
  }

  const getTrendColor = (trend: 'up' | 'down' | 'stable') => {
    switch (trend) {
      case 'up':
        return 'text-green-600'
      case 'down':
        return 'text-red-600'
      default:
        return 'text-gray-600'
    }
  }

  const getTrendText = (trend: 'up' | 'down' | 'stable') => {
    switch (trend) {
      case 'up':
        return 'Increasing'
      case 'down':
        return 'Decreasing'
      default:
        return 'Stable'
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Student Analytics</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* New Enrollments */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-50 rounded-md">
                <UserPlus className="h-4 w-4 text-blue-600" />
              </div>
              <div>
                <div className="text-sm text-muted-foreground">This Week</div>
                <div className="font-semibold">New Enrollments</div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold">
                {analytics.newEnrollmentsThisWeek}
              </div>
            </div>
          </div>

          {/* Active Students */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-50 rounded-md">
                <Users className="h-4 w-4 text-green-600" />
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Today</div>
                <div className="font-semibold">Active Students</div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold">
                {analytics.activeStudentsToday}
              </div>
            </div>
          </div>

          {/* Total Completions */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-50 rounded-md">
                <Award className="h-4 w-4 text-purple-600" />
              </div>
              <div>
                <div className="text-sm text-muted-foreground">All Time</div>
                <div className="font-semibold">Completions</div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold">
                {analytics.totalCompletions}
              </div>
            </div>
          </div>

          {/* Engagement Trend */}
          <div className="pt-4 border-t">
            <div className="flex items-center justify-between">
              <div className="text-sm font-medium">Engagement Trend</div>
              <div className={`flex items-center gap-1 ${getTrendColor(analytics.engagementTrend)}`}>
                {getTrendIcon(analytics.engagementTrend)}
                <span className="text-sm font-medium">
                  {getTrendText(analytics.engagementTrend)}
                </span>
              </div>
            </div>
            <div className="mt-2 text-xs text-muted-foreground">
              Based on recent enrollment activity
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Insights */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Insights</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="text-sm">
              <span className="font-medium">
                {analytics.newEnrollmentsThisWeek > 0 
                  ? `${analytics.newEnrollmentsThisWeek} new students` 
                  : 'No new students'
                }
              </span>
              <span className="text-muted-foreground"> joined this week</span>
            </div>
            
            <div className="text-sm">
              <span className="font-medium">
                {analytics.activeStudentsToday > 0 
                  ? `${analytics.activeStudentsToday} students` 
                  : 'No students'
                }
              </span>
              <span className="text-muted-foreground"> were active today</span>
            </div>
            
            <div className="text-sm">
              <span className="font-medium">
                {analytics.totalCompletions} total lessons
              </span>
              <span className="text-muted-foreground"> completed across all courses</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}