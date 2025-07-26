import { redirect } from "next/navigation"
import { getCurrentUser } from "@/lib/auth"

export default async function HomePage() {
  try {
    const user = await getCurrentUser()

    // Immediate redirect based on auth status
    if (user) {
      redirect("/dashboard")
    } else {
      redirect("/auth")
    }
  } catch (error) {
    console.error("Error checking auth status:", error)
    // If there's an error, redirect to auth page
    redirect("/auth")
  }
}
