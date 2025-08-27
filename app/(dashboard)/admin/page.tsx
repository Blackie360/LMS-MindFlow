import { redirect } from "next/navigation"
import { requireAdmin } from "@/lib/session"
import { prisma } from "@/lib/prisma"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { 
  Users, 
  BookOpen, 
  GraduationCap, 
  TrendingUp, 
  Shield, 
  Settings,
  Plus,
  Eye,
  UserPlus
} from "lucide-react"
import Link from "next/link"
import { ROLES, ROUTES } from "@/lib/constants"
import { InvitationForm } from "@/components/admin/invitation-form"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { getUserAvatar } from "@/lib/avatar-utils"

// Force dynamic rendering
export const dynamic = 'force-dynamic'

export default async function AdminDashboardPage() {
  const user = await requireAdmin()

  // Fetch admin dashboard stats
  const [
    totalCourses,
    totalStudents,
    totalInstructors,
    totalEnrollments,
    recentCourses,
    recentUsers,
    courseStats
  ] = await Promise.all([
    prisma.course.count(),
    prisma.user.count({
      where: { role: ROLES.STUDENT }
    }),
    prisma.user.count({
      where: { role: ROLES.INSTRUCTOR }
    }),
    prisma.enrollment.count(),
    prisma.course.findMany({
      take: 5,
      orderBy: { updatedAt: 'desc' },
      select: {
        id: true,
        title: true,
        status: true,
        updatedAt: true,
        instructor: {
          select: {
            name: true,
            email: true
          }
        },
        enrollments: {
          select: {
            id: true
          }
        }
      }
    }),
    prisma.user.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true
      }
    }),
    prisma.course.groupBy({
      by: ['status'],
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
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome back, {user.name}. Manage your platform and monitor activity.
          </p>
        </div>
        <div className="flex space-x-2">
          <Button asChild>
            <Link href={ROUTES.ADMIN.COURSES + "/new"}>
              <Plus className="mr-2 h-4 w-4" />
              Create Course
            </Link>
          </Button>
          <Button asChild variant="outline">
            <Link href={ROUTES.ADMIN.STUDENTS}>
              <Users className="mr-2 h-4 w-4" />
              Manage Users
            </Link>
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Courses</CardTitle>
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
              Registered students
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Instructors</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalInstructors}</div>
            <p className="text-xs text-muted-foreground">
              Active instructors
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
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>
            Common administrative tasks and shortcuts
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <Button asChild className="h-auto p-6 flex-col space-y-2">
              <Link href={ROUTES.ADMIN.COURSES + "/new"}>
                <Plus className="h-8 w-8" />
                <span className="font-medium">Create Course</span>
                <span className="text-xs text-muted-foreground">Add a new course to the platform</span>
              </Link>
            </Button>

            <Button asChild variant="outline" className="h-auto p-6 flex-col space-y-2 bg-transparent">
              <Link href={ROUTES.ADMIN.COURSES}>
                <BookOpen className="h-8 w-8" />
                <span className="font-medium">Manage Courses</span>
                <span className="text-xs text-muted-foreground">View and edit all courses</span>
              </Link>
            </Button>

            <Button asChild variant="outline" className="h-auto p-6 flex-col space-y-2 bg-transparent">
              <Link href={ROUTES.ADMIN.STUDENTS}>
                <Users className="h-8 w-8" />
                <span className="font-medium">Manage Users</span>
                <span className="text-xs text-muted-foreground">View all users and roles</span>
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
              <span>Recent Courses</span>
            </CardTitle>
            <CardDescription>
              Latest course updates across the platform
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
                        by {course.instructor.name || course.instructor.email} • {course.enrollments.length} students
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge variant={course.status === 'PUBLISHED' ? 'default' : course.status === 'DRAFT' ? 'secondary' : 'outline'}>
                      {course.status}
                    </Badge>
                    <Button asChild size="sm" variant="ghost">
                      <Link href={`/admin/courses/${course.id}`}>
                        <Eye className="h-4 w-4" />
                      </Link>
                    </Button>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4">
              <Button asChild variant="outline" className="w-full">
                <Link href={ROUTES.ADMIN.COURSES}>
                  View All Courses
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Recent Users */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Users className="h-5 w-5" />
              <span>Recent Users</span>
            </CardTitle>
            <CardDescription>
              Latest user registrations
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentUsers.map((user) => (
                <div key={user.id} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={getUserAvatar(user.name, user.email)} />
                      <AvatarFallback>
                        {user.name?.charAt(0) || user.email.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-sm font-medium">{user.name || 'Unnamed User'}</p>
                      <p className="text-xs text-muted-foreground">
                        {user.email}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge variant={user.role === 'ADMIN' ? 'destructive' : user.role === 'INSTRUCTOR' ? 'default' : 'secondary'}>
                      {user.role}
                    </Badge>
                    <div className="text-xs text-muted-foreground">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4">
              <Button asChild variant="outline" className="w-full">
                <Link href={ROUTES.ADMIN.STUDENTS}>
                  View All Users
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Platform Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <TrendingUp className="h-5 w-5" />
            <span>Platform Overview</span>
          </CardTitle>
          <CardDescription>
            Overview of platform statistics
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-4">
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
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">{totalInstructors}</div>
              <p className="text-sm text-muted-foreground">Instructors</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Invite Users */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <UserPlus className="h-5 w-5" />
            <span>Invite Users</span>
          </CardTitle>
          <CardDescription>
            Send invitations to new users to join the platform
          </CardDescription>
        </CardHeader>
        <CardContent>
          <InvitationForm />
        </CardContent>
      </Card>
    </div>
  )
}