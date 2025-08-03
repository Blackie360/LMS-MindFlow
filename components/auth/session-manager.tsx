"use client"

import { useEffect, useState } from "react"
import { useRouter, usePathname } from "next/navigation"
import { supabase } from "@/lib/supabase"
import { toast } from "@/hooks/use-toast"
import { refreshSession } from "@/lib/auth"

export function SessionManager() {
  const [isRefreshing, setIsRefreshing] = useState(false)
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    let refreshTimer: NodeJS.Timeout

    const setupSessionRefresh = () => {
      // Refresh session every 50 minutes (tokens expire after 1 hour)
      refreshTimer = setInterval(
        async () => {
          if (!isRefreshing) {
            setIsRefreshing(true)

            try {
              const { error } = await refreshSession()

              if (error) {
                console.error("Session refresh failed:", error)
                toast({
                  title: "Session Expired",
                  description: "Please sign in again to continue.",
                  variant: "destructive",
                })
                // Use window.location for more reliable redirect
                window.location.href = "/auth"
              }
            } catch (error) {
              console.error("Session refresh error:", error)
            } finally {
              setIsRefreshing(false)
            }
          }
        },
        50 * 60 * 1000,
      ) // 50 minutes
    }

    // Listen for auth state changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      console.log("Auth state changed:", event, !!session)

      if (event === "SIGNED_IN" && session) {
        setupSessionRefresh()
        // Redirect to dashboard after successful sign in
        if (pathname === "/auth" || pathname === "/") {
          setTimeout(() => {
            window.location.href = "/dashboard"
          }, 100)
        }
      } else if (event === "SIGNED_OUT") {
        if (refreshTimer) {
          clearInterval(refreshTimer)
        }
        // Redirect to auth after sign out
        if (pathname !== "/auth" && pathname !== "/") {
          setTimeout(() => {
            window.location.href = "/auth"
          }, 100)
        }
      }
    })

    // Setup initial refresh if user is already signed in
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        setupSessionRefresh()
      }
    })

    return () => {
      if (refreshTimer) {
        clearInterval(refreshTimer)
      }
      subscription.unsubscribe()
    }
  }, [router, pathname, isRefreshing])

  return null // This component doesn't render anything
}
