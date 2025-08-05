"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { 
  StudentProgressExportButton, 
  CourseAnalyticsExportButton, 
  EnrollmentTrendsExportButton 
} from "@/components/dashboard/export-button"
import { FileText, Users, TrendingUp, BarChart3 } from "lucide-react"

interface ExportPanelProps {
  totalStudents: number
  totalCourses: number
}

export function ExportPanel({ totalStudents, totalCourses }: ExportPanelProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          Data Export & Reports
        </CardTitle>
        <CardDescription>
          Export student progress, course analytics, and generate reports for analysis
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Student Progress Reports */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-muted-foreground" />
            <h4 className="font-medium">Student Progress Reports</h4>
          </div>
          <p className="text-sm text-muted-foreground">
            Export detailed progress data for all {totalStudents} students enrolled in your courses
          </p>
          <div className="flex gap-2">
            <StudentProgressExportButton />
          </div>
        </div>

        <Separator />

        {/* Course Analytics */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
            <h4 className="font-medium">Course Analytics</h4>
          </div>
          <p className="text-sm text-muted-foreground">
            Export analytics data for all {totalCourses} courses including enrollment and completion rates
          </p>
          <div className="flex gap-2">
            <CourseAnalyticsExportButton />
          </div>
        </div>

        <Separator />

        {/* Enrollment Trends */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
            <h4 className="font-medium">Enrollment Trends</h4>
          </div>
          <p className="text-sm text-muted-foreground">
            Export daily enrollment and completion trends for the last 30 days
          </p>
          <div className="flex gap-2">
            <EnrollmentTrendsExportButton />
          </div>
        </div>

        {/* Export Tips */}
        <div className="bg-muted/50 rounded-lg p-4 space-y-2">
          <h5 className="font-medium text-sm">Export Tips</h5>
          <ul className="text-xs text-muted-foreground space-y-1">
            <li>• CSV files can be opened in Excel or Google Sheets for analysis</li>
            <li>• PDF reports are formatted for printing and sharing</li>
            <li>• All exports include data from your courses only</li>
            <li>• Large datasets may take a few moments to generate</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  )
}