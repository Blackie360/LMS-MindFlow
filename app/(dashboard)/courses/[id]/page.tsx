import { notFound, redirect } from "next/navigation"
import { Clock, Users, BookOpen } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { supabase } from "@/lib/supabase"
import { getCurrentUser } from "@/lib/auth"
import { EnrollButton } from "@/components/courses/enroll-button"

interface CoursePageProps {
  params: {
    id: string
  }
}

export default async function CoursePage({ params }: CoursePageProps) {
  const user = await getCurrentUser()

  if (!user) {
    redirect("/auth")
  }

  // Fetch course details
  const { data: course } = await supabase
    .from("courses")
    .select(`
      *,
      category:categories(*),
      instructor:profiles(*),
      lessons(*),
      enrollments(*)
    `)
    .eq("id", params.id)
    .single()

  if (!course) {
    notFound()
  }

  // Check if user is enrolled
  const { data: enrollment } = await supabase
    .from("enrollments")
    .select("*")
    .eq("student_id", user.id)
    .eq("course_id", course.id)
    .single()

  const isEnrolled = !!enrollment
  const totalLessons = course.lessons?.length || 0
  const totalDuration = course.lessons?.reduce((acc, lesson) => acc + (lesson.duration || 0), 0) || 0

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Course Header */}
      <div className="space-y-4">
        <div className="flex items-center space-x-2">
          {course.category && <Badge variant="outline">{course.category.name}</Badge>}
          {course.status === "draft" && <Badge variant="secondary">Draft</Badge>}
        </div>

        <h1 className="text-4xl font-bold text-gray-900">{course.title}</h1>
        <p className="text-xl text-gray-600">{course.description}</p>

        <div className="flex items-center space-x-6 text-sm text-gray-500">
          <div className="flex items-center">
            <Clock className="w-4 h-4 mr-1" />
            {Math.round(totalDuration / 60)} hours
          </div>
          <div className="flex items-center">
            <BookOpen className="w-4 h-4 mr-1" />
            {totalLessons} lessons
          </div>
          <div className="flex items-center">
            <Users className="w-4 h-4 mr-1" />
            {course.enrollments?.length || 0} students
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Course Description */}
          <Card>
            <CardHeader>
              <CardTitle>About This Course</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700 leading-relaxed">{course.description || "No description available."}</p>
            </CardContent>
          </Card>

          {/* Course Curriculum */}
          <Card>
            <CardHeader>
              <CardTitle>Course Curriculum</CardTitle>
            </CardHeader>
            <CardContent>
              {course.lessons && course.lessons.length > 0 ? (
                <div className="space-y-2">
                  {course.lessons
                    .sort((a, b) => a.order_index - b.order_index)
                    .map((lesson, index) => (
                      <div key={lesson.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center space-x-3">
                          <div className="flex-shrink-0 w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center text-sm font-medium">
                            {index + 1}
                          </div>
                          <div>
                            <h4 className="font-medium">{lesson.title}</h4>
                            {lesson.description && <p className="text-sm text-gray-500">{lesson.description}</p>}
                          </div>
                        </div>
                        <div className="flex items-center space-x-2 text-sm text-gray-500">
                          {lesson.duration && <span>{lesson.duration} min</span>}
                          <Badge variant="outline" className="text-xs">
                            {lesson.lesson_type}
                          </Badge>
                        </div>
                      </div>
                    ))}
                </div>
              ) : (
                <p className="text-gray-500">No lessons available yet.</p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Enrollment Card */}
          <Card>
            <CardContent className="p-6">
              <div className="text-center space-y-4">
                <div className="text-3xl font-bold">{course.price === 0 ? "Free" : `$${course.price.toFixed(2)}`}</div>

                {isEnrolled ? (
                  <div className="space-y-2">
                    <Badge className="w-full justify-center" variant="default">
                      Enrolled
                    </Badge>
                    <Button asChild className="w-full">
                      <a href={`/courses/${course.id}/learn`}>Continue Learning</a>
                    </Button>
                  </div>
                ) : (
                  <EnrollButton courseId={course.id} userId={user.id} />
                )}
              </div>
            </CardContent>
          </Card>

          {/* Instructor Info */}
          {course.instructor && (
            <Card>
              <CardHeader>
                <CardTitle>Instructor</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
                    {course.instructor.full_name?.charAt(0) || course.instructor.email.charAt(0)}
                  </div>
                  <div>
                    <h4 className="font-medium">{course.instructor.full_name || course.instructor.email}</h4>
                    <p className="text-sm text-gray-500">Course Instructor</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
