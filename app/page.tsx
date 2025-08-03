"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { getCurrentUser } from "@/lib/auth"

export default function ClientRedirect() {
  const router = useRouter()

  useEffect(() => {
    const checkAndRedirect = async () => {
      try {
        const user = await getCurrentUser()
        if (user) {
          window.location.replace("/dashboard")
        } else {
          window.location.replace("/auth")
        }
      } catch (error) {
        console.error("Redirect error:", error)
        window.location.replace("/auth")
      }
    }

    checkAndRedirect()
  }, [router])

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
        <p>Redirecting...</p>
      </div>
    </div>
  )
}
