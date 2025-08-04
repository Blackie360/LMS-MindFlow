"use client"

import { useEffect, useState } from "react"
import { ProgressStatsCards } from "./progress-stats-cards"
import { EnhancedProgressStats } from "./enhanced-progress-stats"
import { CourseProgressSection } from "./course-progress-section"
import { UpcomingActivities } from "./upcoming-activities"
import { DashboardErrorBoundary } from "./dashboard-error-boundary"
import { StudentDashboardSkeleton } from "./student-dashboard-skeleton"
import type { StudentDashboardData } from "../lib/student-data"

interface StudentDashboardContentProps {
  userId: string
}

export function StudentDashboardContent({ userId }: StudentDashboardContentProps) {
  const [dashboardData, setDashboardData] = useState<StudentDashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchDashboardData() {
      try {
        setLoading(true)
        setError(null)
        
        const response = await fetch(`/api/student/dashboard?userId=${userId}`)
        if (!response.ok) {
          throw new Error('Failed to fetch dashboard data')
        }
        
        const data = await response.json()
        setDashboardData(data)
      } catch (err) {
        console.error("Error fetching dashboard data:", err)
        setError(err instanceof Error ? err.message : 'An error occurred')
      } finally {
        setLoading(false)
      }
    }

    if (userId) {
      fetchDashboardData()
    }
  }, [userId])

  if (loading) {
    return <StudentDashboardSkeleton />
  }

  if (error || !dashboardData) {
    return (
      <div className="space-y-8">
        <div className="text-center py-12">
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Unable to load dashboard
          </h3>
          <p className="text-gray-600 mb-4">
            We're having trouble loading your dashboard data. Please try refreshing the page.
          </p>
          <button 
            onClick={() => window.location.reload()} 
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            Refresh Page
          </button>
        </div>
      </div>
    )
  }

  return (
    <DashboardErrorBoundary>
      <div className="space-y-8">
        {/* Progress Statistics Cards */}
        <section>
          <h2 className="text-xl font-semibold mb-4">Your Progress</h2>
          <EnhancedProgressStats stats={dashboardData.progressStats} />
        </section>

        {/* Two-column layout for courses and upcoming activities */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Course Progress Section */}
          <section className="lg:col-span-2">
            <h2 className="text-xl font-semibold mb-4">My Courses</h2>
            <CourseProgressSection courses={dashboardData.enrolledCourses} />
          </section>

          {/* Upcoming Activities Section */}
          <section className="lg:col-span-1">
            <UpcomingActivities activities={dashboardData.upcomingActivities} />
          </section>
        </div>
      </div>
    </DashboardErrorBoundary>
  )
}