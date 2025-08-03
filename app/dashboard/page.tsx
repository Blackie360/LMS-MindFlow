import { redirect } from "next/navigation"
import { auth } from "@/lib/auth"
import { headers } from "next/headers"
import { prisma } from "@/lib/prisma"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { BookOpen, Users, GraduationCap, Plus } from "lucide-react"
import Link from "next/link"
import { ROUTES } from "@/lib/constants"

export default async function DashboardPage() {
  const session = await auth.api.getSession({
    headers: headers(),
  })

  if (!session) {
    redirect("/auth")
  }

  const user = session.user

  // Get dashboard stats based on user role
  const stats = {
    totalCourses: 0,
    totalStudents: 0,
    totalEnrollments: 0,
  }

  if (user.role === "INSTRUCTOR") {
    const [courses, enrollments] = await Promise.all([
      prisma.course.count({
        where: { createdBy: user.id },
      }),
      prisma.enrollment.count({
        where: {
          course: {
            createdBy: user.id,
          },
        },
      }),
    ])

    stats.totalCourses = courses
    stats.totalEnrollments = enrollments
  } else {
    const enrollments = await prisma.enrollment.count({
      where: { studentId: user.id },
    })
    stats.totalEnrollments = enrollments
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Welcome back, {user.name}!</h1>
        <p className="text-muted-foreground">
          {user.role === "INSTRUCTOR"
            ? "Manage your courses and track student progress"
            : "Continue your learning journey"}
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {user.role === "INSTRUCTOR" ? (
          <>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">My Courses</CardTitle>
                <BookOpen className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalCourses}</div>
                <p className="text-xs text-muted-foreground">Courses created</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Enrollments</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalEnrollments}</div>
                <p className="text-xs text-muted-foreground">Students enrolled</p>
              </CardContent>
            </Card>
          </>
        ) : (
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Enrolled Courses</CardTitle>
              <GraduationCap className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalEnrollments}</div>
              <p className="text-xs text-muted-foreground">Courses enrolled</p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>
            {user.role === "INSTRUCTOR" ? "Manage your courses and content" : "Explore and continue learning"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {user.role === "INSTRUCTOR" ? (
              <>
                <Button asChild className="h-auto p-6 flex-col space-y-2">
                  <Link href={ROUTES.INSTRUCTOR.COURSES + "/new"}>
                    <Plus className="h-8 w-8" />
                    <span className="font-medium">Create New Course</span>
                    <span className="text-xs text-muted-foreground">Start building your next course</span>
                  </Link>
                </Button>

                <Button asChild variant="outline" className="h-auto p-6 flex-col space-y-2 bg-transparent">
                  <Link href={ROUTES.INSTRUCTOR.COURSES}>
                    <BookOpen className="h-8 w-8" />
                    <span className="font-medium">Manage Courses</span>
                    <span className="text-xs text-muted-foreground">Edit existing courses</span>
                  </Link>
                </Button>

                <Button asChild variant="outline" className="h-auto p-6 flex-col space-y-2 bg-transparent">
                  <Link href={ROUTES.INSTRUCTOR.STUDENTS}>
                    <Users className="h-8 w-8" />
                    <span className="font-medium">View Students</span>
                    <span className="text-xs text-muted-foreground">Track student progress</span>
                  </Link>
                </Button>
              </>
            ) : (
              <>
                <Button asChild className="h-auto p-6 flex-col space-y-2">
                  <Link href={ROUTES.COURSES}>
                    <BookOpen className="h-8 w-8" />
                    <span className="font-medium">Browse Courses</span>
                    <span className="text-xs text-muted-foreground">Discover new courses</span>
                  </Link>
                </Button>

                <Button asChild variant="outline" className="h-auto p-6 flex-col space-y-2 bg-transparent">
                  <Link href={ROUTES.MY_COURSES}>
                    <GraduationCap className="h-8 w-8" />
                    <span className="font-medium">My Courses</span>
                    <span className="text-xs text-muted-foreground">Continue learning</span>
                  </Link>
                </Button>
              </>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
