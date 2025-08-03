import { getCurrentUser } from "@/lib/session"
import { PrismaClient } from "@prisma/client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { BookOpen, Users, Clock } from "lucide-react"
import Link from "next/link"
import { redirect } from "next/navigation"

const prisma = new PrismaClient()

export default async function CoursesPage() {
  const user = await getCurrentUser()

  if (!user) {
    redirect("/auth")
  }

  // Fetch courses with instructor and enrollment info
  const courses = await prisma.course.findMany({
    include: {
      instructor: {
        select: {
          name: true,
        },
      },
      enrollments: {
        select: {
          id: true,
        },
      },
      modules: {
        include: {
          lessons: {
            select: {
              id: true,
            },
          },
        },
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
  })

  // Transform data to match the expected format
  const transformedCourses = courses.map(course => ({
    ...course,
    instructor_name: course.instructor.name,
    enrollment_count: course.enrollments.length,
    lesson_count: course.modules.reduce((total, module) => total + module.lessons.length, 0),
  }))

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Browse Courses</h1>
        <p className="text-muted-foreground">Discover new skills and advance your career</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {transformedCourses.map((course) => (
          <Card key={course.id} className="group hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
            <div className="relative overflow-hidden rounded-t-lg">
              <div className="aspect-video bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
                <BookOpen className="w-12 h-12 text-primary" />
              </div>
              {course.thumbnail && (
                <div className="absolute top-2 right-2">
                  <Badge variant="secondary" className="bg-white/90 backdrop-blur-sm">
                    Course
                  </Badge>
                </div>
              )}
            </div>

            <CardHeader className="pb-3">
              <CardTitle className="line-clamp-2 group-hover:text-primary transition-colors">{course.title}</CardTitle>
              <CardDescription className="line-clamp-2">{course.description}</CardDescription>
            </CardHeader>

            <CardContent className="pt-0">
              <div className="flex items-center justify-between text-sm text-muted-foreground mb-4">
                <span className="flex items-center">
                  <Clock className="w-4 h-4 mr-1" />
                  {course.lesson_count} lessons
                </span>
                <span className="flex items-center">
                  <Users className="w-4 h-4 mr-1" />
                  {course.enrollment_count}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <div className="text-sm text-muted-foreground">by {course.instructor_name || "Unknown"}</div>
                <Button asChild size="sm">
                  <Link href={`/courses/${course.id}`}>View Course</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {transformedCourses.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No courses available at the moment.</p>
        </div>
      )}
    </div>
  )
}
