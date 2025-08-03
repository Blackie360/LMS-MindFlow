import type React from "react"
import { redirect } from "next/navigation"
import { getCurrentUser } from "@/lib/session"
import { Navbar } from "@/components/layout/navbar"

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const user = await getCurrentUser()

  if (!user) {
    redirect("/auth")
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar user={user} />
      <main className="container mx-auto px-4 py-8">{children}</main>
    </div>
  )
}
