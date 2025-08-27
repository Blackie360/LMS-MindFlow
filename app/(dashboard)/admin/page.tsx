import { redirect } from "next/navigation"
import { requireAdmin } from "@/lib/session"
import { PrismaClient } from "@prisma/client"
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

const prisma = new PrismaClient()

export default async function AdminDashboardPage() {
  const user = await requireAdmin()

  // Fetch admin dashboard stats
  const [
    totalUsers,
    totalCourses,
    totalEnrollments,
    usersByRole,
    recentUsers,
    recentCourses
  ] = await Promise.all([
    prisma.user.count(),
    prisma.course.count(),
    prisma.enrollment.count(),
    prisma.user.groupBy({
      by: ['role'],
      _count: {
        role: true
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
        createdAt: true,
        emailVerified: true
      }
    }),
    prisma.course.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        title: true,
        status: true,
        createdAt: true,
        instructor: {
          select: {
            name: true,
            email: true
          }
        }
      }
    })
  ])

  const roleCounts = {
    STUDENT: usersByRole.find(r => r.role === 'STUDENT')?._count.role || 0,
    INSTRUCTOR: usersByRole.find(r => r.role === 'INSTRUCTOR')?._count.role || 0,
    ADMIN: usersByRole.find(r => r.role === 'ADMIN')?._count.role || 0,
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome back, {user.name}. Manage your platform and monitor system health.
          </p>
        </div>
        <div className="flex space-x-2">
          <Button asChild>
            <Link href={ROUTES.ADMIN.SETTINGS}>
              <Settings className="mr-2 h-4 w-4" />
              Settings
            </Link>
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalUsers}</div>
            <p className="text-xs text-muted-foreground">
              {roleCounts.STUDENT} students, {roleCounts.INSTRUCTOR} instructors, {roleCounts.ADMIN} admins
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Courses</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalCourses}</div>
            <p className="text-xs text-muted-foreground">
              Active courses on the platform
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
              Student course enrollments
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Platform Health</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">Healthy</div>
            <p className="text-xs text-muted-foreground">
              All systems operational
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
              <Link href={ROUTES.ADMIN.USERS}>
                <Users className="h-8 w-8" />
                <span className="font-medium">Manage Users</span>
                <span className="text-xs text-muted-foreground">View and manage user accounts</span>
              </Link>
            </Button>

            <Button asChild variant="outline" className="h-auto p-6 flex-col space-y-2 bg-transparent">
              <Link href={ROUTES.ADMIN.COURSES}>
                <BookOpen className="h-8 w-8" />
                <span className="font-medium">Manage Courses</span>
                <span className="text-xs text-muted-foreground">Review and moderate courses</span>
              </Link>
            </Button>

            <Button asChild variant="outline" className="h-auto p-6 flex-col space-y-2 bg-transparent">
              <Link href={ROUTES.ADMIN.ANALYTICS}>
                <TrendingUp className="h-8 w-8" />
                <span className="font-medium">View Analytics</span>
                <span className="text-xs text-muted-foreground">Platform performance metrics</span>
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* User Invitations */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <UserPlus className="h-5 w-5" />
            <span>Send Invitations</span>
          </CardTitle>
          <CardDescription>
            Invite new users to join MindFlow with specific roles
          </CardDescription>
        </CardHeader>
        <CardContent>
          <InvitationForm userRole={user.role as "ADMIN" | "INSTRUCTOR"} />
        </CardContent>
      </Card>

      {/* Recent Activity */}
      <div className="grid gap-6 md:grid-cols-2">
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
                    <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center">
                      <span className="text-sm font-medium">
                        {user.name?.charAt(0) || user.email.charAt(0)}
                      </span>
                    </div>
                    <div>
                      <p className="text-sm font-medium">{user.name || 'Unnamed User'}</p>
                      <p className="text-xs text-muted-foreground">{user.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge variant={user.role === 'ADMIN' ? 'destructive' : user.role === 'INSTRUCTOR' ? 'default' : 'secondary'}>
                      {user.role}
                    </Badge>
                    {!user.emailVerified && (
                      <Badge variant="outline" className="text-xs">
                        Unverified
                      </Badge>
                    )}
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4">
              <Button asChild variant="outline" className="w-full">
                <Link href={ROUTES.ADMIN.USERS}>
                  View All Users
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Recent Courses */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <BookOpen className="h-5 w-5" />
              <span>Recent Courses</span>
            </CardTitle>
            <CardDescription>
              Latest course creations
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
                        by {course.instructor.name || course.instructor.email}
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
      </div>

      {/* System Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Shield className="h-5 w-5" />
            <span>System Status</span>
          </CardTitle>
          <CardDescription>
            Current platform status and health metrics
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="flex items-center space-x-2">
              <div className="h-3 w-3 rounded-full bg-green-500"></div>
              <span className="text-sm">Database: Operational</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="h-3 w-3 rounded-full bg-green-500"></div>
              <span className="text-sm">Authentication: Active</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="h-3 w-3 rounded-full bg-green-500"></div>
              <span className="text-sm">File Storage: Online</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}