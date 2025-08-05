import { StudentProgressData, AdminDashboardData } from "@/app/(dashboard)/admin/lib/admin-data"
import { EnrolledCourse, StudentDashboardData } from "@/app/(dashboard)/student/lib/student-data"

// CSV Export Utilities
export function convertToCSV(data: any[], headers: string[]): string {
  const csvHeaders = headers.join(',')
  const csvRows = data.map(row => 
    headers.map(header => {
      const value = row[header]
      // Handle dates, nulls, and strings with commas
      if (value === null || value === undefined) return ''
      if (value instanceof Date) return value.toISOString().split('T')[0]
      if (typeof value === 'string' && value.includes(',')) return `"${value}"`
      return String(value)
    }).join(',')
  )
  
  return [csvHeaders, ...csvRows].join('\n')
}

// Student Progress Report Data
export interface StudentProgressReportData {
  studentName: string
  studentEmail: string
  enrolledCourses: number
  completedLessons: number
  totalLessons: number
  completionRate: number
  lastActivity: string
  enrolledAt: string
  status: string
  courseDetails: {
    courseName: string
    courseProgress: number
    lessonsCompleted: number
    totalLessons: number
  }[]
}

// Course Analytics Report Data
export interface CourseAnalyticsReportData {
  courseId: string
  courseTitle: string
  enrollmentCount: number
  completionRate: number
  averageProgress: number
  createdAt: string
  status: string
  studentDetails: {
    studentName: string
    studentEmail: string
    progress: number
    lastActivity: string
  }[]
}

// Generate Student Progress CSV
export function generateStudentProgressCSV(students: StudentProgressData[]): string {
  const headers = [
    'studentName',
    'studentEmail', 
    'enrolledCourses',
    'completedLessons',
    'totalLessons',
    'completionRate',
    'lastActivity',
    'enrolledAt',
    'status'
  ]
  
  const csvData = students.map(student => ({
    studentName: student.name,
    studentEmail: student.email,
    enrolledCourses: student.enrolledCourses,
    completedLessons: student.completedLessons,
    totalLessons: student.totalLessons,
    completionRate: `${student.completionRate}%`,
    lastActivity: student.lastActivity?.toISOString().split('T')[0] || 'Never',
    enrolledAt: student.enrolledAt.toISOString().split('T')[0],
    status: student.status
  }))
  
  return convertToCSV(csvData, headers)
}

// Generate Course Analytics CSV
export function generateCourseAnalyticsCSV(courses: any[], studentData: StudentProgressData[]): string {
  const headers = [
    'courseTitle',
    'enrollmentCount',
    'completionRate',
    'createdAt',
    'status'
  ]
  
  const csvData = courses.map(course => ({
    courseTitle: course.title,
    enrollmentCount: course.enrollmentCount,
    completionRate: `${course.completionRate}%`,
    createdAt: course.createdAt.toISOString().split('T')[0],
    status: course.status
  }))
  
  return convertToCSV(csvData, headers)
}

// Generate Individual Student Report CSV
export function generateIndividualStudentCSV(studentData: StudentDashboardData, studentInfo: { name: string, email: string }): string {
  const headers = [
    'courseName',
    'progress',
    'completedLessons',
    'totalLessons',
    'status',
    'lastAccessed'
  ]
  
  const csvData = studentData.enrolledCourses.map(course => ({
    courseName: course.title,
    progress: `${course.progress}%`,
    completedLessons: course.completedLessons,
    totalLessons: course.totalLessons,
    status: course.status,
    lastAccessed: course.lastAccessed?.toISOString().split('T')[0] || 'Never'
  }))
  
  return convertToCSV(csvData, headers)
}

// Generate Enrollment Trends CSV
export function generateEnrollmentTrendsCSV(trends: { date: string, enrollments: number, completions: number }[]): string {
  const headers = ['date', 'enrollments', 'completions']
  return convertToCSV(trends, headers)
}

// Utility to create downloadable blob
export function createDownloadBlob(content: string, type: 'csv' | 'pdf' = 'csv'): Blob {
  const mimeType = type === 'csv' ? 'text/csv' : 'application/pdf'
  return new Blob([content], { type: mimeType })
}

// Generate filename with timestamp
export function generateFilename(prefix: string, extension: string): string {
  const timestamp = new Date().toISOString().split('T')[0]
  return `${prefix}_${timestamp}.${extension}`
}