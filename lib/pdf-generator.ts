import jsPDF from 'jspdf'
import { StudentProgressData } from "@/app/(dashboard)/admin/lib/admin-data"
import { StudentDashboardData } from "@/app/(dashboard)/student/lib/student-data"

// PDF Generation Utilities
export class PDFGenerator {
  private doc: jsPDF
  private pageHeight: number
  private pageWidth: number
  private margin: number
  private currentY: number

  constructor() {
    this.doc = new jsPDF()
    this.pageHeight = this.doc.internal.pageSize.height
    this.pageWidth = this.doc.internal.pageSize.width
    this.margin = 20
    this.currentY = this.margin
  }

  private addHeader(title: string, subtitle?: string) {
    this.doc.setFontSize(20)
    this.doc.setFont('helvetica', 'bold')
    this.doc.text(title, this.margin, this.currentY)
    this.currentY += 15

    if (subtitle) {
      this.doc.setFontSize(12)
      this.doc.setFont('helvetica', 'normal')
      this.doc.text(subtitle, this.margin, this.currentY)
      this.currentY += 10
    }

    this.currentY += 10
  }

  private addSection(title: string) {
    this.checkPageBreak(20)
    this.doc.setFontSize(14)
    this.doc.setFont('helvetica', 'bold')
    this.doc.text(title, this.margin, this.currentY)
    this.currentY += 12
  }

  private addText(text: string, fontSize: number = 10) {
    this.checkPageBreak(10)
    this.doc.setFontSize(fontSize)
    this.doc.setFont('helvetica', 'normal')
    
    // Handle text wrapping
    const lines = this.doc.splitTextToSize(text, this.pageWidth - (this.margin * 2))
    this.doc.text(lines, this.margin, this.currentY)
    this.currentY += lines.length * 6
  }

  private addKeyValue(key: string, value: string) {
    this.checkPageBreak(8)
    this.doc.setFontSize(10)
    this.doc.setFont('helvetica', 'bold')
    this.doc.text(`${key}:`, this.margin, this.currentY)
    
    this.doc.setFont('helvetica', 'normal')
    this.doc.text(value, this.margin + 60, this.currentY)
    this.currentY += 8
  }

  private addProgressBar(label: string, percentage: number, width: number = 100) {
    this.checkPageBreak(15)
    
    // Label
    this.doc.setFontSize(10)
    this.doc.setFont('helvetica', 'normal')
    this.doc.text(label, this.margin, this.currentY)
    
    // Progress bar background
    this.doc.setFillColor(240, 240, 240)
    this.doc.rect(this.margin, this.currentY + 3, width, 6, 'F')
    
    // Progress bar fill
    const fillWidth = (percentage / 100) * width
    this.doc.setFillColor(34, 197, 94) // Green color
    this.doc.rect(this.margin, this.currentY + 3, fillWidth, 6, 'F')
    
    // Percentage text
    this.doc.text(`${percentage}%`, this.margin + width + 5, this.currentY + 7)
    
    this.currentY += 20
  }

  private checkPageBreak(requiredSpace: number) {
    if (this.currentY + requiredSpace > this.pageHeight - this.margin) {
      this.doc.addPage()
      this.currentY = this.margin
    }
  }

  private addFooter() {
    const pageCount = this.doc.getNumberOfPages()
    for (let i = 1; i <= pageCount; i++) {
      this.doc.setPage(i)
      this.doc.setFontSize(8)
      this.doc.setFont('helvetica', 'normal')
      this.doc.text(
        `Generated on ${new Date().toLocaleDateString()} - Page ${i} of ${pageCount}`,
        this.margin,
        this.pageHeight - 10
      )
      this.doc.text(
        'MindFlow Learning Management System',
        this.pageWidth - this.margin - 60,
        this.pageHeight - 10
      )
    }
  }

