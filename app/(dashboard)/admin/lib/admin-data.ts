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
  detailedStudentProgress: StudentProgressData[]
  enrollmentTrends: EnrollmentTrendData[]
  completionRatesByMonth: CompletionRateData[]
  topPerformingStudents: TopStudentData[]
}

export interface StudentProgressData {
  id: string
  name: string
  email: string
  enrolledCourses: number
  completedLessons: number
  totalLessons: number
  completionRate: number
  lastActivity: Date | null
  enrolledAt: Date
  status: 'active' | 'inactive' | 'completed'
}

export interface EnrollmentTrendData {
  date: string
  enrollments: number
  completions: number
}

export interface CompletionRateData {
  month: string
  completionRate: number
  totalStudents: number
}

export interface TopStudentData {
  id: string
  name: string
  email: string
  completionRate: number
  completedLessons: number
  coursesCompleted: number
}

export interface AdminDashboardData {
  platformStats: PlatformStats
  courseManagement: CourseManagementData
  studentAnalytics: StudentAnalyticsData
}

async function getDetailedStudentProgress(instructorId: string): Promise<StudentProgressData[]> {
  try {
    // Get all students enrolled in instructor's courses
    const studentsWithProgress = await prisma.user.findMany({
      where: {
        role: 'STUDENT',
        enrollments: {
          some: {
            course: {
              createdBy: instructorId
            }
          }
        }
      },
      include: {
        enrollments: {
          where: {
            course: {
              createdBy: instructorId
            }
          },
          include: {
            course: {
              include: {
                modules: {
                  include: {
                    lessons: {
                      include: {
                        lessonCompletions: {
                          where: {
                            studentId: undefined // Will be set dynamically
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    })

    const progressData: StudentProgressData[] = []

    for (const student of studentsWithProgress) {
      let totalLessons = 0
      let completedLessons = 0
      let lastActivity: Date | null = null

      // Calculate progress across all enrolled courses
      for (const enrollment of student.enrollments) {
        for (const module of enrollment.course.modules) {
          for (const lesson of module.lessons) {
            totalLessons++
            
            // Check if this student completed this lesson
            const completion = await prisma.lessonCompletion.findUnique({
              where: {
                lessonId_studentId: {
                  lessonId: lesson.id,
                  studentId: student.id
                }
              }
            })

            if (completion) {
              completedLessons++
              if (!lastActivity || completion.completedAt > lastActivity) {
                lastActivity = completion.completedAt
              }
            }
          }
        }
      }

      const completionRate = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0
      
      // Determine student status
      let status: 'active' | 'inactive' | 'completed' = 'inactive'
      if (completionRate === 100) {
        status = 'completed'
      } else if (lastActivity && lastActivity > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)) {
        status = 'active'
      }

      progressData.push({
        id: student.id,
        name: student.name || 'Unknown',
        email: student.email,
        enrolledCourses: student.enrollments.length,
        completedLessons,
        totalLessons,
        completionRate,
        lastActivity,
        enrolledAt: student.enrollments[0]?.enrolledAt || student.createdAt,
        status
      })
    }

    return progressData.sort((a, b) => b.completionRate - a.completionRate)
  } catch (error) {
    console.error("Error fetching detailed student progress:", error)
    return []
  }
}

async function getEnrollmentTrends(instructorId: string): Promise<EnrollmentTrendData[]> {
  try {
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

    // Get daily enrollment and completion data for the last 30 days
    const enrollments = await prisma.enrollment.findMany({
      where: {
        enrolledAt: { gte: thirtyDaysAgo },
        course: { createdBy: instructorId }
      },
      select: {
        enrolledAt: true
      }
    })

    const completions = await prisma.lessonCompletion.findMany({
      where: {
        completedAt: { gte: thirtyDaysAgo },
        lesson: {
          module: {
            course: { createdBy: instructorId }
          }
        }
      },
      select: {
        completedAt: true
      }
    })

    // Group by date
    const trendMap = new Map<string, { enrollments: number; completions: number }>()
    
    // Initialize all dates with 0
    for (let i = 0; i < 30; i++) {
      const date = new Date()
      date.setDate(date.getDate() - i)
      const dateStr = date.toISOString().split('T')[0]
      trendMap.set(dateStr, { enrollments: 0, completions: 0 })
    }

    // Count enrollments by date
    enrollments.forEach(enrollment => {
      const dateStr = enrollment.enrolledAt.toISOString().split('T')[0]
      const existing = trendMap.get(dateStr)
      if (existing) {
        existing.enrollments++
      }
    })

    // Count completions by date
    completions.forEach(completion => {
      const dateStr = completion.completedAt.toISOString().split('T')[0]
      const existing = trendMap.get(dateStr)
      if (existing) {
        existing.completions++
      }
    })

    return Array.from(trendMap.entries())
      .map(([date, data]) => ({
        date,
        enrollments: data.enrollments,
        completions: data.completions
      }))
      .sort((a, b) => a.date.localeCompare(b.date))
  } catch (error) {
    console.error("Error fetching enrollment trends:", error)
    return []
  }
}

async function getCompletionRatesByMonth(instructorId: string): Promise<CompletionRateData[]> {
  try {
    const sixMonthsAgo = new Date()
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6)

    // Get completion data by month
    const completionsByMonth = await prisma.$queryRaw<Array<{
      month: string
      total_completions: bigint
      total_students: bigint
    }>>`
      SELECT 
        TO_CHAR(lc.completed_at, 'YYYY-MM') as month,
        COUNT(DISTINCT lc.id) as total_completions,
        COUNT(DISTINCT e.student_id) as total_students
      FROM lesson_completions lc
      JOIN lessons l ON lc.lesson_id = l.id
      JOIN modules m ON l.module_id = m.id
      JOIN courses c ON m.course_id = c.id
      JOIN enrollments e ON c.id = e.course_id
      WHERE c.created_by = ${instructorId}
        AND lc.completed_at >= ${sixMonthsAgo}
      GROUP BY TO_CHAR(lc.completed_at, 'YYYY-MM')
      ORDER BY month
    `

    return completionsByMonth.map(row => ({
      month: row.month,
      completionRate: Number(row.total_students) > 0 
        ? Math.round((Number(row.total_completions) / Number(row.total_students)) * 100) 
        : 0,
      totalStudents: Number(row.total_students)
    }))
  } catch (error) {
    console.error("Error fetching completion rates by month:", error)
    return []
  }
}

async function getTopPerformingStudents(instructorId: string): Promise<TopStudentData[]> {
  try {
    const topStudents = await prisma.user.findMany({
      where: {
        role: 'STUDENT',
        enrollments: {
          some: {
            course: {
              createdBy: instructorId
            }
          }
        }
      },
      include: {
        enrollments: {
          where: {
            course: {
              createdBy: instructorId
            }
          },
          include: {
            course: {
              include: {
                modules: {
                  include: {
                    lessons: true
                  }
                }
              }
            }
          }
        }
      },
      take: 10
    })

    const studentData: TopStudentData[] = []

    for (const student of topStudents) {
      let totalLessons = 0
      let completedLessons = 0
      let coursesCompleted = 0

      for (const enrollment of student.enrollments) {
        let courseLessons = 0
        let courseCompletions = 0

        for (const module of enrollment.course.modules) {
          for (const lesson of module.lessons) {
            totalLessons++
            courseLessons++
            
            const completion = await prisma.lessonCompletion.findUnique({
              where: {
                lessonId_studentId: {
                  lessonId: lesson.id,
                  studentId: student.id
                }
              }
            })

            if (completion) {
              completedLessons++
              courseCompletions++
            }
          }
        }

        // Check if course is completed (100% of lessons done)
        if (courseLessons > 0 && courseCompletions === courseLessons) {
          coursesCompleted++
        }
      }

      const completionRate = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0

      studentData.push({
        id: student.id,
        name: student.name || 'Unknown',
        email: student.email,
        completionRate,
        completedLessons,
        coursesCompleted
      })
    }

    return studentData
      .sort((a, b) => b.completionRate - a.completionRate)
      .slice(0, 5) // Top 5 students
  } catch (error) {
    console.error("Error fetching top performing students:", error)
    return []
  }
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

    // Get detailed student progress data
    const detailedStudentProgress = await getDetailedStudentProgress(userId)
    const enrollmentTrends = await getEnrollmentTrends(userId)
    const completionRatesByMonth = await getCompletionRatesByMonth(userId)
    const topPerformingStudents = await getTopPerformingStudents(userId)

    // Simple engagement trend calculation (could be more sophisticated)
    const engagementTrend: 'up' | 'down' | 'stable' = 
      newEnrollmentsThisWeek > 5 ? 'up' : 
      newEnrollmentsThisWeek < 2 ? 'down' : 'stable'

    const studentAnalytics: StudentAnalyticsData = {
      newEnrollmentsThisWeek,
      activeStudentsToday: recentCompletions, // Using recent completions as proxy for active students
      totalCompletions: totalCompletionsForInstructor,
      engagementTrend,
      detailedStudentProgress,
      enrollmentTrends,
      completionRatesByMonth,
      topPerformingStudents
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
        engagementTrend: 'stable',
        detailedStudentProgress: [],
        enrollmentTrends: [],
        completionRatesByMonth: [],
        topPerformingStudents: []
      }
    }
  }
}