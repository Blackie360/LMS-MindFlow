"use client"

import { useState } from "react"
import { useRouter, usePathname } from "next/navigation"
import { Command, CommandDialog, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { Button } from "@/components/ui/button"
import { Search, LayoutDashboard, BookOpen, Users, BarChart3, Settings, GraduationCap } from "lucide-react"
import { useEffect } from "react"
import { getNavigationItems, isPathActive, navigateWithHistory, type UserRole } from "@/lib/navigation-utils"

interface QuickNavItem {
  id: string
  label: string
  href: string
  icon: React.ComponentType<{ className?: string }>
  keywords: string[]
  section: string
}

interface QuickNavigationProps {
  userRole: UserRole
}

export function QuickNavigation({ userRole }: QuickNavigationProps) {
  const [open, setOpen] = useState(false)
  const router = useRouter()
  const pathname = usePathname()

  // Keyboard shortcut to open quick nav
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        setOpen((open) => !open)
      }
    }

    document.addEventListener("keydown", down)
    return () => document.removeEventListener("keydown", down)
  }, [])

  const adminNavItems: QuickNavItem[] = [
    {
      id: "admin-dashboard",
      label: "Admin Dashboard",
      href: "/admin",
      icon: LayoutDashboard,
      keywords: ["dashboard", "home", "overview", "admin"],
      section: "Dashboard"
    },
    {
      id: "admin-courses",
      label: "Manage Courses",
      href: "/admin/courses",
      icon: BookOpen,
      keywords: ["courses", "manage", "create", "edit"],
      section: "Courses"
    },
    {
      id: "admin-students",
      label: "Student Management",
      href: "/admin/students",
      icon: Users,
      keywords: ["students", "users", "manage", "enrollment"],
      section: "Students"
    },
    {
      id: "admin-analytics",
      label: "Analytics & Reports",
      href: "/admin/analytics",
      icon: BarChart3,
      keywords: ["analytics", "reports", "statistics", "data"],
      section: "Analytics"
    },
    {
      id: "admin-settings",
      label: "Settings",
      href: "/admin/settings",
      icon: Settings,
      keywords: ["settings", "configuration", "preferences"],
      section: "Settings"
    }
  ]

  const studentNavItems: QuickNavItem[] = [
    {
      id: "student-dashboard",
      label: "My Dashboard",
      href: "/student",
      icon: LayoutDashboard,
      keywords: ["dashboard", "home", "overview", "progress"],
      section: "Dashboard"
    },
    {
      id: "browse-courses",
      label: "Browse Courses",
      href: "/courses",
      icon: BookOpen,
      keywords: ["courses", "browse", "catalog", "enroll"],
      section: "Courses"
    },
    {
      id: "my-courses",
      label: "My Courses",
      href: "/my-courses",
      icon: GraduationCap,
      keywords: ["my courses", "enrolled", "learning", "progress"],
      section: "Learning"
    },
    {
      id: "student-settings",
      label: "Settings",
      href: "/settings",
      icon: Settings,
      keywords: ["settings", "profile", "preferences"],
      section: "Settings"
    }
  ]

  const navItems = userRole === "INSTRUCTOR" ? adminNavItems : studentNavItems

  const handleSelect = (href: string) => {
    setOpen(false)
    navigateWithHistory(router, href)
  }

  return (
    <>
      <Button
        variant="outline"
        className="relative h-9 w-9 p-0 xl:h-10 xl:w-60 xl:justify-start xl:px-3 xl:py-2"
        onClick={() => setOpen(true)}
      >
        <Search className="h-4 w-4 xl:mr-2" />
        <span className="hidden xl:inline-flex">Quick navigation...</span>
        <kbd className="pointer-events-none absolute right-1.5 top-2 hidden h-6 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium opacity-100 xl:flex">
          <span className="text-xs">⌘</span>K
        </kbd>
      </Button>

      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput placeholder="Search navigation..." />
        <CommandList>
          <CommandEmpty>No results found.</CommandEmpty>
          
          {/* Group by sections */}
          {Object.entries(
            navItems.reduce((acc, item) => {
              if (!acc[item.section]) acc[item.section] = []
              acc[item.section].push(item)
              return acc
            }, {} as Record<string, QuickNavItem[]>)
          ).map(([section, items]) => (
            <CommandGroup key={section} heading={section}>
              {items.map((item) => {
                const Icon = item.icon
                const isActive = isPathActive(pathname, item.href)
                
                return (
                  <CommandItem
                    key={item.id}
                    value={`${item.label} ${item.keywords.join(" ")}`}
                    onSelect={() => handleSelect(item.href)}
                    className={isActive ? "bg-accent" : ""}
                  >
                    <Icon className="mr-2 h-4 w-4" />
                    <span>{item.label}</span>
                    {isActive && (
                      <div className="ml-auto h-2 w-2 bg-primary rounded-full" />
                    )}
                  </CommandItem>
                )
              })}
            </CommandGroup>
          ))}
        </CommandList>
      </CommandDialog>
    </>
  )
}