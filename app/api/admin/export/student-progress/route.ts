import { NextRequest, NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/session"
import { getAdminDashboardData } from "@/app/(dashboard)/admin/lib/admin-data"
import { generateStudentProgressCSV, generateStudentProgressPDF } from "@/lib/export-utils"
import { generateStudentProgressPDF as generatePDF } from "@/lib/pdf-generator"

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    
    if (!user || user.role !== "INSTRUCTOR") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const format = searchParams.get('format') || 'csv'
    const studentId = searchParams.get('studentId')

    // Get admin dashboard data which includes student progress
    const dashboardData = await getAdminDashboardData(user.id)
    let studentsData = dashboardData.studentAnalytics.detailedStudentProgress

    // Filter by specific student if requested
    if (studentId) {
      studentsData = studentsData.filter(student => student.id === studentId)
      if (studentsData.length === 0) {
        return NextResponse.json({ error: "Student not found" }, { status: 404 })
      }
    }

    if (format === 'csv') {
      const csvContent = generateStudentProgressCSV(studentsData)
      
      return new NextResponse(csvContent, {
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': `attachment; filename="student_progress_${new Date().toISOString().split('T')[0]}.csv"`
        }
      })
    } else if (format === 'pdf') {
      if (studentId && studentsData.length === 1) {
        // Generate individual student PDF
        const student = studentsData[0]
        const pdfBuffer = generatePDF(student, [])
        
        return new NextResponse(pdfBuffer, {
          headers: {
            'Content-Type': 'application/pdf',
            'Content-Disposition': `attachment; filename="student_progress_${student.name.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf"`
          }
        })
      } else {
        return NextResponse.json({ 
          error: "PDF format requires a specific student ID" 
        }, { status: 400 })
      }
    }

    return NextResponse.json({ error: "Invalid format" }, { status: 400 })
  } catch (error) {
    console.error("Export error:", error)
    return NextResponse.json({ 
      error: "Failed to export student progress data" 
    }, { status: 500 })
  }
}