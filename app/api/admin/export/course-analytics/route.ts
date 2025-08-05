import { NextRequest, NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/session"
import { getAdminDashboardData } from "@/app/(dashboard)/admin/lib/admin-data"
import { generateCourseAnalyticsCSV, generateEnrollmentTrendsCSV } from "@/lib/export-utils"
import { generateCourseAnalyticsPDF } from "@/lib/pdf-generator"

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    
    if (!user || user.role !== "INSTRUCTOR") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const format = searchParams.get('format') || 'csv'
    const reportType = searchParams.get('type') || 'courses'

    // Get admin dashboard data
    const dashboardData = await getAdminDashboardData(user.id)

    if (reportType === 'courses') {
      const coursesData = dashboardData.courseManagement.myCourses
      
      if (format === 'csv') {
        const csvContent = generateCourseAnalyticsCSV(
          coursesData, 
          dashboardData.studentAnalytics.detailedStudentProgress
        )
        
        return new NextResponse(csvContent, {
          headers: {
            'Content-Type': 'text/csv',
            'Content-Disposition': `attachment; filename="course_analytics_${new Date().toISOString().split('T')[0]}.csv"`
          }
        })
      } else if (format === 'pdf') {
        const pdfBuffer = generateCourseAnalyticsPDF(coursesData, user.name || user.email)
        
        return new NextResponse(pdfBuffer, {
          headers: {
            'Content-Type': 'application/pdf',
            'Content-Disposition': `attachment; filename="course_analytics_${new Date().toISOString().split('T')[0]}.pdf"`
          }
        })
      }
    } else if (reportType === 'enrollment-trends') {
      const trendsData = dashboardData.studentAnalytics.enrollmentTrends
      
      if (format === 'csv') {
        const csvContent = generateEnrollmentTrendsCSV(trendsData)
        
        return new NextResponse(csvContent, {
          headers: {
            'Content-Type': 'text/csv',
            'Content-Disposition': `attachment; filename="enrollment_trends_${new Date().toISOString().split('T')[0]}.csv"`
          }
        })
      }
    }

    return NextResponse.json({ error: "Invalid format or report type" }, { status: 400 })
  } catch (error) {
    console.error("Export error:", error)
    return NextResponse.json({ 
      error: "Failed to export course analytics data" 
    }, { status: 500 })
  }
}