import { redirect } from "next/navigation"
import { getCurrentUser } from "@/lib/session"
import { AdminDashboardContent } from "./components/admin-dashboard-content"

export default async function AdminDashboardPage() {
  try {
    const user = await getCurrentUser()

    if (!user) {
      redirect("/auth")
    }

    // Ensure only instructors can access this page
    if (user.role !== "INSTRUCTOR") {
      redirect("/student")
    }

    return (
      <div className="space-y-6">
        <div className="flex flex-col space-y-2">
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold tracking-tight">
            Admin Dashboard
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground">
            Manage your courses, track student progress, and monitor platform statistics.
          </p>
        </div>

        <AdminDashboardContent userId={user.id} />
      </div>
    )
  } catch (error) {
    console.error("Admin dashboard error:", error)
    
    // Log additional context for debugging
    if (error instanceof Error) {
      console.error("Admin dashboard error details:", {
        message: error.message,
        stack: error.stack,
        timestamp: new Date().toISOString(),
      })
    }
    
    // On error, redirect to auth for safety
    redirect("/auth")
  }
}