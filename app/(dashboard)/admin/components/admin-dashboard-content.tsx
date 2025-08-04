"use client"

import { useEffect, useState } from "react"
import { PlatformStatsCards } from "./platform-stats-cards"
import { CourseManagementPanel } from "./course-management-panel"
import { StudentAnalytics } from "./student-analytics"
import { AdminDashboardSkeleton } from "./admin-dashboard-skeleton"
import { DashboardErrorBoundary } from "./dashboard-error-boundary"
import type { AdminDashboardData } from "../lib/admin-data"

interface AdminDashboardContentProps {
  userId: string
}

export function AdminDashboardContent({ userId }: AdminDashboardContentProps) {
  const [dashboardData, setDashboardData] = useState<AdminDashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchDashboardData() {
      try {
        setLoading(true)
        setError(null)
        
        const response = await fetch(`/api/admin/dashboard?userId=${userId}`)
        if (!response.ok) {
          throw new Error('Failed to fetch dashboard data')
        }
        
        const data = await response.json()
        setDashboardData(data)
      } catch (err) {
        console.error("Error fetching admin dashboard data:", err)
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
    return <AdminDashboardSkeleton />
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
        {/* Platform Statistics Cards */}
        <section>
          <h2 className="text-xl font-semibold mb-4">Platform Overview</h2>
          <PlatformStatsCards stats={dashboardData.platformStats} />
        </section>

        {/* Two-column layout for course management and analytics */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Course Management Panel */}
          <section className="lg:col-span-2">
            <h2 className="text-xl font-semibold mb-4">Course Management</h2>
            <CourseManagementPanel courseData={dashboardData.courseManagement} />
          </section>

          {/* Student Analytics Section */}
          <section className="lg:col-span-1">
            <StudentAnalytics analytics={dashboardData.studentAnalytics} />
          </section>
        </div>
      </div>
    </DashboardErrorBoundary>
  )
}