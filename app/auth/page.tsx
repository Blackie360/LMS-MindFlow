import { redirect } from "next/navigation"
import { auth } from "@/lib/auth"
import { headers } from "next/headers"
import { AuthForm } from "@/components/auth/auth-form"

export default async function AuthPage() {
  const session = await auth.api.getSession({
    headers: headers(),
  })

  if (session) {
    redirect("/dashboard")
  }

  return <AuthForm />
}
