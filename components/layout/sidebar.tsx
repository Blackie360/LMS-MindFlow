"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { BookOpen, GraduationCap, LayoutDashboard, Settings, Users, LogOut, Menu, X, BarChart3 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { getUserAvatar } from "@/lib/avatar-utils"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { useAuth } from "@/components/auth/auth-provider"
import { toast } from "@/hooks/use-toast"
interface Profile {
  id: string
  name?: string | null
  email: string
  role: "STUDENT" | "INSTRUCTOR"
  image?: string | null
}

interface SidebarProps {
  user: Profile
}

export function Sidebar({ user }: SidebarProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isSigningOut, setIsSigningOut] = useState(false)
  const pathname = usePathname()
  const { signOut } = useAuth()

  const handleSignOut = async () => {
    setIsSigningOut(true)

    try {
      await signOut()

      toast({
        title: "Signed Out Successfully",
        description: "You have been securely signed out of your account.",
      })
    } catch (error) {
      console.error("Sign out error:", error)
      toast({
        title: "Sign Out Error",
        description: "There was an issue signing you out. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSigningOut(false)
    }
  }

  const adminNavItems = [
    { href: "/admin", label: "Dashboard", icon: LayoutDashboard, section: "dashboard" },
    { href: "/admin/courses", label: "Courses", icon: BookOpen, section: "courses" },
    { href: "/admin/students", label: "Students", icon: Users, section: "students" },
    { href: "/admin/analytics", label: "Analytics", icon: BarChart3, section: "analytics" },
    { href: "/admin/settings", label: "Settings", icon: Settings, section: "settings" },
  ]

  const studentNavItems = [
    { href: "/student", label: "Dashboard", icon: LayoutDashboard, section: "dashboard" },
    { href: "/courses", label: "Browse Courses", icon: BookOpen, section: "courses" },
    { href: "/my-courses", label: "My Courses", icon: GraduationCap, section: "my-courses" },
    { href: "/settings", label: "Settings", icon: Settings, section: "settings" },
  ]

  const navItems = user.role === "INSTRUCTOR" ? adminNavItems : studentNavItems

  return (
    <>
      {/* Mobile menu button */}
      <Button
        variant="ghost"
        size="icon"
        className="fixed top-4 left-4 z-50 md:hidden min-h-[44px] min-w-[44px] touch-manipulation"
        onClick={() => setIsOpen(!isOpen)}
        aria-label={isOpen ? "Close navigation menu" : "Open navigation menu"}
        aria-expanded={isOpen}
        aria-controls="sidebar-navigation"
      >
        {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
      </Button>

      {/* Sidebar */}
      <div
        id="sidebar-navigation"
        className={`
        fixed inset-y-0 left-0 z-40 w-64 bg-white border-r border-gray-200 transform transition-transform duration-300 ease-in-out
        ${isOpen ? "translate-x-0" : "-translate-x-full"}
        md:translate-x-0 md:static md:inset-0
      `}
        role="navigation"
        aria-label="Main navigation"
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-center h-16 px-4 border-b border-gray-200">
            <h1 className="text-xl font-bold text-gray-900">LMS Platform</h1>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-2" role="navigation" aria-label="Dashboard navigation">
            {navItems.map((item) => {
              const Icon = item.icon
              // Enhanced active detection - exact match or section match
              const isExactMatch = pathname === item.href
              const isSectionMatch = pathname.startsWith(item.href + "/") && item.href !== "/"
              const isActive = isExactMatch || isSectionMatch

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`
                    flex items-center px-3 py-3 text-sm font-medium rounded-md transition-colors
                    min-h-[44px] touch-manipulation
                    focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2
                    ${isActive 
                      ? "bg-primary/10 text-primary border-r-2 border-primary" 
                      : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                    }
                  `}
                  onClick={() => setIsOpen(false)}
                  aria-current={isActive ? "page" : undefined}
                >
                  <Icon className={`w-5 h-5 mr-3 flex-shrink-0 ${isActive ? "text-primary" : ""}`} />
                  <span className="truncate">{item.label}</span>
                  {isActive && (
                    <div className="ml-auto w-2 h-2 bg-primary rounded-full" />
                  )}
                </Link>
              )
            })}
          </nav>

          {/* User profile */}
          <div className="p-4 border-t border-gray-200">
            <div className="flex items-center space-x-3 mb-3">
              <Avatar>
                <AvatarImage src={getUserAvatar(user)} />
                <AvatarFallback>
                  {user.name?.charAt(0)?.toUpperCase() || user.email.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">{user.name || user.email}</p>
                <p className="text-xs text-gray-500 capitalize">{user.role.toLowerCase()}</p>
              </div>
            </div>

            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50 min-h-[44px] touch-manipulation"
                  disabled={isSigningOut}
                  aria-label="Sign out of your account"
                >
                  <LogOut className="w-4 h-4 mr-2 flex-shrink-0" />
                  <span className="truncate">{isSigningOut ? "Signing out..." : "Sign Out"}</span>
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Sign Out Confirmation</AlertDialogTitle>
                  <AlertDialogDescription>
                    Are you sure you want to sign out? You will need to sign in again to access your account. All your
                    progress will be saved securely.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleSignOut}
                    disabled={isSigningOut}
                    className="bg-red-600 hover:bg-red-700"
                  >
                    {isSigningOut ? "Signing Out..." : "Sign Out"}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>
      </div>

      {/* Overlay for mobile */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-30 bg-black bg-opacity-50 md:hidden" 
          onClick={() => setIsOpen(false)}
          onKeyDown={(e) => {
            if (e.key === "Escape") {
              setIsOpen(false)
            }
          }}
          role="button"
          tabIndex={0}
          aria-label="Close navigation menu"
        />
      )}
    </>
  )
}
