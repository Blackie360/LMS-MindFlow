# Design Document

## Overview

This design creates a comprehensive dual-dashboard system inspired by modern educational platforms like QuYL. The system provides distinct, role-specific interfaces for students and administrators while maintaining a cohesive design language. Students receive a progress-focused dashboard with visual learning analytics, while administrators get course management tools and student tracking capabilities. The design emphasizes visual progress indicators, card-based layouts, and intuitive navigation patterns.

## Architecture

### Current System Analysis
The existing system has:
- Role-based authentication with STUDENT/INSTRUCTOR roles
- Basic dashboard at `app/dashboard/page.tsx` with simple stats
- Sidebar navigation with role-specific menu items
- Database models supporting courses, enrollments, and lesson completions

### Proposed Enhanced Architecture
```
app/
├── (dashboard)/
│   ├── layout.tsx              # Enhanced with role-specific layouts
│   ├── page.tsx                # New unified dashboard router
│   ├── student/
│   │   └── page.tsx           # Student dashboard implementation
│   ├── admin/
│   │   ├── page.tsx           # Admin dashboard implementation
│   │   ├── courses/           # Course management
│   │   ├── students/          # Student tracking
│   │   └── analytics/         # Platform analytics
│   └── components/
│       ├── student-dashboard/ # Student-specific components
│       └── admin-dashboard/   # Admin-specific components
```

## Components and Interfaces

### 1. Dashboard Router (`app/(dashboard)/page.tsx`)
```typescript
interface DashboardPageProps {
  // Server component that routes based on user role
}

// Routes to appropriate dashboard based on user.role
// STUDENT -> /student dashboard view
// INSTRUCTOR -> /admin dashboard view
```

### 2. Student Dashboard Components

#### Progress Status Cards
```typescript
interface ProgressCardProps {
  title: string
  count: number
  total: number
  color: 'orange' | 'pink' | 'green'
  icon: React.ComponentType
}

// Cards for: Lessons (42/75), Assignments (08/25), Tests (03/12)
```

#### Course Progress Section
```typescript
interface CourseProgressProps {
  courses: {
    id: string
    title: string
    progress: number
    status: 'active' | 'completed'
    thumbnail: string
  }[]
}

// Shows enrolled courses with progress bars and status indicators
```

#### Upcoming Activities Calendar
```typescript
interface UpcomingActivityProps {
  activities: {
    id: string
    title: string
    type: 'assignment' | 'test' | 'lesson'
    dueDate: Date
    course: string
  }[]
}

// Mini calendar with upcoming assignments and deadlines
```

### 3. Admin Dashboard Components

#### Platform Statistics Cards
```typescript
interface AdminStatsProps {
  totalCourses: number
  totalStudents: number
  totalEnrollments: number
  completionRate: number
}

// Overview cards showing platform-wide metrics
```

#### Course Management Panel
```typescript
interface CourseManagementProps {
  recentCourses: Course[]
  pendingApprovals: number
  draftCourses: number
}

// Quick access to course creation and management
```

#### Student Analytics Dashboard
```typescript
interface StudentAnalyticsProps {
  enrollmentTrends: ChartData[]
  completionRates: ChartData[]
  activeStudents: number
}

// Charts and graphs showing student engagement and progress
```

## Data Models

### Enhanced Dashboard Data Structure
```typescript
interface StudentDashboardData {
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
    thumbnail: string
    progress: number
    status: 'active' | 'completed'
    lastAccessed: Date
  }[]
  upcomingActivities: {
    id: string
    title: string
    type: 'assignment' | 'test' | 'lesson'
    dueDate: Date
    courseName: string
  }[]
  recentAchievements: Achievement[]
}

interface AdminDashboardData {
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

interface ChartDataPoint {
  date: string
  value: number
  label?: string
}
```

### Database Query Optimization
```typescript
// Student dashboard queries
const getStudentDashboardData = async (userId: string) => {
  const [user, enrollments, completions, upcomingActivities] = await Promise.all([
    prisma.user.findUnique({ where: { id: userId } }),
    prisma.enrollment.findMany({
      where: { studentId: userId },
      include: { course: true }
    }),
    prisma.lessonCompletion.findMany({
      where: { studentId: userId }
    }),
    // Query for upcoming assignments/tests
  ])
  
  return processStudentData(user, enrollments, completions, upcomingActivities)
}

// Admin dashboard queries
const getAdminDashboardData = async (userId: string) => {
  const [platformStats, myCourses, enrollmentTrends] = await Promise.all([
    getPlatformStatistics(),
    prisma.course.findMany({ where: { createdBy: userId } }),
    getEnrollmentTrends()
  ])
  
  return processAdminData(platformStats, myCourses, enrollmentTrends)
}
```

## Error Handling

### Dashboard Loading States
- Skeleton components for each dashboard section
- Progressive loading with priority for critical stats
- Graceful degradation when data is unavailable

### Role-Based Error Handling
```typescript
// Redirect logic for role mismatches
if (user.role === 'STUDENT' && pathname.startsWith('/admin')) {
  redirect('/dashboard')
}

if (user.role === 'INSTRUCTOR' && pathname.startsWith('/student')) {
  redirect('/admin')
}
```

### Data Fetching Error Recovery
- Fallback to cached data when possible
- Default values for missing statistics
- User-friendly error messages with retry options

