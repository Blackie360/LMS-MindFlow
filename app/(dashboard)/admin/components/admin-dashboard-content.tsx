"use client"

import { PlatformStatsCards } from "./platform-stats-cards"
import { CourseManagementPanel } from "./course-management-panel"
import { StudentAnalytics } from "./student-analytics"
import { ExportPanel } from "./export-panel"
import { ErrorBoundary } from "@/components/dashboard/error-boundary"
import { FallbackUI, StatsSkeleton, CourseListSkeleton } from "@/components/dashboard/fallback-ui"
import { useDashboardData } from "@/hooks/use-dashboard-data"
import { createErrorFallback } from "@/lib/error-handling"
import type { AdminDashboardData } from "../lib/admin-data"

interface AdminDashboardContentProps {
  userId: string
}

export function AdminDashboardContent({ userId }: AdminDashboardContentProps) {
  const { data: dashboardData, loading, error, retry, isStale } = useDashboardData<AdminDashboardData>(
    `/api/admin/dashboard?userId=${userId}`,
    {
      retryAttempts: 3,
      showErrorToasts: true,
      onError: (error) => {
        console.error("Admin dashboard data fetch failed:", error)
      }
    }
  )

  if (loading) {
    return (
      <div className="space-y-6 sm:space-y-8">
        <section>
          <h2 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4">Platform Overview</h2>
          <StatsSkeleton />
        </section>
        
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 sm:gap-8">
          <section className="xl:col-span-2">
            <h2 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4">Course Management</h2>
            <CourseListSkeleton />
          </section>
          
          <section className="xl:col-span-1">
            <h2 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4">Student Analytics</h2>
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
        title="Unable to load admin dashboard"
        description="We're having trouble loading your admin dashboard data. This might be due to a network issue or server problem."
        onRetry={retry}
      />
    )
  }

  return (
    <ErrorBoundary
      fallback={createErrorFallback(
        "Admin Dashboard Error",
        "Something went wrong while displaying your admin dashboard. Please try refreshing.",
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

        {/* Platform Statistics Cards */}
        <ErrorBoundary
          fallback={createErrorFallback(
            "Platform Stats Error",
            "Unable to load platform statistics."
          )}
        >
          <section>
            <h2 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4">Platform Overview</h2>
            <PlatformStatsCards stats={dashboardData.platformStats} />
          </section>
        </ErrorBoundary>

        {/* Responsive layout for course management and analytics */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 sm:gap-8">
          {/* Course Management Panel */}
          <ErrorBoundary
            fallback={createErrorFallback(
              "Course Management Error",
              "Unable to load course management panel."
            )}
          >
            <section className="xl:col-span-2">
              <h2 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4">Course Management</h2>
              <CourseManagementPanel courseData={dashboardData.courseManagement} />
            </section>
          </ErrorBoundary>

          {/* Export Panel */}
          <ErrorBoundary
            fallback={createErrorFallback(
              "Export Panel Error",
              "Unable to load export panel."
            )}
          >
            <section className="xl:col-span-1">
              <ExportPanel 
                totalStudents={dashboardData.studentAnalytics?.detailedStudentProgress?.length || 0}
                totalCourses={dashboardData.courseManagement?.myCourses?.length || 0}
              />
            </section>
          </ErrorBoundary>
        </div>

        {/* Student Analytics Section - Full Width */}
        <ErrorBoundary
          fallback={createErrorFallback(
            "Analytics Error",
            "Unable to load student analytics."
          )}
        >
          <section>
            <StudentAnalytics analytics={dashboardData.studentAnalytics} />
          </section>
        </ErrorBoundary>
      </div>
    </ErrorBoundary>
  )
}