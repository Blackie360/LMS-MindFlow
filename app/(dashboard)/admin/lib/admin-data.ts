import { prisma } from "@/lib/prisma"

export interface PlatformStats {
  totalCourses: number
  totalStudents: number
  totalEnrollments: number
  averageCompletionRate: number
  trends: {
    coursesThisWeek: number
    studentsThisWeek: number
    enrollmentsThisWeek: number
    completionTrend: 'up' | 'down' | 'stable'
  }
}

export interface CourseManagementData {
  myCourses: AdminCourse[]
  draftCourses: number
  publishedCourses: number
  archivedCourses: number
  totalStudentsEnrolled: number
}

export interface AdminCourse {
  id: string
  title: string
  description: string | null
  thumbnail: string | null
  createdAt: Date
  enrollmentCount: number
  completionRate: number
  status: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED'
}

export interface StudentAnalyticsData {
  newEnrollmentsThisWeek: number
  activeStudentsToday: number
  totalCompletions: number
  engagementTrend: 'up' | 'down' | 'stable'
}

export interface AdminDashboardData {
  platformStats: PlatformStats
  courseManagement: CourseManagementData
  studentAnalytics: StudentAnalyticsData
}

export async function getAdminDashboardData(userId: string): Promise<AdminDashboardData> {
  try {
    // Date calculations for trends
    const oneWeekAgo = new Date()
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7)
    
    const twoWeeksAgo = new Date()
    twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14)

    // Get platform-wide statistics with trend data
    const [
      totalCourses,
      totalStudents,
      totalEnrollments,
      allCompletions,
      allLessons,
      coursesThisWeek,
      coursesLastWeek,
      studentsThisWeek,
      studentsLastWeek,
      enrollmentsThisWeek,
      enrollmentsLastWeek,
      completionsThisWeek,
      completionsLastWeek
    ] = await Promise.all([
      // Total counts
      prisma.course.count(),
      prisma.user.count({ where: { role: 'STUDENT' } }),
      prisma.enrollment.count(),
      prisma.lessonCompletion.count(),
      prisma.lesson.count(),
      
      // This week's data
      prisma.course.count({ where: { createdAt: { gte: oneWeekAgo } } }),
      prisma.course.count({ 
        where: { 
          createdAt: { 
            gte: twoWeeksAgo,
            lt: oneWeekAgo 
          } 
        } 
      }),
      prisma.user.count({ 
        where: { 
          role: 'STUDENT',
          createdAt: { gte: oneWeekAgo }
        } 
      }),
      prisma.user.count({ 
        where: { 
          role: 'STUDENT',
          createdAt: { 
            gte: twoWeeksAgo,
            lt: oneWeekAgo 
          }
        } 
      }),
      prisma.enrollment.count({ where: { enrolledAt: { gte: oneWeekAgo } } }),
      prisma.enrollment.count({ 
        where: { 
          enrolledAt: { 
            gte: twoWeeksAgo,
            lt: oneWeekAgo 
          } 
        } 
      }),
      prisma.lessonCompletion.count({ where: { completedAt: { gte: oneWeekAgo } } }),
      prisma.lessonCompletion.count({ 
        where: { 
          completedAt: { 
            gte: twoWeeksAgo,
            lt: oneWeekAgo 
          } 
        } 
      })
    ])

    // Calculate average completion rate
    const averageCompletionRate = allLessons > 0 && totalEnrollments > 0
      ? Math.round((allCompletions / (totalEnrollments * allLessons)) * 100)
      : 0

    // Calculate completion trend
    const completionTrend: 'up' | 'down' | 'stable' = 
      completionsThisWeek > completionsLastWeek ? 'up' :
      completionsThisWeek < completionsLastWeek ? 'down' : 'stable'

    const platformStats: PlatformStats = {
      totalCourses,
      totalStudents,
      totalEnrollments,
      averageCompletionRate: Math.min(100, Math.max(0, averageCompletionRate)),
      trends: {
        coursesThisWeek,
        studentsThisWeek,
        enrollmentsThisWeek,
        completionTrend
      }
    }

    // Get instructor's courses with enrollment and completion data
    const instructorCourses = await prisma.course.findMany({
      where: { createdBy: userId },
      include: {
        enrollments: {
          include: {
            student: true
          }
        },
        modules: {
          include: {
            lessons: {
              include: {
                lessonCompletions: true
              }
            }
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    })

    // Process course data
    const myCourses: AdminCourse[] = instructorCourses.map(course => {
      const enrollmentCount = course.enrollments.length
      
      // Calculate completion rate for this course
      let totalLessons = 0
      let totalCompletions = 0
      
      course.modules.forEach(module => {
        module.lessons.forEach(lesson => {
          totalLessons++
          totalCompletions += lesson.lessonCompletions.length
        })
      })
      
      const completionRate = totalLessons > 0 && enrollmentCount > 0
        ? Math.round((totalCompletions / (enrollmentCount * totalLessons)) * 100)
        : 0

      return {
        id: course.id,
        title: course.title,
        description: course.description,
        thumbnail: course.thumbnail,
        createdAt: course.createdAt,
        enrollmentCount,
        completionRate: Math.min(100, Math.max(0, completionRate)),
        status: course.status as 'DRAFT' | 'PUBLISHED' | 'ARCHIVED'
      }
    })

    // Calculate course management stats
    const totalStudentsEnrolled = instructorCourses.reduce(
      (sum, course) => sum + course.enrollments.length, 
      0
    )

    const draftCourses = myCourses.filter(course => course.status === 'DRAFT').length
    const publishedCourses = myCourses.filter(course => course.status === 'PUBLISHED').length
    const archivedCourses = myCourses.filter(course => course.status === 'ARCHIVED').length

    const courseManagement: CourseManagementData = {
      myCourses,
      draftCourses,
      publishedCourses,
      archivedCourses,
      totalStudentsEnrolled
    }

    // Calculate student analytics
    const oneDayAgo = new Date()
    oneDayAgo.setDate(oneDayAgo.getDate() - 1)

    const [
      newEnrollmentsThisWeek,
      recentCompletions,
      totalCompletionsForInstructor
    ] = await Promise.all([
      prisma.enrollment.count({
        where: {
          enrolledAt: { gte: oneWeekAgo },
          course: { createdBy: userId }
        }
      }),
      prisma.lessonCompletion.count({
        where: {
          completedAt: { gte: oneDayAgo },
          lesson: {
            module: {
              course: { createdBy: userId }
            }
          }
        }
      }),
      prisma.lessonCompletion.count({
        where: {
          lesson: {
            module: {
              course: { createdBy: userId }
            }
          }
        }
      })
    ])

    // Simple engagement trend calculation (could be more sophisticated)
    const engagementTrend: 'up' | 'down' | 'stable' = 
      newEnrollmentsThisWeek > 5 ? 'up' : 
      newEnrollmentsThisWeek < 2 ? 'down' : 'stable'

    const studentAnalytics: StudentAnalyticsData = {
      newEnrollmentsThisWeek,
      activeStudentsToday: recentCompletions, // Using recent completions as proxy for active students
      totalCompletions: totalCompletionsForInstructor,
      engagementTrend
    }

    return {
      platformStats,
      courseManagement,
      studentAnalytics
    }
  } catch (error) {
    console.error("Error fetching admin dashboard data:", error)
    
    // Return empty data structure on error
    return {
      platformStats: {
        totalCourses: 0,
        totalStudents: 0,
        totalEnrollments: 0,
        averageCompletionRate: 0,
        trends: {
          coursesThisWeek: 0,
          studentsThisWeek: 0,
          enrollmentsThisWeek: 0,
          completionTrend: 'stable'
        }
      },
      courseManagement: {
        myCourses: [],
        draftCourses: 0,
        publishedCourses: 0,
        archivedCourses: 0,
        totalStudentsEnrolled: 0
      },
      studentAnalytics: {
        newEnrollmentsThisWeek: 0,
        activeStudentsToday: 0,
        totalCompletions: 0,
        engagementTrend: 'stable'
      }
    }
  }
}