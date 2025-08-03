"use client"

import { useEffect } from "react"
import { AuthForm } from "@/components/auth/auth-form"
import { getCurrentUser } from "@/lib/auth"

export default function AuthPage() {
  useEffect(() => {
    // Check if user is already authenticated and redirect
    const checkAuth = async () => {
      try {
        const user = await getCurrentUser()
        if (user) {
          window.location.replace("/dashboard")
        }
      } catch (error) {
        // User not authenticated, stay on auth page
        console.log("User not authenticated")
      }
    }

    checkAuth()
  }, [])

  return <AuthForm />
}
