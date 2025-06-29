import { redirect } from "next/navigation"
import { BookOpen, Users, GraduationCap, TrendingUp } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { getCurrentUser } from "@/lib/auth"
import { supabase } from "@/lib/supabase"

export default async function DashboardPage() {
  const user = await getCurrentUser()

  if (!user) {
    redirect("/auth")
  }

  // Fetch dashboard stats
  const [coursesResult, studentsResult, enrollmentsResult] = await Promise.all([
    supabase.from("courses").select("id", { count: "exact" }),
    supabase.from("profiles").select("id", { count: "exact" }).eq("role", "student"),
    supabase.from("enrollments").select("id", { count: "exact" }),
  ])

  const totalCourses = coursesResult.count || 0
  const totalStudents = studentsResult.count || 0
  const totalEnrollments = enrollmentsResult.count || 0

  if (user.role === "admin") {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-600">Welcome back, {user.full_name || user.email}</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Courses</CardTitle>
              <BookOpen className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalCourses}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Students</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalStudents}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Enrollments</CardTitle>
              <GraduationCap className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalEnrollments}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg. Enrollment Rate</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {totalCourses > 0 ? Math.round((totalEnrollments / totalCourses) * 100) / 100 : 0}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <a
                href="/admin/courses/new"
                className="p-4 border border-dashed border-gray-300 rounded-lg hover:border-gray-400 transition-colors text-center"
              >
                <BookOpen className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                <p className="font-medium">Create New Course</p>
                <p className="text-sm text-gray-500">Add a new course to the platform</p>
              </a>

              <a
                href="/admin/students"
                className="p-4 border border-dashed border-gray-300 rounded-lg hover:border-gray-400 transition-colors text-center"
              >
                <Users className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                <p className="font-medium">Manage Students</p>
                <p className="text-sm text-gray-500">View and manage student accounts</p>
              </a>

              <a
                href="/admin/courses"
                className="p-4 border border-dashed border-gray-300 rounded-lg hover:border-gray-400 transition-colors text-center"
              >
                <GraduationCap className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                <p className="font-medium">View All Courses</p>
                <p className="text-sm text-gray-500">Manage existing courses</p>
              </a>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Student Dashboard
  const { data: enrollments } = await supabase
    .from("enrollments")
    .select(`
      *,
      course:courses(*)
    `)
    .eq("student_id", user.id)
    .limit(3)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">My Dashboard</h1>
        <p className="text-gray-600">Welcome back, {user.full_name || user.email}</p>
      </div>

      {/* Student Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Enrolled Courses</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{enrollments?.length || 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed Courses</CardTitle>
            <GraduationCap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{enrollments?.filter((e) => e.completed_at).length || 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Learning Hours</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">24</div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Courses */}
      {enrollments && enrollments.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Continue Learning</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {enrollments.map((enrollment) => (
                <div key={enrollment.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <h3 className="font-medium">{enrollment.course?.title}</h3>
                    <p className="text-sm text-gray-500">{enrollment.course?.description}</p>
                  </div>
                  <a
                    href={`/courses/${enrollment.course?.id}/learn`}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                  >
                    Continue
                  </a>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