  // Generate Student Progress Report PDF
  generateStudentProgressReport(
    studentData: StudentProgressData,
    courseDetails: any[] = []
  ): Uint8Array {
    this.addHeader(
      'Student Progress Report',
      `Generated for ${studentData.name}`
    )

    // Student Information
    this.addSection('Student Information')
    this.addKeyValue('Name', studentData.name)
    this.addKeyValue('Email', studentData.email)
    this.addKeyValue('Enrolled Courses', studentData.enrolledCourses.toString())
    this.addKeyValue('Status', studentData.status.toUpperCase())
    this.addKeyValue('Last Activity', studentData.lastActivity?.toLocaleDateString() || 'Never')
    this.addKeyValue('Enrolled Date', studentData.enrolledAt.toLocaleDateString())

    this.currentY += 10

    // Progress Overview
    this.addSection('Progress Overview')
    this.addProgressBar(
      'Overall Completion Rate',
      studentData.completionRate
    )
    this.addKeyValue('Completed Lessons', `${studentData.completedLessons} of ${studentData.totalLessons}`)

    // Course Details
    if (courseDetails.length > 0) {
      this.addSection('Course Progress Details')
      courseDetails.forEach(course => {
        this.addText(`Course: ${course.title}`, 12)
        this.addProgressBar(`Progress`, course.progress || 0, 80)
        this.currentY += 5
      })
    }

    this.addFooter()
    return this.doc.output('arraybuffer') as Uint8Array
  }

  // Generate Individual Student Dashboard Report
  generateStudentDashboardReport(
    studentData: StudentDashboardData,
    studentInfo: { name: string, email: string }
  ): Uint8Array {
    this.addHeader(
      'Personal Learning Report',
      `${studentInfo.name} - ${new Date().toLocaleDateString()}`
    )

    // Progress Statistics
    this.addSection('Learning Progress')
    this.addProgressBar(
      'Lessons Completed',
      studentData.progressStats.totalLessons > 0 
        ? Math.round((studentData.progressStats.lessonsCompleted / studentData.progressStats.totalLessons) * 100)
        : 0
    )
    
    this.addKeyValue('Lessons Completed', `${studentData.progressStats.lessonsCompleted} of ${studentData.progressStats.totalLessons}`)
    this.addKeyValue('Assignments Completed', `${studentData.progressStats.assignmentsCompleted} of ${studentData.progressStats.totalAssignments}`)
    this.addKeyValue('Tests Completed', `${studentData.progressStats.testsCompleted} of ${studentData.progressStats.totalTests}`)

    // Course Progress
    this.addSection('Course Progress')
    studentData.enrolledCourses.forEach(course => {
      this.addText(`${course.title}`, 12)
      this.addProgressBar('Progress', course.progress, 80)
      this.addKeyValue('Status', course.status.toUpperCase())
      this.addKeyValue('Last Accessed', course.lastAccessed?.toLocaleDateString() || 'Never')
      this.currentY += 5
    })

    // Upcoming Activities
    if (studentData.upcomingActivities.length > 0) {
      this.addSection('Upcoming Activities')
      studentData.upcomingActivities.slice(0, 10).forEach(activity => {
        this.addText(`${activity.title} (${activity.type.toUpperCase()})`)
        this.addKeyValue('Course', activity.courseName)
        this.addKeyValue('Due Date', activity.dueDate.toLocaleDateString())
        this.addKeyValue('Priority', activity.urgency.toUpperCase())
        this.currentY += 3
      })
    }

    this.addFooter()
    return this.doc.output('arraybuffer') as Uint8Array
  }

  // Generate Course Analytics Report
  generateCourseAnalyticsReport(
    courses: any[],
    instructorName: string
  ): Uint8Array {
    this.addHeader(
      'Course Analytics Report',
      `Instructor: ${instructorName}`
    )

    this.addSection('Course Overview')
    this.addKeyValue('Total Courses', courses.length.toString())
    this.addKeyValue('Published Courses', courses.filter(c => c.status === 'PUBLISHED').length.toString())
    this.addKeyValue('Draft Courses', courses.filter(c => c.status === 'DRAFT').length.toString())

    this.addSection('Course Details')
    courses.forEach(course => {
      this.addText(`${course.title}`, 14)
      this.addKeyValue('Status', course.status)
      this.addKeyValue('Enrollments', course.enrollmentCount.toString())
      this.addKeyValue('Created', course.createdAt.toLocaleDateString())
      this.addProgressBar('Completion Rate', course.completionRate, 80)
      this.currentY += 10
    })

    this.addFooter()
    return this.doc.output('arraybuffer') as Uint8Array
  }

