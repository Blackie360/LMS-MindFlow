import { supabase } from "@/lib/supabase"
import { CourseCard } from "@/components/courses/course-card"
import { getCurrentUser } from "@/lib/auth"
import { redirect } from "next/navigation"
import { CourseFilters } from "@/components/courses/course-filters"

export default async function CoursesPage() {
  const user = await getCurrentUser()

  if (!user) {
    redirect("/auth")
  }

  // Fetch published courses with category and enrollment info
  const { data: courses } = await supabase
    .from("courses")
    .select(`
      *,
      category:categories(*),
      instructor:profiles(*),
      enrollments(count)
    `)
    .eq("status", "published")
    .order("created_at", { ascending: false })

  // Get user's enrollments
  const { data: enrollments } = await supabase.from("enrollments").select("course_id").eq("student_id", user.id)

  const enrolledCourseIds = new Set(enrollments?.map((e) => e.course_id) || [])

  // Get categories for filtering
  const { data: categories } = await supabase.from("categories").select("*").order("name")

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Browse Courses</h1>
        <p className="text-gray-600">Discover new skills and advance your career</p>
      </div>

      {/* Search and Filters */}
      <CourseFilters categories={categories || []} />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {courses?.map((course) => (
          <CourseCard
            key={course.id}
            course={course}
            showEnrollButton={true}
            isEnrolled={enrolledCourseIds.has(course.id)}
          />
        ))}
      </div>

      {!courses ||
        (courses.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500">No courses available at the moment.</p>
          </div>
        ))}
    </div>
  )
}
