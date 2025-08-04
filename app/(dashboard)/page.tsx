import { redirect } from "next/navigation"
import { getCurrentUser } from "@/lib/session"

export default async function DashboardPage() {
  try {
    const user = await getCurrentUser()

    if (!user) {
      redirect("/auth")
    }

    // Route users to their role-specific dashboard
    if (user.role === "STUDENT") {
      redirect("/student")
    } else if (user.role === "INSTRUCTOR") {
      redirect("/admin")
    } else {
      // Fallback for any unexpected role values
      console.warn(`Unexpected user role: ${user.role}`)
      redirect("/student") // Default to student dashboard
    }
  } catch (error) {
    console.error("Dashboard routing error:", error)
    
    // Log additional context for debugging
    if (error instanceof Error) {
      console.error("Dashboard routing error details:", {
        message: error.message,
        stack: error.stack,
        timestamp: new Date().toISOString(),
      })
    }
    
    // On error, redirect to auth for safety
    redirect("/auth")
  }
}