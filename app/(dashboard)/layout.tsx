import type React from "react"
import { redirect } from "next/navigation"
import { getCurrentUser } from "@/lib/session"
import { NotificationProvider } from "@/components/dashboard/notification-system"
import { ErrorBoundary } from "@/components/dashboard/error-boundary"
import { DashboardLayoutClient } from "@/components/dashboard/dashboard-layout-client"
import { createErrorFallback } from "@/lib/error-handling"

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  try {
    const user = await getCurrentUser()

    if (!user) {
      redirect("/auth")
    }

    return (
      <NotificationProvider>
        <ErrorBoundary
          fallback={createErrorFallback(
            "Dashboard Layout Error",
            "Something went wrong with the dashboard layout. Please refresh the page."
          )}
        >
          <DashboardLayoutClient user={user}>
            {children}
          </DashboardLayoutClient>
        </ErrorBoundary>
      </NotificationProvider>
    )
  } catch (error) {
    console.error("Dashboard layout error:", error)
    
    // Log additional context for debugging
    if (error instanceof Error) {
      console.error("Dashboard layout error details:", {
        message: error.message,
        stack: error.stack,
        timestamp: new Date().toISOString(),
      })
    }
    
    redirect("/auth")
  }

  // Fallback loading component (should not be reached due to redirects)
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
    </div>
  )
}
