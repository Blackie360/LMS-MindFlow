import { redirect } from "next/navigation"
import { getCurrentUser } from "@/lib/session"
import { prisma } from "@/lib/prisma"
import { AnalyticsDashboard } from "@/components/admin/analytics-dashboard"

// Force dynamic rendering
export const dynamic = 'force-dynamic'

export default async function AdminAnalyticsPage() {
  const user = await getCurrentUser()

  if (!user || user.role !== "admin") {
    redirect("/dashboard")
  }

  // Fetch analytics data
  const [coursesResult, studentsResult, enrollmentsResult, lessonsResult] = await Promise.all([
    supabase.from("courses").select("id, status, created_at", { count: "exact" }),
    supabase.from("profiles").select("id, created_at", { count: "exact" }).eq("role", "student"),
    supabase
      .from("enrollments")
      .select("id, enrolled_at, completed_at, course:courses(title)", { count: "exact" })
      .order("enrolled_at", { ascending: false }),
    supabase.from("lessons").select("id", { count: "exact" }),
  ])

  const analytics = {
    totalCourses: coursesResult.count || 0,
    publishedCourses: coursesResult.data?.filter((c) => c.status === "published").length || 0,
    totalStudents: studentsResult.count || 0,
    totalEnrollments: enrollmentsResult.count || 0,
    totalLessons: lessonsResult.count || 0,
    completedCourses: enrollmentsResult.data?.filter((e) => e.completed_at).length || 0,
    recentEnrollments: enrollmentsResult.data?.slice(0, 10) || [],
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Analytics Dashboard</h1>
        <p className="text-gray-600">Track your platform's performance and growth</p>
      </div>

      <AnalyticsDashboard analytics={analytics} />
    </div>
  )
}
