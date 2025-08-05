"use client"

import React from "react"
import { Sidebar } from "@/components/layout/sidebar"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import { ConnectionStatus } from "@/components/dashboard/notification-system"
import { ErrorDebugPanel, useErrorDebugPanel } from "@/components/dashboard/error-debug-panel"
import { ErrorTestComponent } from "@/components/dashboard/error-test-component"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { useKeyboardShortcuts } from "@/hooks/use-keyboard-shortcuts"
import { Suspense } from "react"

interface DashboardLayoutClientProps {
  children: React.ReactNode
  user: any
}

export function DashboardLayoutClient({ children, user }: DashboardLayoutClientProps) {
  const errorDebugPanel = useErrorDebugPanel()
  
  // Enable keyboard shortcuts for navigation
  useKeyboardShortcuts({ userRole: user.role })

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar user={user} />
      <main className="flex-1 overflow-auto md:ml-0">
        <div className="p-4 sm:p-6 md:p-8 pt-16 md:pt-6">
          <DashboardHeader userRole={user.role} />
          <Suspense fallback={<LoadingSpinner />}>
            {children}
          </Suspense>
        </div>
      </main>
      <ConnectionStatus />
      <ErrorDebugPanel 
        isOpen={errorDebugPanel.isOpen} 
        onToggle={errorDebugPanel.toggle} 
      />
      <ErrorTestComponent userId={user.id} />
    </div>
  )
}