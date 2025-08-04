import { Card, CardContent } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { BookOpen, Clock, CheckCircle } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import type { EnrolledCourse } from "../lib/student-data"

interface EnrolledCoursesSectionProps {
  courses: EnrolledCourse[]
  totalEnrollments: number
}

export function EnrolledCoursesSection({ courses, totalEnrollments }: EnrolledCoursesSectionProps) {
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
    <div className="space-y-4">
      {/* Summary Stats */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-600">
          You're enrolled in {totalEnrollments} course{totalEnrollments !== 1 ? 's' : ''}
        </p>
        <Link 
          href="/courses"
          className="text-sm text-blue-600 hover:text-blue-700 font-medium"
        >
          Browse more courses →
        </Link>
      </div>

      {/* Courses Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {courses.map((course) => (
          <Card key={course.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-0">
              {/* Course Thumbnail */}
              <div className="relative h-40 bg-gray-100 rounded-t-lg overflow-hidden">
                {course.thumbnail ? (
                  <Image
                    src={course.thumbnail}
                    alt={course.title}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="flex items-center justify-center h-full bg-gradient-to-br from-blue-50 to-blue-100">
                    <BookOpen className="h-12 w-12 text-blue-400" />
                  </div>
                )}
                
                {/* Status Badge */}
                <div className="absolute top-3 right-3">
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
              </div>

              {/* Course Info */}
              <div className="p-4 space-y-3">
                <div>
                  <h3 className="font-semibold text-gray-900 line-clamp-2 mb-1">
                    {course.title}
                  </h3>
                  <p className="text-sm text-gray-600">
                    {course.completedLessons} of {course.totalLessons} lessons completed
                  </p>
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
                  <Progress value={course.progress} className="h-2" />
                </div>

                {/* Last Accessed */}
                {course.lastAccessed && (
                  <p className="text-xs text-gray-500">
                    Last accessed: {new Date(course.lastAccessed).toLocaleDateString()}
                  </p>
                )}

                {/* Continue Button */}
                <Link 
                  href={`/courses/${course.id}`}
                  className="block w-full text-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 transition-colors"
                >
                  {course.status === 'completed' ? 'Review Course' : 'Continue Learning'}
                </Link>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}