"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { BookOpen, Clock, CheckCircle, Calendar } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import type { EnrolledCourse } from "../lib/student-data"

interface CourseProgressSectionProps {
  courses: EnrolledCourse[]
}

export function CourseProgressSection({ courses }: CourseProgressSectionProps) {
  if (courses.length === 0) {
    return (
      <Card className="border-dashed border-2 border-gray-200">
        <CardContent className="flex flex-col items-center justify-center py-12">
          <BookOpen className="h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No courses enrolled yet
          </h3>
          <p className="text-gray-600 text-center mb-6 max-w-md">
            Start your learning journey by browsing and enrolling in courses that interest you.
          </p>
          <Link 
            href="/courses"
            className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            Browse Courses
          </Link>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Course Progress Cards */}
      <div className="grid grid-cols-1 gap-4">
        {courses.map((course) => (
          <Card key={course.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex flex-col sm:flex-row gap-4">
                {/* Course Thumbnail */}
                <div className="flex-shrink-0">
                  <div className="relative w-full sm:w-20 h-20 bg-gray-100 rounded-lg overflow-hidden">
                    {course.thumbnail ? (
                      <Image
                        src={course.thumbnail}
                        alt={course.title}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="flex items-center justify-center h-full bg-gradient-to-br from-blue-50 to-blue-100">
                        <BookOpen className="h-8 w-8 text-blue-400" />
                      </div>
                    )}
                  </div>
                </div>

                {/* Course Info and Progress */}
                <div className="flex-1 space-y-3">
                  {/* Course Title and Status */}
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 text-lg mb-1">
                        {course.title}
                      </h3>
                      <p className="text-sm text-gray-600">
                        {course.completedLessons} of {course.totalLessons} lessons completed
                      </p>
                    </div>
                    
                    {/* Status Badge */}
                    <Badge 
                      variant={course.status === 'completed' ? 'default' : 'secondary'}
                      className={
                        course.status === 'completed' 
                          ? 'bg-green-100 text-green-800 hover:bg-green-100' 
                          : 'bg-blue-100 text-blue-800 hover:bg-blue-100'
                      }
                    >
                      {course.status === 'completed' ? (
                        <>
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Completed
                        </>
                      ) : (
                        <>
                          <Clock className="h-3 w-3 mr-1" />
                          In Progress
                        </>
                      )}
                    </Badge>
                  </div>

                  {/* Progress Bar */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-700">
                        Progress
                      </span>
                      <span className="text-sm font-semibold text-blue-600">
                        {course.progress}%
                      </span>
                    </div>
                    <Progress 
                      value={course.progress} 
                      className="h-3 w-full"
                    />
                  </div>

                  {/* Last Accessed and Action */}
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    {course.lastAccessed && (
                      <div className="flex items-center text-xs text-gray-500">
                        <Calendar className="h-3 w-3 mr-1" />
                        Last accessed: {new Date(course.lastAccessed).toLocaleDateString()}
                      </div>
                    )}
                    
                    <Link 
                      href={`/courses/${course.id}`}
                      className="inline-flex items-center justify-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 transition-colors"
                    >
                      {course.status === 'completed' ? 'Review Course' : 'Continue Learning'}
                    </Link>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Browse More Courses Link */}
      <div className="text-center">
        <Link 
          href="/courses"
          className="inline-flex items-center text-sm text-blue-600 hover:text-blue-700 font-medium"
        >
          Browse more courses →
        </Link>
      </div>
    </div>
  )
}