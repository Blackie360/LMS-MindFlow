"use client"

import { useEffect } from "react"
import { useRouter, usePathname } from "next/navigation"
import { useSession } from "@/lib/auth-client"

export function SessionManager() {
  const { data: session, isPending } = useSession()
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    if (isPending) return

    if (session?.user) {
      // User is signed in
      if (pathname === "/auth" || pathname === "/") {
        router.push("/dashboard")
      }
    } else {
      // User is not signed in
      if (pathname !== "/auth" && pathname !== "/") {
        router.push("/auth")
      }
    }
  }, [session, isPending, router, pathname])

  return null // This component doesn't render anything
}
