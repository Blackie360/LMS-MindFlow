"use client"

import type React from "react"
import { createContext, useContext, useEffect, useState } from "react"
import { useRouter, usePathname } from "next/navigation"
import { supabase } from "@/lib/supabase"
import type { Profile } from "@/lib/supabase"
import type { User } from "@supabase/supabase-js"

interface AuthContextType {
  user: User | null
  profile: Profile | null
  loading: boolean
  signOut: () => Promise<void>
  refreshProfile: () => Promise<void>
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  profile: null,
  loading: true,
  signOut: async () => {},
  refreshProfile: async () => {},
})

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const pathname = usePathname()

  const refreshProfile = async () => {
    if (!user) return

    try {
      const { data: profileData } = await supabase.from("profiles").select("*").eq("id", user.id).single()

      setProfile(profileData)
    } catch (error) {
      console.error("Error refreshing profile:", error)
    }
  }

  const handleSignOut = async () => {
    try {
      setLoading(true)

      // Clear local state immediately
      setUser(null)
      setProfile(null)

      // Clear any local storage
      if (typeof window !== "undefined") {
        localStorage.removeItem("user-preferences")
        localStorage.removeItem("course-progress")
        sessionStorage.clear()
      }

      // Sign out from Supabase
      const { error } = await supabase.auth.signOut({
        scope: "global",
      })

      if (error) {
        console.error("Sign out error:", error)
        throw error
      }

      // Redirect to auth page
      router.push("/auth")
      router.refresh()
    } catch (error) {
      console.error("Sign out failed:", error)
      // Even if there's an error, redirect to auth page
      router.push("/auth")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    // Get initial session
    const getInitialSession = async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession()

        setUser(session?.user ?? null)

        if (session?.user) {
          const { data: profileData } = await supabase.from("profiles").select("*").eq("id", session.user.id).single()

          setProfile(profileData)

          // Auto-redirect authenticated users away from auth page
          if (pathname === "/auth" || pathname === "/") {
            router.push("/dashboard")
          }
        } else {
          // Redirect unauthenticated users to auth page (except for public pages)
          const publicPaths = ["/auth", "/"]
          if (!publicPaths.includes(pathname)) {
            router.push("/auth")
          }
        }
      } catch (error) {
        console.error("Error getting initial session:", error)
      } finally {
        setLoading(false)
      }
    }

    getInitialSession()

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log("Auth state changed:", event, session?.user?.email)

      setUser(session?.user ?? null)

      if (session?.user) {
        // User signed in
        const { data: profileData } = await supabase.from("profiles").select("*").eq("id", session.user.id).single()

        setProfile(profileData)

        // Auto-redirect to dashboard after sign in/up
        if (pathname === "/auth" || pathname === "/") {
          router.push("/dashboard")
          router.refresh()
        }
      } else {
        // User signed out
        setProfile(null)

        // Clear any cached data
        if (typeof window !== "undefined") {
          localStorage.removeItem("user-preferences")
          localStorage.removeItem("course-progress")
          sessionStorage.clear()
        }

        // Redirect to auth page if not already there
        if (pathname !== "/auth" && pathname !== "/") {
          router.push("/auth")
        }
      }

      setLoading(false)
    })

    return () => subscription.unsubscribe()
  }, [router, pathname])

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        loading,
        signOut: handleSignOut,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
