"use client"

import { useState, useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { 
  TrendingUp, 
  TrendingDown, 
  Minus, 
  Users, 
  UserPlus, 
  Award, 
  Search,
  Filter,
  ArrowUpDown,
  Calendar,
  BarChart3,
  Trophy,
  Activity
} from "lucide-react"
import { StudentProgressExportButton } from "@/components/dashboard/export-button"
import type { StudentAnalyticsData, StudentProgressData } from "../lib/admin-data"

interface StudentAnalyticsProps {
  analytics: StudentAnalyticsData
}

type SortField = 'name' | 'completionRate' | 'completedLessons' | 'enrolledAt' | 'lastActivity'
type SortDirection = 'asc' | 'desc'
type FilterStatus = 'all' | 'active' | 'inactive' | 'completed'

export function StudentAnalytics({ analytics }: StudentAnalyticsProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [sortField, setSortField] = useState<SortField>('completionRate')
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc')
  const [filterStatus, setFilterStatus] = useState<FilterStatus>('all')
  const [showDetailedView, setShowDetailedView] = useState(false)

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

  const getStatusBadge = (status: 'active' | 'inactive' | 'completed') => {
    switch (status) {
      case 'active':
        return <Badge variant="default" className="bg-green-100 text-green-800">Active</Badge>
      case 'completed':
        return <Badge variant="default" className="bg-blue-100 text-blue-800">Completed</Badge>
      default:
        return <Badge variant="secondary">Inactive</Badge>
    }
  }

  const formatDate = (date: Date | null) => {
    if (!date) return 'Never'
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    }).format(date)
  }

  // Filter and sort students
  const filteredAndSortedStudents = useMemo(() => {
    let filtered = analytics.detailedStudentProgress.filter(student => {
      const matchesSearch = student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           student.email.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesStatus = filterStatus === 'all' || student.status === filterStatus
      return matchesSearch && matchesStatus
    })

    filtered.sort((a, b) => {
      let aValue: any = a[sortField]
      let bValue: any = b[sortField]

      if (sortField === 'enrolledAt' || sortField === 'lastActivity') {
        aValue = aValue ? new Date(aValue).getTime() : 0
        bValue = bValue ? new Date(bValue).getTime() : 0
      }

      if (typeof aValue === 'string') {
        aValue = aValue.toLowerCase()
        bValue = bValue.toLowerCase()
      }

      if (sortDirection === 'asc') {
        return aValue < bValue ? -1 : aValue > bValue ? 1 : 0
      } else {
        return aValue > bValue ? -1 : aValue < bValue ? 1 : 0
      }
    })

    return filtered
  }, [analytics.detailedStudentProgress, searchTerm, sortField, sortDirection, filterStatus])

  // Simple chart component for enrollment trends
  const EnrollmentTrendChart = () => {
    const maxValue = Math.max(...analytics.enrollmentTrends.map(d => Math.max(d.enrollments, d.completions)))
    
    return (
      <div className="space-y-2">
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>Last 30 Days</span>
          <div className="flex gap-4">
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <span>Enrollments</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span>Completions</span>
            </div>
          </div>
        </div>
        <div className="flex items-end gap-1 h-20">
          {analytics.enrollmentTrends.slice(-14).map((data, index) => (
            <div key={index} className="flex-1 flex flex-col items-center gap-1">
              <div className="flex flex-col items-center gap-0.5 w-full">
                <div 
                  className="bg-blue-500 rounded-sm w-full min-h-[2px]"
                  style={{ height: `${(data.enrollments / maxValue) * 60}px` }}
                ></div>
                <div 
                  className="bg-green-500 rounded-sm w-full min-h-[2px]"
                  style={{ height: `${(data.completions / maxValue) * 60}px` }}
                ></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Overview Cards */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Student Analytics
          </CardTitle>
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

      {/* Enrollment Trends Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Enrollment Trends
          </CardTitle>
        </CardHeader>
        <CardContent>
          <EnrollmentTrendChart />
        </CardContent>
      </Card>

      {/* Top Performing Students */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5" />
            Top Performing Students
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {analytics.topPerformingStudents.slice(0, 5).map((student, index) => (
              <div key={student.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center w-8 h-8 bg-blue-100 text-blue-600 rounded-full text-sm font-semibold">
                    {index + 1}
                  </div>
                  <div>
                    <div className="font-medium">{student.name}</div>
                    <div className="text-sm text-muted-foreground">
                      {student.completedLessons} lessons • {student.coursesCompleted} courses completed
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-lg font-bold text-green-600">
                    {student.completionRate}%
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Detailed Student Progress */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Student Progress Details</CardTitle>
            <div className="flex gap-2">
              <StudentProgressExportButton />
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowDetailedView(!showDetailedView)}
                className="touch-manipulation"
                aria-expanded={showDetailedView}
                aria-controls="student-details-section"
              >
                {showDetailedView ? 'Hide Details' : 'Show Details'}
              </Button>
            </div>
          </div>
        </CardHeader>
        {showDetailedView && (
          <CardContent id="student-details-section" className="space-y-4">
            {/* Filters and Search */}
            <div className="flex flex-col gap-3 sm:gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search students..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <div className="flex flex-col sm:flex-row gap-2 sm:gap-4">
                <Select value={filterStatus} onValueChange={(value: FilterStatus) => setFilterStatus(value)}>
                  <SelectTrigger className="w-full sm:w-[140px]">
                    <Filter className="h-4 w-4 mr-2" />
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={`${sortField}-${sortDirection}`} onValueChange={(value) => {
                  const [field, direction] = value.split('-')
                  setSortField(field as SortField)
                  setSortDirection(direction as SortDirection)
                }}>
                  <SelectTrigger className="w-full sm:w-[180px]">
                    <ArrowUpDown className="h-4 w-4 mr-2" />
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="completionRate-desc">Completion Rate ↓</SelectItem>
                    <SelectItem value="completionRate-asc">Completion Rate ↑</SelectItem>
                    <SelectItem value="name-asc">Name A-Z</SelectItem>
                    <SelectItem value="name-desc">Name Z-A</SelectItem>
                    <SelectItem value="enrolledAt-desc">Recently Enrolled</SelectItem>
                    <SelectItem value="lastActivity-desc">Recently Active</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Student List */}
            <div className="space-y-3">
              {filteredAndSortedStudents.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No students found matching your criteria.
                </div>
              ) : (
                filteredAndSortedStudents.map((student) => (
                  <div key={student.id} className="border rounded-lg p-3 sm:p-4 space-y-3">
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                      <div className="space-y-1 min-w-0 flex-1">
                        <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                          <h4 className="font-medium truncate">{student.name}</h4>
                          {getStatusBadge(student.status)}
                        </div>
                        <p className="text-sm text-muted-foreground truncate">{student.email}</p>
                        <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4 text-xs text-muted-foreground">
                          <span>Enrolled: {formatDate(student.enrolledAt)}</span>
                          <span>Last Activity: {formatDate(student.lastActivity)}</span>
                        </div>
                      </div>
                      <div className="text-center sm:text-right flex-shrink-0">
                        <div className="text-xl sm:text-2xl font-bold text-blue-600">
                          {student.completionRate}%
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {student.completedLessons}/{student.totalLessons} lessons
                        </div>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Progress</span>
                        <span className="text-xs sm:text-sm">{student.completedLessons} of {student.totalLessons} lessons</span>
                      </div>
                      <Progress value={student.completionRate} className="h-2" />
                    </div>
                    
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
                      <div className="flex flex-col sm:flex-row gap-1 sm:gap-4 text-xs sm:text-sm text-muted-foreground">
                        <span>Enrolled Courses: {student.enrolledCourses}</span>
                        <span>Status: {student.status}</span>
                      </div>
                      <StudentProgressExportButton studentId={student.id} />
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        )}
      </Card>
    </div>
  )
}