export interface User {
  id: string
  name?: string | null
  email: string
  role: 'STUDENT' | 'INSTRUCTOR'
  image?: string | null
  createdAt: Date
  updatedAt: Date
}

export interface StudentDashboardData {
  user: User
  progressStats: {
    lessonsCompleted: number
    totalLessons: number
    assignmentsCompleted: number
    totalAssignments: number
    testsCompleted: number
    totalTests: number
  }
  enrolledCourses: {
    id: string
    title: string
    thumbnail?: string | null
    progress: number
    status: 'active' | 'completed'
    lastAccessed?: Date
  }[]
  upcomingActivities: {
    id: string
    title: string
    type: 'assignment' | 'test' | 'lesson'
    dueDate: Date
    courseName: string
  }[]
  recentAchievements?: Achievement[]
}

export interface AdminDashboardData {
  user: User
  platformStats: {
    totalCourses: number
    totalStudents: number
    totalEnrollments: number
    averageCompletionRate: number
  }
  courseManagement: {
    myCourses: Course[]
    draftCourses: number
    pendingReviews: number
  }
  studentAnalytics: {
    newEnrollmentsThisWeek: number
    activeStudentsToday: number
    completionTrends: ChartDataPoint[]
  }
  recentActivity: ActivityLog[]
}

export interface Course {
  id: string
  title: string
  description?: string | null
  thumbnail?: string | null
  createdBy: string
  createdAt: Date
  updatedAt: Date
  enrollments?: Enrollment[]
  modules?: Module[]
}

export interface Enrollment {
  id: string
  courseId: string
  studentId: string
  enrolledAt: Date
  course?: Course
  student?: User
}

export interface Module {
  id: string
  courseId: string
  title: string
  order: number
  lessons?: Lesson[]
}

export interface Lesson {
  id: string
  moduleId: string
  title: string
  content?: string | null
  videoUrl?: string | null
  order: number
  lessonCompletions?: LessonCompletion[]
}

export interface LessonCompletion {
  id: string
  lessonId: string
  studentId: string
  completedAt: Date
}

export interface Achievement {
  id: string
  title: string
  description: string
  earnedAt: Date
  type: 'course_completion' | 'streak' | 'milestone'
}

export interface ChartDataPoint {
  date: string
  value: number
  label?: string
}

export interface ActivityLog {
  id: string
  action: string
  description: string
  timestamp: Date
  userId: string
}

export interface DashboardCardProps {
  variant: 'progress' | 'stat' | 'action'
  color?: 'orange' | 'pink' | 'green' | 'blue'
  size?: 'sm' | 'md' | 'lg'
  children: React.ReactNode
}

export interface ProgressCardProps {
  title: string
  count: number
  total: number
  color: 'orange' | 'pink' | 'green'
  icon: React.ComponentType<{ className?: string }>
}