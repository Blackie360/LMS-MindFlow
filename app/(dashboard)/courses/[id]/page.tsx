import { notFound, redirect } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { BookOpen, Clock, Users, Star, Play, CheckCircle } from "lucide-react"
import Link from "next/link"
import { getCurrentUser } from "@/lib/session"
import { EnrollButton } from "@/components/courses/enroll-button"

// Static course data for demo
const getCourseData = (id: string) => {
  const courses = {
    "1": {
      id: "1",
      title: "Introduction to React",
      description:
        "Learn the fundamentals of React development and build modern web applications. This comprehensive course covers everything from basic concepts to advanced patterns.",
              cover_image: "/placeholder.jpg",
      instructor: {
        id: "instructor-1",
        full_name: "John Doe",
        email: "john@example.com",
        avatar_url: "/default-avatar.svg",
      },
      category: { name: "Web Development", id: "cat-1" },
      price: 99.99,
      status: "published",
      created_at: "2024-01-15T10:00:00Z",
      updated_at: "2024-01-20T14:30:00Z",
      lessons: [
        {
          id: "lesson-1",
          title: "Introduction to React",
          description: "Overview of React and its ecosystem",
          order_index: 1,
          duration: 15,
          lesson_type: "video",
        },
        {
          id: "lesson-2",
          title: "Components and JSX",
          description: "Understanding React components and JSX syntax",
          order_index: 2,
          duration: 20,
          lesson_type: "video",
        },
        {
          id: "lesson-3",
          title: "State and Props",
          description: "Managing component state and passing props",
          order_index: 3,
          duration: 25,
          lesson_type: "video",
        },
      ],
      _count: {
        lessons: 3,
        enrollments: 156,
      },
      rating: 4.8,
      totalDuration: 60,
    },
  }

  return courses[id as keyof typeof courses] || null
}

export default async function CoursePage({ params }: { params: { id: string } }) {
  const user = await getCurrentUser()

  if (!user) {
    redirect("/auth")
  }

  const course = getCourseData(params.id)

  if (!course) {
    notFound()
  }

  // Check if user is enrolled (mock data)
  const isEnrolled = false // In real app, check enrollment status

  return (
    <div className="space-y-6">
      {/* Course Header */}
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Badge variant="outline">{course.category.name}</Badge>
              <Badge variant="secondary">
                <Star className="w-3 h-3 mr-1 fill-yellow-400 text-yellow-400" />
                {course.rating}
              </Badge>
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-4">{course.title}</h1>
            <p className="text-lg text-gray-600 mb-6">{course.description}</p>

            <div className="flex items-center gap-6 text-sm text-gray-500">
              <span className="flex items-center">
                <Clock className="w-4 h-4 mr-1" />
                {course.totalDuration} minutes
              </span>
              <span className="flex items-center">
                <BookOpen className="w-4 h-4 mr-1" />
                {course._count.lessons} lessons
              </span>
              <span className="flex items-center">
                <Users className="w-4 h-4 mr-1" />
                {course._count.enrollments} students
              </span>
            </div>
          </div>

          {/* Course Content */}
          <Card>
            <CardHeader>
              <CardTitle>Course Content</CardTitle>
              <CardDescription>
                {course._count.lessons} lessons • {course.totalDuration} minutes total
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {course.lessons.map((lesson, index) => (
                  <div key={lesson.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="flex items-center justify-center w-8 h-8 bg-gray-100 rounded-full">
                        {isEnrolled ? (
                          <CheckCircle className="w-4 h-4 text-green-600" />
                        ) : (
                          <Play className="w-4 h-4 text-gray-400" />
                        )}
                      </div>
                      <div>
                        <h4 className="font-medium">{lesson.title}</h4>
                        <p className="text-sm text-gray-500">{lesson.description}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2 text-sm text-gray-500">
                      <Clock className="w-3 h-3" />
                      <span>{lesson.duration} min</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Instructor */}
          <Card>
            <CardHeader>
              <CardTitle>Instructor</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center">
                  <Users className="w-8 h-8 text-gray-400" />
                </div>
                <div>
                  <h3 className="font-semibold">{course.instructor.full_name}</h3>
                  <p className="text-sm text-gray-500">{course.instructor.email}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <Card>
            <CardContent className="p-6">
              <div className="text-center mb-6">
                <div className="aspect-video bg-gradient-to-br from-primary/20 to-primary/5 rounded-lg flex items-center justify-center mb-4">
                  <Play className="w-12 h-12 text-primary" />
                </div>
                <div className="text-3xl font-bold text-gray-900 mb-2">
                  ${course.price === 0 ? "Free" : course.price.toFixed(2)}
                </div>
              </div>

              <div className="space-y-4">
                {isEnrolled ? (
                  <Button asChild className="w-full" size="lg">
                    <Link href={`/courses/${course.id}/learn`}>
                      <Play className="w-4 h-4 mr-2" />
                      Continue Learning
                    </Link>
                  </Button>
                ) : (
                  <EnrollButton courseId={course.id} price={course.price} />
                )}

                <Separator />

                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Duration</span>
                    <span>{course.totalDuration} minutes</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Lessons</span>
                    <span>{course._count.lessons}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Students</span>
                    <span>{course._count.enrollments}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Level</span>
                    <span>Beginner</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
