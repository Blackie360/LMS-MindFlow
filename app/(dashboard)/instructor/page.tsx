import { redirect } from "next/navigation"
import { requireInstructor } from "@/lib/session"
import { PrismaClient } from "@prisma/client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { 
  BookOpen, 
  Users, 
  GraduationCap, 
  Plus, 
  TrendingUp, 
  Eye,
  Edit,
  Settings
} from "lucide-react"
import Link from "next/link"
import { ROUTES } from "@/lib/constants"

const prisma = new PrismaClient()

export default async function InstructorDashboardPage() {
  const user = await requireInstructor()

  // Fetch instructor dashboard stats
  const [
    totalCourses,
    totalStudents,
    totalEnrollments,
    recentCourses,
    recentEnrollments,
    courseStats
  ] = await Promise.all([
    prisma.course.count({
      where: { createdBy: user.id }
    }),
    prisma.enrollment.count({
      where: {
        course: {
          createdBy: user.id
        }
      }
    }),
    prisma.enrollment.count({
      where: {
        course: {
          createdBy: user.id
        }
      }
    }),
    prisma.course.findMany({
      where: { createdBy: user.id },
      take: 5,
      orderBy: { updatedAt: 'desc' },
      select: {
        id: true,
        title: true,
        status: true,
        updatedAt: true,
        enrollments: {
          select: {
            id: true
          }
        }
      }
    }),
    prisma.enrollment.findMany({
      where: {
        course: {
          createdBy: user.id
        }
      },
      take: 5,
      orderBy: { enrolledAt: 'desc' },
      select: {
        id: true,
        enrolledAt: true,
        student: {
          select: {
            name: true,
            email: true
          }
        },
        course: {
          select: {
            title: true
          }
        }
      }
    }),
    prisma.course.groupBy({
      by: ['status'],
      where: { createdBy: user.id },
      _count: {
        status: true
      }
    })
  ])

  const statusCounts = {
    DRAFT: courseStats.find(s => s.status === 'DRAFT')?._count.status || 0,
    PUBLISHED: courseStats.find(s => s.status === 'PUBLISHED')?._count.status || 0,
    ARCHIVED: courseStats.find(s => s.status === 'ARCHIVED')?._count.status || 0,
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Instructor Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome back, {user.name}. Manage your courses and track student progress.
          </p>
        </div>
        <div className="flex space-x-2">
          <Button asChild>
            <Link href={ROUTES.INSTRUCTOR.COURSES + "/new"}>
              <Plus className="mr-2 h-4 w-4" />
              Create Course
            </Link>
          </Button>
          <Button asChild variant="outline">
            <Link href={ROUTES.INSTRUCTOR.STUDENTS}>
              <Users className="mr-2 h-4 w-4" />
              View Students
            </Link>
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">My Courses</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalCourses}</div>
            <p className="text-xs text-muted-foreground">
              {statusCounts.PUBLISHED} published, {statusCounts.DRAFT} drafts
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Students</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalStudents}</div>
            <p className="text-xs text-muted-foreground">
              Enrolled across all courses
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Enrollments</CardTitle>
            <GraduationCap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalEnrollments}</div>
            <p className="text-xs text-muted-foreground">
              Course enrollments
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Engagement</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">High</div>
            <p className="text-xs text-muted-foreground">
              Based on student activity
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>
            Common instructor tasks and shortcuts
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
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
          </div>
        </CardContent>
      </Card>

      {/* Recent Activity */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Recent Courses */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <BookOpen className="h-5 w-5" />
              <span>My Courses</span>
            </CardTitle>
            <CardDescription>
              Your latest course updates
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentCourses.map((course) => (
                <div key={course.id} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="h-8 w-8 rounded bg-muted flex items-center justify-center">
                      <BookOpen className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">{course.title}</p>
                      <p className="text-xs text-muted-foreground">
                        {course.enrollments.length} students
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge variant={course.status === 'PUBLISHED' ? 'default' : course.status === 'DRAFT' ? 'secondary' : 'outline'}>
                      {course.status}
                    </Badge>
                    <Button asChild size="sm" variant="ghost">
                      <Link href={`/instructor/courses/${course.id}`}>
                        <Eye className="h-4 w-4" />
                      </Link>
                    </Button>
                    <Button asChild size="sm" variant="ghost">
                      <Link href={`/instructor/courses/${course.id}/edit`}>
                        <Edit className="h-4 w-4" />
                      </Link>
                    </Button>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4">
              <Button asChild variant="outline" className="w-full">
                <Link href={ROUTES.INSTRUCTOR.COURSES}>
                  View All Courses
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Recent Enrollments */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Users className="h-5 w-5" />
              <span>Recent Enrollments</span>
            </CardTitle>
            <CardDescription>
              Latest student enrollments
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentEnrollments.map((enrollment) => (
                <div key={enrollment.id} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center">
                      <span className="text-sm font-medium">
                        {enrollment.student.name?.charAt(0) || enrollment.student.email.charAt(0)}
                      </span>
                    </div>
                    <div>
                      <p className="text-sm font-medium">{enrollment.student.name || 'Unnamed Student'}</p>
                      <p className="text-xs text-muted-foreground">
                        {enrollment.course.title}
                      </p>
                    </div>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {new Date(enrollment.enrolledAt).toLocaleDateString()}
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4">
              <Button asChild variant="outline" className="w-full">
                <Link href={ROUTES.INSTRUCTOR.STUDENTS}>
                  View All Students
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Course Performance */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <TrendingUp className="h-5 w-5" />
            <span>Course Performance</span>
          </CardTitle>
          <CardDescription>
            Overview of your course statistics
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{statusCounts.PUBLISHED}</div>
              <p className="text-sm text-muted-foreground">Published Courses</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-600">{statusCounts.DRAFT}</div>
              <p className="text-sm text-muted-foreground">Draft Courses</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{totalStudents}</div>
              <p className="text-sm text-muted-foreground">Active Students</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
