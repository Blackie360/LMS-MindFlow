"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Download, FileText, FileSpreadsheet, Loader2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface ExportButtonProps {
  endpoint: string
  filename: string
  label?: string
  variant?: "default" | "outline" | "ghost"
  size?: "default" | "sm" | "lg"
  formats?: ('csv' | 'pdf')[]
  queryParams?: Record<string, string>
}

export function ExportButton({
  endpoint,
  filename,
  label = "Export",
  variant = "outline",
  size = "sm",
  formats = ['csv', 'pdf'],
  queryParams = {}
}: ExportButtonProps) {
  const [isExporting, setIsExporting] = useState(false)
  const { toast } = useToast()

  const handleExport = async (format: 'csv' | 'pdf') => {
    setIsExporting(true)
    
    try {
      const params = new URLSearchParams({
        format,
        ...queryParams
      })
      
      const response = await fetch(`${endpoint}?${params}`)
      
      if (!response.ok) {
        let errorMessage = 'Export failed'
        try {
          const errorData = await response.json()
          errorMessage = errorData.error || errorMessage
        } catch {
          // If response is not JSON, use status text
          errorMessage = response.statusText || errorMessage
        }
        throw new Error(errorMessage)
      }

      // Create download
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${filename}_${new Date().toISOString().split('T')[0]}.${format}`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)

      toast({
        title: "Export successful",
        description: `Your ${format.toUpperCase()} file has been downloaded.`,
      })
    } catch (error) {
      console.error('Export error:', error)
      toast({
        title: "Export failed",
        description: error instanceof Error ? error.message : "Failed to export data",
        variant: "destructive",
      })
    } finally {
      setIsExporting(false)
    }
  }

  if (formats.length === 1) {
    const format = formats[0]
    return (
      <Button
        variant={variant}
        size={size}
        onClick={() => handleExport(format)}
        disabled={isExporting}
      >
        {isExporting ? (
          <Loader2 className="h-4 w-4 animate-spin mr-2" />
        ) : format === 'csv' ? (
          <FileSpreadsheet className="h-4 w-4 mr-2" />
        ) : (
          <FileText className="h-4 w-4 mr-2" />
        )}
        {isExporting ? 'Exporting...' : `${label} ${format.toUpperCase()}`}
      </Button>
    )
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant={variant} size={size} disabled={isExporting}>
          {isExporting ? (
            <Loader2 className="h-4 w-4 animate-spin mr-2" />
          ) : (
            <Download className="h-4 w-4 mr-2" />
          )}
          {isExporting ? 'Exporting...' : label}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {formats.includes('csv') && (
          <DropdownMenuItem onClick={() => handleExport('csv')}>
            <FileSpreadsheet className="h-4 w-4 mr-2" />
            Export as CSV
          </DropdownMenuItem>
        )}
        {formats.includes('pdf') && (
          <DropdownMenuItem onClick={() => handleExport('pdf')}>
            <FileText className="h-4 w-4 mr-2" />
            Export as PDF
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

// Specialized export buttons for common use cases
export function StudentProgressExportButton({ studentId }: { studentId?: string }) {
  return (
    <ExportButton
      endpoint="/api/admin/export/student-progress"
      filename="student_progress"
      label="Export Progress"
      queryParams={studentId ? { studentId } : {}}
    />
  )
}

export function CourseAnalyticsExportButton() {
  return (
    <ExportButton
      endpoint="/api/admin/export/course-analytics"
      filename="course_analytics"
      label="Export Analytics"
      queryParams={{ type: 'courses' }}
    />
  )
}

export function EnrollmentTrendsExportButton() {
  return (
    <ExportButton
      endpoint="/api/admin/export/course-analytics"
      filename="enrollment_trends"
      label="Export Trends"
      formats={['csv']}
      queryParams={{ type: 'enrollment-trends' }}
    />
  )
}

export function StudentReportExportButton() {
  return (
    <ExportButton
      endpoint="/api/student/export/progress-report"
      filename="my_progress_report"
      label="Export My Progress"
    />
  )
}

export function CertificateDownloadButton({ courseId }: { courseId: string }) {
  return (
    <ExportButton
      endpoint="/api/student/export/certificate"
      filename="certificate"
      label="Download Certificate"
      formats={['pdf']}
      queryParams={{ courseId }}
    />
  )
}