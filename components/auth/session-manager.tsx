"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase"
import { toast } from "@/hooks/use-toast"
import { refreshSession } from "@/lib/auth"

export function SessionManager() {
  const [isRefreshing, setIsRefreshing] = useState(false)
  const router = useRouter()

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
                router.push("/auth")
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
      if (event === "SIGNED_IN" && session) {
        setupSessionRefresh()
      } else if (event === "SIGNED_OUT") {
        if (refreshTimer) {
          clearInterval(refreshTimer)
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
  }, [router, isRefreshing])

  return null // This component doesn't render anything
}
