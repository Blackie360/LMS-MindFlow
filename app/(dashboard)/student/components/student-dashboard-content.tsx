"use client"

import { ProgressStatsCards } from "./progress-stats-cards"
import { EnhancedProgressStats } from "./enhanced-progress-stats"
import { CourseProgressSection } from "./course-progress-section"
import { UpcomingActivities } from "./upcoming-activities"
import { StudentExportPanel } from "./student-export-panel"
import { ErrorBoundary } from "@/components/dashboard/error-boundary"
import { FallbackUI, StatsSkeleton, CourseListSkeleton } from "@/components/dashboard/fallback-ui"
import { useDashboardData } from "@/hooks/use-dashboard-data"
import { createErrorFallback } from "@/lib/error-handling"
import type { StudentDashboardData } from "../lib/student-data"

interface StudentDashboardContentProps {
  userId: string
}

export function StudentDashboardContent({ userId }: StudentDashboardContentProps) {
  const { data: dashboardData, loading, error, retry, isStale } = useDashboardData<StudentDashboardData>(
    `/api/student/dashboard?userId=${userId}`,
    {
      retryAttempts: 3,
      showErrorToasts: true,
      onError: (error) => {
        console.error("Student dashboard data fetch failed:", error)
      }
    }
  )

  if (loading) {
    return (
      <div className="space-y-6 sm:space-y-8">
        <section>
          <h2 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4">Your Progress</h2>
          <StatsSkeleton />
        </section>
        
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 sm:gap-8">
          <section className="xl:col-span-2">
            <h2 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4">My Courses</h2>
            <CourseListSkeleton />
          </section>
          
          <section className="xl:col-span-1">
            <h2 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4">Upcoming Activities</h2>
            <FallbackUI type="loading" />
          </section>
        </div>
      </div>
    )
  }

  if (error || !dashboardData) {
    return (
      <FallbackUI
        type="error"
        title="Unable to load dashboard"
        description="We're having trouble loading your dashboard data. This might be due to a network issue or server problem."
        onRetry={retry}
      />
    )
  }

  return (
    <ErrorBoundary
      fallback={createErrorFallback(
        "Dashboard Error",
        "Something went wrong while displaying your dashboard. Please try refreshing.",
        retry
      )}
    >
      <div className="space-y-6 sm:space-y-8">
        {/* Data staleness indicator */}
        {isStale && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-md p-3">
            <p className="text-sm text-yellow-800">
              Your dashboard data might be outdated. 
              <button 
                onClick={retry} 
                className="ml-2 underline hover:no-underline"
              >
                Refresh now
              </button>
            </p>
          </div>
        )}

        {/* Progress Statistics Cards */}
        <ErrorBoundary
          fallback={createErrorFallback(
            "Progress Stats Error",
            "Unable to load your progress statistics."
          )}
        >
          <section>
            <h2 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4">Your Progress</h2>
            <EnhancedProgressStats stats={dashboardData.progressStats} />
          </section>
        </ErrorBoundary>

        {/* Responsive layout for courses and upcoming activities */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 sm:gap-8">
          {/* Course Progress Section */}
          <ErrorBoundary
            fallback={createErrorFallback(
              "Courses Error",
              "Unable to load your course progress."
            )}
          >
            <section className="xl:col-span-2">
              <h2 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4">My Courses</h2>
              <CourseProgressSection courses={dashboardData.enrolledCourses} />
            </section>
          </ErrorBoundary>

          {/* Upcoming Activities Section */}
          <ErrorBoundary
            fallback={createErrorFallback(
              "Activities Error",
              "Unable to load your upcoming activities."
            )}
          >
            <section className="xl:col-span-1">
              <UpcomingActivities activities={dashboardData.upcomingActivities} />
            </section>
          </ErrorBoundary>
        </div>

        {/* Export Panel and Additional Features */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 sm:gap-8">
          <ErrorBoundary
            fallback={createErrorFallback(
              "Export Panel Error",
              "Unable to load export panel."
            )}
          >
            <section className="xl:col-span-1">
              <StudentExportPanel enrolledCourses={dashboardData.enrolledCourses} />
            </section>
          </ErrorBoundary>
        </div>
      </div>
    </ErrorBoundary>
  )
}