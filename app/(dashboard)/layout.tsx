import type React from "react"
import { redirect } from "next/navigation"
import { Sidebar } from "@/components/layout/sidebar"
// Ensure the import is correct
import { getCurrentUser } from "@/lib/auth"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import { Suspense } from "react"

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
      <div className="flex h-screen bg-gray-50">
        <Sidebar user={user} />
        <main className="flex-1 overflow-auto md:ml-0">
          <div className="p-6 md:p-8">
            <Suspense fallback={<LoadingSpinner />}>{children}</Suspense>
          </div>
        </main>
      </div>
    )
  } catch (error) {
    console.error("Dashboard layout error:", error)
    redirect("/auth")
  }
}
