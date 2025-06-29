import { redirect } from "next/navigation"
import { getCurrentUser } from "@/lib/auth"

export default async function HomePage() {
  const user = await getCurrentUser()

  // Immediate redirect based on auth status
  if (user) {
    redirect("/dashboard")
  } else {
    redirect("/auth")
  }
}
