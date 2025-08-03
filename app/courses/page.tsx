import { getCurrentUser } from "@/lib/session"
import { pool } from "@/lib/db"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { BookOpen, Users, Clock } from "lucide-react"
import Link from "next/link"
import { redirect } from "next/navigation"

export default async function CoursesPage() {
  const user = await getCurrentUser()

  if (!user) {
    redirect("/auth")
  }

  // Fetch published courses with instructor and enrollment info
  const coursesResult = await pool.query(`
    SELECT 
      c.*,
      cat.name as category_name,
      u.name as instructor_name,
      COUNT(e.id) as enrollment_count,
      COUNT(l.id) as lesson_count
    FROM courses c
    LEFT JOIN categories cat ON c.category_id = cat.id
    LEFT JOIN "user" u ON c.instructor_id = u.id
    LEFT JOIN enrollments e ON c.id = e.course_id
    LEFT JOIN lessons l ON c.id = l.course_id
    WHERE c.status = 'published'
    GROUP BY c.id, cat.name, u.name
    ORDER BY c.created_at DESC
  `)

  const courses = coursesResult.rows

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Browse Courses</h1>
        <p className="text-muted-foreground">Discover new skills and advance your career</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {courses.map((course) => (
          <Card key={course.id} className="group hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
            <div className="relative overflow-hidden rounded-t-lg">
              <div className="aspect-video bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
                <BookOpen className="w-12 h-12 text-primary" />
              </div>
              <div className="absolute top-2 right-2">
                <Badge variant="secondary" className="bg-white/90 backdrop-blur-sm">
                  ${course.price === 0 ? "Free" : course.price}
                </Badge>
              </div>
            </div>

            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                {course.category_name && (
                  <Badge variant="outline" className="mb-2">
                    {course.category_name}
                  </Badge>
                )}
              </div>
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

      {courses.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No courses available at the moment.</p>
        </div>
      )}
    </div>
  )
}