## Testing Strategy

### Component Testing
1. **Student Dashboard Components**
   - Progress card calculations and display
   - Course list rendering with correct progress bars
   - Calendar component with upcoming activities
   - Responsive layout on mobile devices

2. **Admin Dashboard Components**
   - Statistics card accuracy
   - Course management panel functionality
   - Student analytics chart rendering
   - Data export capabilities

### Integration Testing
1. **Role-Based Routing**
   - Correct dashboard display for each role
   - Proper redirects for unauthorized access
   - Session persistence across dashboard sections

2. **Data Consistency**
   - Progress calculations match database state
   - Real-time updates when data changes
   - Proper error handling for database failures

### Performance Testing
- Dashboard load times under various data volumes
- Chart rendering performance with large datasets
- Mobile responsiveness across device sizes

## Visual Design System

### Color Palette (Inspired by QuYL)
```css
:root {
  /* Progress indicators */
  --progress-orange: #ff9500;
  --progress-pink: #ff6b9d;
  --progress-green: #4ade80;
  
  /* Status colors */
  --status-active: #3b82f6;
  --status-completed: #10b981;
  --status-pending: #f59e0b;
  
  /* Background gradients */
  --card-orange-bg: linear-gradient(135deg, #fff7ed 0%, #fed7aa 100%);
  --card-pink-bg: linear-gradient(135deg, #fdf2f8 0%, #fce7f3 100%);
  --card-green-bg: linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%);
}
```

### Card Design System
```typescript
interface DashboardCardProps {
  variant: 'progress' | 'stat' | 'action'
  color?: 'orange' | 'pink' | 'green' | 'blue'
  size?: 'sm' | 'md' | 'lg'
  children: React.ReactNode
}

// Consistent card styling across both dashboards
```

### Typography Hierarchy
- Dashboard titles: text-3xl font-bold
- Section headers: text-xl font-semibold
- Card titles: text-sm font-medium
- Statistics: text-2xl font-bold
- Descriptions: text-xs text-muted-foreground

## Responsive Design

### Mobile-First Approach
```css
/* Mobile (default) */
.dashboard-grid {
  grid-template-columns: 1fr;
  gap: 1rem;
}

/* Tablet */
@media (min-width: 768px) {
  .dashboard-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 1.5rem;
  }
}

/* Desktop */
@media (min-width: 1024px) {
  .dashboard-grid {
    grid-template-columns: repeat(3, 1fr);
    gap: 2rem;
  }
}
```

### Component Adaptations
- Progress cards stack vertically on mobile
- Course list becomes horizontal scroll on small screens
- Admin charts adapt to container width
- Sidebar collapses to hamburger menu on mobile

## Security Considerations

### Role-Based Access Control
```typescript
// Middleware for dashboard routes
export async function middleware(request: NextRequest) {
  const user = await getCurrentUser()
  
  if (!user) {
    return NextResponse.redirect(new URL('/auth', request.url))
  }
  
  // Enforce role-based access
  if (request.nextUrl.pathname.startsWith('/admin') && user.role !== 'INSTRUCTOR') {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }
  
  return NextResponse.next()
}
```

### Data Privacy
- Students only see their own progress data
- Admins see aggregated data without personal details
- Proper data sanitization in API responses
- Audit logging for sensitive operations

## Performance Considerations

### Data Loading Strategy
1. **Critical Path Loading**
   - User info and basic stats load first
   - Secondary data loads progressively
   - Non-critical widgets load last

2. **Caching Strategy**
   - Redis cache for frequently accessed stats
   - Browser cache for static dashboard assets
   - Database query optimization with proper indexes

3. **Code Splitting**
   - Separate bundles for student and admin dashboards
   - Lazy loading for chart components
   - Dynamic imports for heavy dashboard widgets

### Database Optimization
```sql
-- Indexes for dashboard queries
CREATE INDEX idx_enrollments_student_id ON enrollments(student_id);
CREATE INDEX idx_lesson_completions_student_id ON lesson_completions(student_id);
CREATE INDEX idx_courses_created_by ON courses(created_by);
CREATE INDEX idx_enrollments_course_created_by ON enrollments(course_id) 
  WHERE course_id IN (SELECT id FROM courses WHERE created_by = ?);
```

## Implementation Phases

### Phase 1: Core Dashboard Structure
- Create role-based routing system
- Implement basic student dashboard with progress cards
- Set up admin dashboard with platform statistics
- Ensure responsive design works across devices

### Phase 2: Enhanced Features
- Add course progress visualization
- Implement upcoming activities calendar
- Create student analytics for admin dashboard
- Add real-time data updates

### Phase 3: Advanced Analytics
- Implement detailed progress tracking
- Add course completion predictions
- Create engagement analytics
- Build reporting and export features

### Phase 4: Polish and Optimization
- Performance optimization and caching
- Advanced error handling and recovery
- Accessibility improvements
- User experience enhancements

## Migration Strategy

### Backward Compatibility
- Existing `/dashboard` route redirects to appropriate role-based dashboard
- Current sidebar navigation remains functional
- Database schema requires no breaking changes
- API endpoints maintain existing contracts

### Deployment Approach
- Feature flags for gradual rollout
- A/B testing between old and new dashboards
- Rollback plan if issues arise
- User feedback collection and iteration