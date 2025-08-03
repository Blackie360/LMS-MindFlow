import { redirect } from "next/navigation"
import { supabase } from "@/lib/supabase"
import { getCurrentUser } from "@/lib/auth"
import { CourseCard } from "@/components/courses/course-card"

export default async function MyCoursesPage() {
  const user = await getCurrentUser()

  if (!user) {
    redirect("/auth")
  }

  // Fetch user's enrolled courses with progress
  const { data: enrollments } = await supabase
    .from("enrollments")
    .select(`
      *,
      course:courses(
        *,
        category:categories(*),
        lessons(*)
      )
    `)
    .eq("student_id", user.id)
    .order("enrolled_at", { ascending: false })

  // Calculate progress for each course
  const coursesWithProgress = await Promise.all(
    (enrollments || []).map(async (enrollment) => {
      const course = enrollment.course
      if (!course || !course.lessons) return { enrollment, progress: 0 }

      const { data: progress } = await supabase
        .from("lesson_progress")
        .select("*")
        .eq("student_id", user.id)
        .in(
          "lesson_id",
          course.lessons.map((l) => l.id),
        )
        .eq("completed", true)

      const progressPercentage = course.lessons.length > 0 ? ((progress?.length || 0) / course.lessons.length) * 100 : 0

      return { enrollment, progress: progressPercentage }
    }),
  )

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">My Courses</h1>
        <p className="text-gray-600">Continue your learning journey</p>
      </div>

      {coursesWithProgress.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {coursesWithProgress.map(({ enrollment, progress }) => (
            <CourseCard key={enrollment.id} course={enrollment.course} isEnrolled={true} progress={progress} />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <p className="text-gray-500 mb-4">You haven't enrolled in any courses yet.</p>
          <a
            href="/courses"
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            Browse Courses
          </a>
        </div>
      )}
    </div>
  )
}
