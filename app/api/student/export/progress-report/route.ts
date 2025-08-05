import { NextRequest, NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/session"
import { getStudentDashboardData } from "@/app/(dashboard)/student/lib/student-data"
import { generateIndividualStudentCSV } from "@/lib/export-utils"
import { generateStudentDashboardPDF } from "@/lib/pdf-generator"

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    
    if (!user || user.role !== "STUDENT") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const format = searchParams.get('format') || 'csv'

    // Get student dashboard data
    const studentData = await getStudentDashboardData(user.id)
    const studentInfo = {
      name: user.name || 'Student',
      email: user.email
    }

    if (format === 'csv') {
      const csvContent = generateIndividualStudentCSV(studentData, studentInfo)
      
      return new NextResponse(csvContent, {
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': `attachment; filename="my_progress_report_${new Date().toISOString().split('T')[0]}.csv"`
        }
      })
    } else if (format === 'pdf') {
      const pdfBuffer = generateStudentDashboardPDF(studentData, studentInfo)
      
      return new NextResponse(pdfBuffer, {
        headers: {
          'Content-Type': 'application/pdf',
          'Content-Disposition': `attachment; filename="my_progress_report_${new Date().toISOString().split('T')[0]}.pdf"`
        }
      })
    }

    return NextResponse.json({ error: "Invalid format" }, { status: 400 })
  } catch (error) {
    console.error("Export error:", error)
    return NextResponse.json({ 
      error: "Failed to export progress report" 
    }, { status: 500 })
  }
}