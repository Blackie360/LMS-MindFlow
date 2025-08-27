import { redirect } from "next/navigation"
import { requireStudent } from "@/lib/session"
import { PrismaClient } from "@prisma/client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { 
  BookOpen, 
  GraduationCap, 
  TrendingUp, 
  Clock,
  CheckCircle,
  Play,
  Eye
} from "lucide-react"
import Link from "next/link"
import { ROUTES } from "@/lib/constants"

const prisma = new PrismaClient()

export default async function StudentDashboardPage() {
  const user = await requireStudent()

  // Fetch student dashboard data
  const [
    totalEnrollments,
    totalCompletedLessons,
    totalLessons,
    enrolledCourses,
    recentActivity,
    progressStats
  ] = await Promise.all([
    prisma.enrollment.count({
      where: { studentId: user.id }
    }),
    prisma.lessonCompletion.count({
      where: { studentId: user.id }
    }),
    prisma.lesson.count({
      where: {
        module: {
          course: {
            enrollments: {
              some: {
                studentId: user.id
              }
            }
          }
        }
      }
    }),
    prisma.enrollment.findMany({
      where: { studentId: user.id },
      select: {
        id: true,
        enrolledAt: true,
        course: {
          select: {
            id: true,
            title: true,
            description: true,
            thumbnail: true,
            modules: {
              select: {
                id: true,
                lessons: {
                  select: {
                    id: true
                  }
                }
              }
            }
          }
        }
      }
    }),
    prisma.lessonCompletion.findMany({
      where: { studentId: user.id },
      take: 5,
      orderBy: { completedAt: 'desc' },
      select: {
        id: true,
        completedAt: true,
        lesson: {
          select: {
            title: true,
            module: {
              select: {
                title: true,
                course: {
                  select: {
                    title: true
                  }
                }
              }
            }
          }
        }
      }
    }),
    prisma.enrollment.findMany({
      where: { studentId: user.id },
      select: {
        course: {
          select: {
            modules: {
              select: {
                lessons: {
                  select: {
                    id: true
                  }
                }
              }
            }
          }
        }
      }
    })
  ])

  // Calculate overall progress
  const overallProgress = totalLessons > 0 ? (totalCompletedLessons / totalLessons) * 100 : 0

  // Calculate progress for each course
  const courseProgress = enrolledCourses.map(enrollment => {
    const totalCourseLessons = enrollment.course.modules.reduce(
      (acc, module) => acc + module.lessons.length, 0
    )
    
    // Count completed lessons for this specific course
    const completedCourseLessons = recentActivity.filter(activity => 
      enrollment.course.modules.some(module => 
        module.lessons.some(lesson => lesson.id === activity.lesson.id)
      )
    ).length
    
    const progress = totalCourseLessons > 0 ? (completedCourseLessons / totalCourseLessons) * 100 : 0
    
    return {
      ...enrollment,
      progress,
      totalLessons: totalCourseLessons,
      completedLessons: completedCourseLessons
    }
  })

  return (
    <div className="min-h-screen bg-gray-900 space-y-8 p-6">
      <div>
        <h1 className="text-3xl font-bold text-white">Student Dashboard</h1>
        <p className="text-gray-300">
          Welcome back, {user.name}. Continue your learning journey.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="bg-gray-800/50 backdrop-blur-sm border-gray-700/50 shadow-xl">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-white">Enrolled Courses</CardTitle>
            <BookOpen className="h-4 w-4 text-orange-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{totalEnrollments}</div>
            <p className="text-xs text-gray-300">
              Active course enrollments
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gray-800/50 backdrop-blur-sm border-gray-700/50 shadow-xl">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-white">Overall Progress</CardTitle>
            <TrendingUp className="h-4 w-4 text-orange-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{Math.round(overallProgress)}%</div>
            <p className="text-xs text-gray-300">
              {totalCompletedLessons} of {totalLessons} lessons completed
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gray-800/50 backdrop-blur-sm border-gray-700/50 shadow-xl">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-white">Completed Lessons</CardTitle>
            <CheckCircle className="h-4 w-4 text-orange-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{totalCompletedLessons}</div>
            <p className="text-xs text-gray-300">
              Lessons finished
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gray-800/50 backdrop-blur-sm border-gray-700/50 shadow-xl">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-white">Learning Streak</CardTitle>
            <Clock className="h-4 w-4 text-orange-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-400">3 days</div>
            <p className="text-xs text-gray-300">
              Keep it up!
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Overall Progress */}
      <Card className="bg-gray-800/50 backdrop-blur-sm border-gray-700/50 shadow-xl">
        <CardHeader>
          <CardTitle className="text-white">Overall Learning Progress</CardTitle>
          <CardDescription className="text-gray-300">
            Your progress across all enrolled courses
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-white">Overall Progress</span>
              <span className="text-sm text-gray-300">{Math.round(overallProgress)}%</span>
            </div>
            <Progress value={overallProgress} className="w-full" />
            <p className="text-xs text-gray-300">
              {totalCompletedLessons} of {totalLessons} total lessons completed
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Enrolled Courses */}
      <Card className="bg-gray-800/50 backdrop-blur-sm border-gray-700/50 shadow-xl">
        <CardHeader>
          <CardTitle className="text-white">My Courses</CardTitle>
          <CardDescription className="text-gray-300">
            Continue learning from where you left off
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {courseProgress.map((enrollment) => (
              <div key={enrollment.id} className="flex items-center justify-between p-4 border border-gray-600 rounded-lg bg-gray-700/30">
                <div className="flex items-center space-x-4">
                  <div className="h-12 w-12 rounded bg-orange-500/20 border border-orange-500/30 flex items-center justify-center">
                    <BookOpen className="h-6 w-6 text-orange-400" />
                  </div>
                  <div>
                    <h3 className="font-medium text-white">{enrollment.course.title}</h3>
                    <p className="text-sm text-gray-300">
                      {enrollment.completedLessons} of {enrollment.totalLessons} lessons completed
                    </p>
                    <div className="flex items-center space-x-2 mt-2">
                      <Progress value={enrollment.progress} className="w-24" />
                      <span className="text-xs text-gray-300">
                        {Math.round(enrollment.progress)}%
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Button asChild size="sm" variant="outline" className="border-gray-600 text-gray-300 hover:bg-gray-700 hover:text-white">
                    <Link href={`/courses/${enrollment.course.id}`}>
                      <Eye className="mr-2 h-4 w-4" />
                      View Course
                    </Link>
                  </Button>
                  <Button asChild size="sm" className="bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white border-0">
                    <Link href={`/courses/${enrollment.course.id}/learn`}>
                      <Play className="mr-2 h-4 w-4" />
                      Continue
                    </Link>
                  </Button>
                </div>
              </div>
            ))}
          </div>
          {enrolledCourses.length === 0 && (
            <div className="text-center py-8">
              <BookOpen className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-4 text-lg font-medium text-white">No courses enrolled yet</h3>
              <p className="text-gray-300">
                Start your learning journey by enrolling in a course.
              </p>
              <Button asChild className="mt-4 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white border-0">
                <Link href={ROUTES.COURSES}>
                  Browse Courses
                </Link>
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recent Activity */}
      <Card className="bg-gray-800/50 backdrop-blur-sm border-gray-700/50 shadow-xl">
        <CardHeader>
          <CardTitle className="text-white">Recent Activity</CardTitle>
          <CardDescription className="text-gray-300">
            Your latest learning milestones
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentActivity.map((activity) => (
              <div key={activity.id} className="flex items-center space-x-3">
                <div className="h-8 w-8 rounded-full bg-orange-500/20 border border-orange-500/30 flex items-center justify-center">
                  <CheckCircle className="h-4 w-4 text-orange-400" />
                </div>
                <div>
                  <p className="text-sm font-medium text-white">
                    Completed "{activity.lesson.title}"
                  </p>
                  <p className="text-xs text-gray-300">
                    {activity.lesson.module.course.title} • {activity.lesson.module.title}
                  </p>
                </div>
                <div className="ml-auto text-xs text-gray-300">
                  {new Date(activity.completedAt).toLocaleDateString()}
                </div>
              </div>
            ))}
            {recentActivity.length === 0 && (
              <div className="text-center py-4">
                <p className="text-sm text-gray-300">
                  No recent activity. Start learning to see your progress!
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card className="bg-gray-800/50 backdrop-blur-sm border-gray-700/50 shadow-xl">
        <CardHeader>
          <CardTitle className="text-white">Quick Actions</CardTitle>
          <CardDescription className="text-gray-300">
            Get started with your learning
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <Button asChild className="h-auto p-6 flex-col space-y-2 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white border-0">
              <Link href={ROUTES.COURSES}>
                <BookOpen className="h-8 w-8" />
                <span className="font-medium">Browse Courses</span>
                <span className="text-xs text-gray-200">Discover new courses to enroll in</span>
              </Link>
            </Button>

            <Button asChild variant="outline" className="h-auto p-6 flex-col space-y-2 bg-transparent border-gray-600 text-gray-300 hover:bg-gray-700 hover:text-white">
              <Link href={ROUTES.MY_COURSES}>
                <GraduationCap className="h-8 w-8" />
                <span className="font-medium">My Courses</span>
                <span className="text-xs text-gray-300">Continue your enrolled courses</span>
              </Link>
            </Button>

            <Button asChild variant="outline" className="h-auto p-6 flex-col space-y-2 bg-transparent border-gray-600 text-gray-300 hover:bg-gray-700 hover:text-white">
              <Link href="/dashboard">
                <TrendingUp className="h-8 w-8" />
                <span className="font-medium">View Progress</span>
                <span className="text-xs text-gray-300">Track your learning achievements</span>
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}