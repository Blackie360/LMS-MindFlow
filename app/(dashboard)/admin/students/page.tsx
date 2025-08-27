import { redirect } from "next/navigation"
import { getCurrentUser } from "@/lib/session"
import { prisma } from "@/lib/prisma"
import { StudentsTable } from "@/components/admin/students-table"

// Force dynamic rendering
export const dynamic = 'force-dynamic'

export default async function AdminStudentsPage() {
  const user = await getCurrentUser()

  if (!user || user.role !== "admin") {
    redirect("/dashboard")
  }

  // Fetch students with enrollment data
  const { data: students } = await supabase
    .from("profiles")
    .select(`
      *,
      enrollments(
        id,
        enrolled_at,
        completed_at,
        course:courses(title)
      )
    `)
    .eq("role", "student")
    .order("created_at", { ascending: false })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Student Management</h1>
        <p className="text-gray-600">Manage student accounts and track their progress</p>
      </div>

      <StudentsTable students={students || []} />
    </div>
  )
}
