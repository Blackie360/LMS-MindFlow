import { redirect } from "next/navigation"
import Link from "next/link"
import { Plus, Edit, Eye, Users, BookOpen } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { getCurrentUser } from "@/lib/auth"
import { supabase } from "@/lib/supabase"
import { DeleteCourseButton } from "@/components/admin/delete-course-button"

export default async function AdminCoursesPage() {
  const user = await getCurrentUser()

  if (!user || user.role !== "admin") {
    redirect("/dashboard")
  }

  // Fetch all courses with related data and counts
  const { data: courses } = await supabase
    .from("courses")
    .select(`
      *,
      category:categories(*),
      instructor:profiles(*),
      lessons(count),
      enrollments(count)
    `)
    .order("created_at", { ascending: false })

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Course Management</h1>
          <p className="text-gray-600">Create and manage your courses</p>
        </div>
        <Button asChild>
          <Link href="/admin/courses/new">
            <Plus className="w-4 h-4 mr-2" />
            Create Course
          </Link>
        </Button>
      </div>

      {/* Course Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <BookOpen className="w-4 h-4 text-blue-600" />
              <div>
                <p className="text-sm text-gray-600">Total Courses</p>
                <p className="text-lg font-semibold">{courses?.length || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Eye className="w-4 h-4 text-green-600" />
              <div>
                <p className="text-sm text-gray-600">Published</p>
                <p className="text-lg font-semibold">{courses?.filter((c) => c.status === "published").length || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Edit className="w-4 h-4 text-orange-600" />
              <div>
                <p className="text-sm text-gray-600">Drafts</p>
                <p className="text-lg font-semibold">{courses?.filter((c) => c.status === "draft").length || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Users className="w-4 h-4 text-purple-600" />
              <div>
                <p className="text-sm text-gray-600">Total Students</p>
                <p className="text-lg font-semibold">
                  {courses?.reduce((acc, course) => acc + (course.enrollments?.[0]?.count || 0), 0) || 0}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Courses List */}
      <div className="grid gap-6">
        {courses && courses.length > 0 ? (
          courses.map((course) => (
            <Card key={course.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div className="space-y-2 flex-1">
                    <div className="flex items-center space-x-2">
                      <CardTitle className="text-xl">{course.title}</CardTitle>
                      <Badge variant={course.status === "published" ? "default" : "secondary"}>{course.status}</Badge>
                    </div>
                    <p className="text-gray-600 line-clamp-2">{course.description}</p>
                    <div className="flex items-center space-x-4 text-sm text-gray-500">
                      {course.category && <Badge variant="outline">{course.category.name}</Badge>}
                      <span>Created {formatDate(course.created_at)}</span>
                    </div>
                  </div>
                  <div className="flex space-x-2 ml-4">
                    <Button asChild variant="outline" size="sm">
                      <Link href={`/courses/${course.id}`}>
                        <Eye className="w-4 h-4 mr-2" />
                        View
                      </Link>
                    </Button>
                    <Button asChild variant="outline" size="sm">
                      <Link href={`/admin/courses/${course.id}/edit`}>
                        <Edit className="w-4 h-4 mr-2" />
                        Edit
                      </Link>
                    </Button>
                    <DeleteCourseButton courseId={course.id} courseName={course.title} />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <span className="text-gray-500">Lessons:</span>
                    <span className="ml-2 font-medium">{course.lessons?.[0]?.count || 0}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Students:</span>
                    <span className="ml-2 font-medium">{course.enrollments?.[0]?.count || 0}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Price:</span>
                    <span className="ml-2 font-medium">${course.price === 0 ? "Free" : course.price.toFixed(2)}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Instructor:</span>
                    <span className="ml-2 font-medium">{course.instructor?.full_name || course.instructor?.email}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <Card>
            <CardContent className="text-center py-12">
              <BookOpen className="w-12 h-12 mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No courses created yet</h3>
              <p className="text-gray-500 mb-4">Get started by creating your first course.</p>
              <Button asChild>
                <Link href="/admin/courses/new">
                  <Plus className="w-4 h-4 mr-2" />
                  Create Your First Course
                </Link>
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