  // Generate Certificate
  generateCertificate(
    studentName: string,
    courseName: string,
    completionDate: Date,
    instructorName: string
  ): Uint8Array {
    // Create landscape orientation for certificate
    this.doc = new jsPDF('landscape')
    this.pageWidth = this.doc.internal.pageSize.width
    this.pageHeight = this.doc.internal.pageSize.height
    
    // Certificate border
    this.doc.setLineWidth(3)
    this.doc.rect(20, 20, this.pageWidth - 40, this.pageHeight - 40)
    
    // Inner border
    this.doc.setLineWidth(1)
    this.doc.rect(30, 30, this.pageWidth - 60, this.pageHeight - 60)

    // Certificate title
    this.doc.setFontSize(36)
    this.doc.setFont('helvetica', 'bold')
    const titleText = 'Certificate of Completion'
    const titleWidth = this.doc.getTextWidth(titleText)
    this.doc.text(titleText, (this.pageWidth - titleWidth) / 2, 80)

    // Student name
    this.doc.setFontSize(24)
    this.doc.setFont('helvetica', 'normal')
    const nameText = `This certifies that ${studentName}`
    const nameWidth = this.doc.getTextWidth(nameText)
    this.doc.text(nameText, (this.pageWidth - nameWidth) / 2, 110)

    // Course completion text
    this.doc.setFontSize(18)
    const completionText = `has successfully completed the course`
    const completionWidth = this.doc.getTextWidth(completionText)
    this.doc.text(completionText, (this.pageWidth - completionWidth) / 2, 130)

    // Course name
    this.doc.setFontSize(22)
    this.doc.setFont('helvetica', 'bold')
    const courseWidth = this.doc.getTextWidth(courseName)
    this.doc.text(courseName, (this.pageWidth - courseWidth) / 2, 155)

    // Completion date
    this.doc.setFontSize(14)
    this.doc.setFont('helvetica', 'normal')
    const dateText = `Completed on ${completionDate.toLocaleDateString()}`
    const dateWidth = this.doc.getTextWidth(dateText)
    this.doc.text(dateText, (this.pageWidth - dateWidth) / 2, 180)

    // Instructor signature line
    this.doc.setFontSize(12)
    this.doc.text('Instructor:', 60, 220)
    this.doc.line(100, 220, 200, 220)
    this.doc.text(instructorName, 110, 235)

    // Date line
    this.doc.text('Date:', this.pageWidth - 160, 220)
    this.doc.line(this.pageWidth - 130, 220, this.pageWidth - 60, 220)
    this.doc.text(new Date().toLocaleDateString(), this.pageWidth - 120, 235)

    return this.doc.output('arraybuffer') as Uint8Array
  }
}

// Utility functions for easy PDF generation
export function generateStudentProgressPDF(studentData: StudentProgressData, courseDetails: any[] = []): Uint8Array {
  const generator = new PDFGenerator()
  return generator.generateStudentProgressReport(studentData, courseDetails)
}

export function generateStudentDashboardPDF(
  studentData: StudentDashboardData, 
  studentInfo: { name: string, email: string }
): Uint8Array {
  const generator = new PDFGenerator()
  return generator.generateStudentDashboardReport(studentData, studentInfo)
}

export function generateCourseAnalyticsPDF(courses: any[], instructorName: string): Uint8Array {
  const generator = new PDFGenerator()
  return generator.generateCourseAnalyticsReport(courses, instructorName)
}

export function generateCourseCertificatePDF(
  studentName: string,
  courseName: string,
  completionDate: Date,
  instructorName: string
): Uint8Array {
  const generator = new PDFGenerator()
  return generator.generateCertificate(studentName, courseName, completionDate, instructorName)
}