import { redirect } from "next/navigation"
import { getCurrentUser } from "@/lib/session"
import { ROLES } from "@/lib/constants"

// Force dynamic rendering
export const dynamic = 'force-dynamic'

export default async function DashboardPage() {
  const user = await getCurrentUser()

  if (!user) {
    redirect("/auth")
  }

  // Redirect users to role-specific dashboards
  switch (user.role) {
    case ROLES.ADMIN:
      redirect("/admin")
    case ROLES.INSTRUCTOR:
      redirect("/instructor")
    case ROLES.STUDENT:
      redirect("/student")
    default:
      // Fallback to student dashboard for unknown roles
      redirect("/student")
  }
}
