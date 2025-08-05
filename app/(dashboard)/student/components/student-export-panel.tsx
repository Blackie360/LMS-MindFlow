"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { StudentReportExportButton, CertificateDownloadButton } from "@/components/dashboard/export-button"
import { FileText, Download, Award } from "lucide-react"
import type { EnrolledCourse } from "../lib/student-data"

interface StudentExportPanelProps {
  enrolledCourses: EnrolledCourse[]
}

export function StudentExportPanel({ enrolledCourses }: StudentExportPanelProps) {
  const completedCourses = enrolledCourses.filter(course => course.status === 'completed')

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Download className="h-5 w-5" />
          Export & Certificates
        </CardTitle>
        <CardDescription>
          Download your progress reports and course certificates
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Progress Report */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <FileText className="h-4 w-4 text-muted-foreground" />
            <h4 className="font-medium">Progress Report</h4>
          </div>
          <p className="text-sm text-muted-foreground">
            Export a detailed report of your learning progress across all courses
          </p>
          <div className="flex gap-2">
            <StudentReportExportButton />
          </div>
        </div>

        <Separator />

        {/* Certificates */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Award className="h-4 w-4 text-muted-foreground" />
            <h4 className="font-medium">Course Certificates</h4>
          </div>
          <p className="text-sm text-muted-foreground">
            Download certificates for completed courses
          </p>
          
          {completedCourses.length > 0 ? (
            <div className="space-y-2">
              {completedCourses.map(course => (
                <div key={course.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                  <div>
                    <div className="font-medium text-sm">{course.title}</div>
                    <div className="text-xs text-muted-foreground">
                      Completed {course.progress}%
                    </div>
                  </div>
                  <CertificateDownloadButton courseId={course.id} />
                </div>
              ))}
            </div>
          ) : (
            <div className="text-sm text-muted-foreground bg-muted/50 rounded-lg p-4 text-center">
              Complete a course to earn your first certificate!
            </div>
          )}
        </div>

        {/* Export Tips */}
        <div className="bg-muted/50 rounded-lg p-4 space-y-2">
          <h5 className="font-medium text-sm">Export Tips</h5>
          <ul className="text-xs text-muted-foreground space-y-1">
            <li>• Progress reports include all your course data and statistics</li>
            <li>• Certificates are available only for 100% completed courses</li>
            <li>• PDF files are perfect for sharing with employers or schools</li>
            <li>• CSV files can be opened in Excel for personal analysis</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  )
}