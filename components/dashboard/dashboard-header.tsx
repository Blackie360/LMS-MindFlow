"use client"

import { BreadcrumbNavigation } from "./breadcrumb-navigation"
import { QuickNavigation } from "./quick-navigation"
import { KeyboardShortcutsHelp } from "./keyboard-shortcuts-help"
import { type UserRole } from "@/lib/navigation-utils"

interface DashboardHeaderProps {
  userRole: UserRole
  title?: string
  description?: string
  children?: React.ReactNode
}

export function DashboardHeader({ 
  userRole, 
  title, 
  description, 
  children 
}: DashboardHeaderProps) {
  return (
    <div className="space-y-4 mb-6">
      {/* Top bar with breadcrumbs and quick nav */}
      <div className="flex items-center justify-between">
        <BreadcrumbNavigation userRole={userRole} />
        <div className="flex items-center gap-2">
          <KeyboardShortcutsHelp userRole={userRole} />
          <QuickNavigation userRole={userRole} />
        </div>
      </div>

      {/* Page title and description */}
      {(title || description) && (
        <div className="flex flex-col space-y-2">
          {title && (
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold tracking-tight">
              {title}
            </h1>
          )}
          {description && (
            <p className="text-sm sm:text-base text-muted-foreground">
              {description}
            </p>
          )}
        </div>
      )}

      {/* Additional header content */}
      {children}
    </div>
  )
}