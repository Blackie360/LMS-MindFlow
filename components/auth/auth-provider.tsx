"use client"

import { createContext, useContext, type ReactNode } from "react"
import { signOut as betterAuthSignOut } from "@/lib/auth-client"
import { useRouter } from "next/navigation"

interface AuthContextType {
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const router = useRouter()

  const signOut = async () => {
    try {
      await betterAuthSignOut()
      router.push("/auth")
      router.refresh()
    } catch (error) {
      console.error("Sign out error:", error)
      
      // Log additional context for debugging
      if (error instanceof Error) {
        console.error("Sign out error details:", {
          message: error.message,
          stack: error.stack,
          timestamp: new Date().toISOString(),
        })
      }
      
      // Even if sign out fails on the server, redirect to auth page
      // to ensure user can't access protected content
      router.push("/auth")
      router.refresh()
      
      throw error
    }
  }

  return (
    <AuthContext.Provider value={{ signOut }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}