-- Performance optimization indexes for dashboard queries
-- These indexes are designed to optimize the most common dashboard queries

-- Index for student dashboard queries
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_enrollments_student_id_enrolled_at 
ON enrollments(student_id, enrolled_at DESC);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_lesson_completions_student_id_completed_at 
ON lesson_completions(student_id, completed_at DESC);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_lesson_completions_lesson_student 
ON lesson_completions(lesson_id, student_id);

-- Index for admin dashboard queries
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_courses_created_by_status_created_at 
ON courses(created_by, status, created_at DESC);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_enrollments_course_enrolled_at 
ON enrollments(course_id, enrolled_at DESC);

-- Composite index for course-module-lesson hierarchy queries
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_modules_course_order 
ON modules(course_id, "order");

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_lessons_module_order 
ON lessons(module_id, "order");

-- Index for user role-based queries
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_users_role_created_at 
ON "user"(role, created_at DESC);

-- Index for session management
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_sessions_user_expires 
ON session(user_id, expires_at DESC);

-- Partial indexes for active courses only
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_courses_published_created_by 
ON courses(created_by, created_at DESC) 
WHERE status = 'PUBLISHED';

-- Index for counting aggregations
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_enrollments_count_by_course 
ON enrollments(course_id) 
INCLUDE (student_id, enrolled_at);

-- Index for lesson completion statistics
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_lesson_completions_stats 
ON lesson_completions(lesson_id) 
INCLUDE (student_id, completed_at);