import { redirect } from "next/navigation"
import { getCurrentUser } from "@/lib/session"
import { StudentDashboardContent } from "./components/student-dashboard-content"

export default async function StudentDashboardPage() {
  try {
    const user = await getCurrentUser()

    if (!user) {
      redirect("/auth")
    }

    // Ensure only students can access this page
    if (user.role !== "STUDENT") {
      redirect("/admin")
    }

    return (
      <div className="space-y-6">
        <div className="flex flex-col space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">
            Welcome back, {user.name || user.email}!
          </h1>
          <p className="text-muted-foreground">
            Here's an overview of your learning progress and upcoming activities.
          </p>
        </div>

        <StudentDashboardContent userId={user.id} />
      </div>
    )
  } catch (error) {
    console.error("Student dashboard error:", error)
    
    // Log additional context for debugging
    if (error instanceof Error) {
      console.error("Student dashboard error details:", {
        message: error.message,
        stack: error.stack,
        timestamp: new Date().toISOString(),
      })
    }
    
    // On error, redirect to auth for safety
    redirect("/auth")
  }
}