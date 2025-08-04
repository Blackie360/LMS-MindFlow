"use client"

import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { CheckCircle, Clock, Globe, AlertTriangle } from "lucide-react"
import type { Course } from "@prisma/client"

interface PublishStatusIndicatorProps {
  course: Course
  lessonsCount: number
  completedLessons: number
}

export function PublishStatusIndicator({ course, lessonsCount, completedLessons }: PublishStatusIndicatorProps) {
  const getPublishReadiness = () => {
    const checks = [
      { name: "Course title", completed: !!course.title },
      { name: "Course description", completed: !!course.description && course.description.length >= 50 },
      { name: "At least one lesson", completed: lessonsCount > 0 },
      { name: "All lessons complete", completed: lessonsCount > 0 && completedLessons === lessonsCount },
      { name: "Cover image", completed: !!course.cover_image },
      { name: "Category selected", completed: !!course.category_id },
    ]

    const completedChecks = checks.filter((check) => check.completed).length
    const progress = (completedChecks / checks.length) * 100

    return {
      checks,
      completedChecks,
      totalChecks: checks.length,
      progress,
      isReady: completedChecks >= 4, // Minimum requirements
      isPerfect: completedChecks === checks.length,
    }
  }

  const readiness = getPublishReadiness()

  const getStatusIcon = () => {
    if (course.status === "published") {
      return <Globe className="w-4 h-4 text-green-600" />
    } else if (readiness.isReady) {
      return <CheckCircle className="w-4 h-4 text-blue-600" />
    } else {
      return <Clock className="w-4 h-4 text-orange-600" />
    }
  }

  const getStatusText = () => {
    if (course.status === "published") {
      return "Published"
    } else if (readiness.isReady) {
      return "Ready to Publish"
    } else {
      return "In Development"
    }
  }

  const getStatusColor = () => {
    if (course.status === "published") {
      return "default"
    } else if (readiness.isReady) {
      return "secondary"
    } else {
      return "outline"
    }
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between text-base">
          <span>Publishing Status</span>
          <Badge variant={getStatusColor()} className="flex items-center space-x-1">
            {getStatusIcon()}
            <span>{getStatusText()}</span>
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Completion</span>
            <span>
              {readiness.completedChecks}/{readiness.totalChecks}
            </span>
          </div>
          <Progress value={readiness.progress} className="h-2" />
        </div>

        <div className="space-y-2">
          {readiness.checks.map((check, index) => (
            <div key={index} className="flex items-center justify-between text-sm">
              <span className={check.completed ? "text-foreground" : "text-muted-foreground"}>{check.name}</span>
              {check.completed ? (
                <CheckCircle className="w-4 h-4 text-green-600" />
              ) : (
                <div className="w-4 h-4 rounded-full border-2 border-muted-foreground/30" />
              )}
            </div>
          ))}
        </div>

        {!readiness.isReady && (
          <div className="pt-2 border-t">
            <div className="flex items-start space-x-2 text-sm text-muted-foreground">
              <AlertTriangle className="w-4 h-4 mt-0.5 text-orange-500" />
              <span>Complete the missing items above to enable publishing.</span>
            </div>
          </div>
        )}

        {course.status === "published" && (
          <div className="pt-2 border-t">
            <div className="flex items-start space-x-2 text-sm text-green-600">
              <CheckCircle className="w-4 h-4 mt-0.5" />
              <span>Your course is live and available to students!</span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
