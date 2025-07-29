"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Sidebar } from "@/components/layout/sidebar"
import { useAuth } from "@/components/auth/auth-provider"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import { Suspense } from "react"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { user, profile, loading } = useAuth()
  const router = useRouter()
  const [isRedirecting, setIsRedirecting] = useState(false)

  useEffect(() => {
    if (!loading && !user && !isRedirecting) {
      setIsRedirecting(true)
      router.push("/auth")
    }
  }, [user, loading, router, isRedirecting])

  // Show loading spinner while checking auth or redirecting
  if (loading || isRedirecting || !user || !profile) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <LoadingSpinner />
      </div>
    )
  }

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar user={profile} />
      <main className="flex-1 overflow-auto md:ml-0">
        <div className="p-6 md:p-8">
          <Suspense fallback={<LoadingSpinner />}>{children}</Suspense>
        </div>
      </main>
    </div>
  )
}
