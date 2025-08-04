import { prisma } from "@/lib/prisma"

function generateUpcomingActivities(enrollments: any[], userId: string): UpcomingActivity[] {
  const activities: UpcomingActivity[] = []
  const now = new Date()
  
  for (const enrollment of enrollments) {
    const course = enrollment.course
    let activityCount = 0
    
    // Generate activities for incomplete lessons (simulate assignments and tests)
    for (const module of course.modules) {
      for (const lesson of module.lessons) {
        const isCompleted = lesson.lessonCompletions.some(
          (comp: any) => comp.studentId === userId
        )
        
        if (!isCompleted && activityCount < 4) { // Limit to 4 activities per course
          // Create different types of activities with more realistic distribution
          const activityTypes: ('assignment' | 'test' | 'lesson')[] = ['lesson', 'assignment', 'lesson', 'test']
          const activityType = activityTypes[lesson.order % 4]
          
          // Generate more realistic due dates based on lesson order and type
          let baseDays = Math.floor(lesson.order / 2) + 1 // Spread activities over time
          if (activityType === 'test') baseDays += 3 // Tests are usually scheduled further out
          if (activityType === 'assignment') baseDays += 1 // Assignments have moderate lead time
          
          // Add some randomness but keep it reasonable (1-21 days)
          const randomOffset = Math.floor(Math.random() * 7) - 3 // -3 to +3 days
          const daysFromNow = Math.max(1, Math.min(21, baseDays + randomOffset))
          
          const dueDate = new Date(now)
          dueDate.setDate(now.getDate() + daysFromNow)
          
          // Determine urgency based on due date with more nuanced logic
          let urgency: 'low' | 'medium' | 'high' = 'low'
          if (daysFromNow <= 1) urgency = 'high'
          else if (daysFromNow <= 3) urgency = 'medium'
          else if (daysFromNow <= 7) urgency = 'low'
          else urgency = 'low'
          
          // Special urgency boost for tests
          if (activityType === 'test' && daysFromNow <= 5) {
            urgency = urgency === 'low' ? 'medium' : 'high'
          }
          
          // Create more descriptive activity titles
          let title = lesson.title
          if (activityType === 'assignment') {
            const assignmentPrefixes = ['Assignment', 'Homework', 'Project', 'Exercise']
            const prefix = assignmentPrefixes[lesson.order % assignmentPrefixes.length]
            title = `${prefix}: ${lesson.title}`
          } else if (activityType === 'test') {
            const testPrefixes = ['Quiz', 'Test', 'Exam', 'Assessment']
            const prefix = testPrefixes[lesson.order % testPrefixes.length]
            title = `${prefix}: ${lesson.title}`
          } else {
            title = `Complete: ${lesson.title}`
          }
          
          activities.push({
            id: `${lesson.id}-${activityType}-${lesson.order}`,
            title,
            type: activityType,
            dueDate,
            courseName: course.title,
            courseId: course.id,
            urgency
          })
          
          activityCount++
        }
      }
    }
  }
  
  // Sort by due date (earliest first), then by urgency (high first)
  return activities
    .sort((a, b) => {
      const dateComparison = a.dueDate.getTime() - b.dueDate.getTime()
      if (dateComparison !== 0) return dateComparison
      
      // If dates are the same, sort by urgency
      const urgencyOrder = { high: 0, medium: 1, low: 2 }
      return urgencyOrder[a.urgency] - urgencyOrder[b.urgency]
    })
    .slice(0, 15) // Increase limit to 15 upcoming activities
}

export interface StudentProgressStats {
  lessonsCompleted: number
  totalLessons: number
  assignmentsCompleted: number
  totalAssignments: number
  testsCompleted: number
  totalTests: number
}

export interface EnrolledCourse {
  id: string
  title: string
  thumbnail: string | null
  progress: number
  status: 'active' | 'completed'
  lastAccessed: Date | null
  totalLessons: number
  completedLessons: number
}

export interface UpcomingActivity {
  id: string
  title: string
  type: 'assignment' | 'test' | 'lesson'
  dueDate: Date
  courseName: string
  courseId: string
  urgency: 'low' | 'medium' | 'high'
}

export interface StudentDashboardData {
  progressStats: StudentProgressStats
  enrolledCourses: EnrolledCourse[]
  upcomingActivities: UpcomingActivity[]
  totalEnrollments: number
}

export async function getStudentDashboardData(userId: string): Promise<StudentDashboardData> {
  try {
    // Get all enrollments for the student
    const enrollments = await prisma.enrollment.findMany({
      where: { studentId: userId },
      include: {
        course: {
          include: {
            modules: {
              include: {
                lessons: {
                  include: {
                    lessonCompletions: {
                      where: { studentId: userId }
                    }
                  }
                }
              }
            }
          }
        }
      },
      orderBy: { enrolledAt: 'desc' }
    })

    // Calculate progress statistics
    let totalLessons = 0
    let completedLessons = 0
    const enrolledCourses: EnrolledCourse[] = []

    for (const enrollment of enrollments) {
      const course = enrollment.course
      let courseTotalLessons = 0
      let courseCompletedLessons = 0
      let lastAccessed: Date | null = null

      // Count lessons and completions for this course
      for (const module of course.modules) {
        for (const lesson of module.lessons) {
          courseTotalLessons++
          totalLessons++
          
          const completion = lesson.lessonCompletions.find(
            comp => comp.studentId === userId
          )
          
          if (completion) {
            courseCompletedLessons++
            completedLessons++
            
            // Track most recent access
            if (!lastAccessed || completion.completedAt > lastAccessed) {
              lastAccessed = completion.completedAt
            }
          }
        }
      }

      // Calculate course progress percentage
      const progress = courseTotalLessons > 0 
        ? Math.round((courseCompletedLessons / courseTotalLessons) * 100)
        : 0

      // Determine course status
      const status: 'active' | 'completed' = progress === 100 ? 'completed' : 'active'

      enrolledCourses.push({
        id: course.id,
        title: course.title,
        thumbnail: course.thumbnail,
        progress,
        status,
        lastAccessed,
        totalLessons: courseTotalLessons,
        completedLessons: courseCompletedLessons
      })
    }

    // For now, we'll use lessons as a proxy for assignments and tests
    // In a real implementation, you'd have separate models for these
    const progressStats: StudentProgressStats = {
      lessonsCompleted: completedLessons,
      totalLessons: totalLessons,
      assignmentsCompleted: Math.floor(completedLessons * 0.3), // Approximate
      totalAssignments: Math.floor(totalLessons * 0.3),
      testsCompleted: Math.floor(completedLessons * 0.1), // Approximate
      totalTests: Math.floor(totalLessons * 0.1)
    }

    // Generate upcoming activities based on incomplete lessons
    const upcomingActivities = generateUpcomingActivities(enrollments, userId)

    return {
      progressStats,
      enrolledCourses,
      upcomingActivities,
      totalEnrollments: enrollments.length
    }
  } catch (error) {
    console.error("Error fetching student dashboard data:", error)
    
    // Return empty data structure on error
    return {
      progressStats: {
        lessonsCompleted: 0,
        totalLessons: 0,
        assignmentsCompleted: 0,
        totalAssignments: 0,
        testsCompleted: 0,
        totalTests: 0
      },
      enrolledCourses: [],
      upcomingActivities: [],
      totalEnrollments: 0
    }
  }
}