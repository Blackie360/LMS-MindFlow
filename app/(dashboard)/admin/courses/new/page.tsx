import { redirect } from "next/navigation"
import { getCurrentUser } from "@/lib/session"
import { CourseForm } from "@/components/admin/course-form"

export default async function NewCoursePage() {
  const user = await getCurrentUser()

  if (!user || user.role !== "admin") {
    redirect("/dashboard")
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Create New Course</h1>
        <p className="text-gray-600">Add a new course to your learning platform</p>
      </div>

      <CourseForm />
    </div>
  )
}
