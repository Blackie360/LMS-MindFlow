"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import {
  BookOpen,
  GraduationCap,
  LayoutDashboard,
  Settings,
  Users,
  LogOut,
  Menu,
  X,
  BarChart3,
  Sparkles,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { signOut } from "@/lib/auth"
import { toast } from "@/hooks/use-toast"
import type { Profile } from "@/lib/supabase"

interface SidebarProps {
  user: Profile
}

export function Sidebar({ user }: SidebarProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isSigningOut, setIsSigningOut] = useState(false)
  const pathname = usePathname()
  const router = useRouter()

  const handleSignOut = async () => {
    setIsSigningOut(true)

    try {
      const { error } = await signOut()

      if (error) {
        toast({
          title: "Sign Out Failed",
          description: error.message,
          variant: "destructive",
        })
      } else {
        toast({
          title: "Signed Out",
          description: "You have been signed out successfully.",
        })
        router.push("/auth")
        router.refresh()
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An unexpected error occurred while signing out.",
        variant: "destructive",
      })
    } finally {
      setIsSigningOut(false)
    }
  }

  const adminNavItems = [
    { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { href: "/admin/courses", label: "Courses", icon: BookOpen },
    { href: "/admin/students", label: "Students", icon: Users },
    { href: "/admin/analytics", label: "Analytics", icon: BarChart3 },
    { href: "/admin/settings", label: "Settings", icon: Settings },
  ]

  const studentNavItems = [
    { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { href: "/courses", label: "Browse Courses", icon: BookOpen },
    { href: "/my-courses", label: "My Courses", icon: GraduationCap },
    { href: "/settings", label: "Settings", icon: Settings },
  ]

  const navItems = user.role === "admin" ? adminNavItems : studentNavItems

  return (
    <>
      {/* Mobile menu button */}
      <Button
        variant="ghost"
        size="icon"
        className="fixed top-4 left-4 z-50 md:hidden glass"
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
      </Button>

      {/* Sidebar */}
      <div
        className={`
        fixed inset-y-0 left-0 z-40 w-64 bg-sidebar border-r border-sidebar-border transform transition-transform duration-300 ease-in-out
        ${isOpen ? "translate-x-0" : "-translate-x-full"}
        md:translate-x-0 md:static md:inset-0
      `}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-center h-16 px-4 border-b border-sidebar-border bg-gradient-to-r from-sidebar-primary to-sidebar-primary/80">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-sidebar-primary-foreground rounded-lg flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-sidebar-primary" />
              </div>
              <h1 className="text-xl font-bold text-sidebar-primary-foreground">LMS Platform</h1>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-2">
            {navItems.map((item) => {
              const Icon = item.icon
              const isActive = pathname === item.href

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`sidebar-nav-item ${isActive ? "active" : ""}`}
                  onClick={() => setIsOpen(false)}
                >
                  <Icon className="w-5 h-5 mr-3" />
                  {item.label}
                </Link>
              )
            })}
          </nav>

          {/* User profile */}
          <div className="p-4 border-t border-sidebar-border bg-sidebar-accent/30">
            <div className="flex items-center space-x-3 mb-3">
              <Avatar className="ring-2 ring-sidebar-primary/20">
                <AvatarImage src={user.avatar_url || "/placeholder.svg"} />
                <AvatarFallback className="bg-sidebar-primary text-sidebar-primary-foreground">
                  {user.full_name?.charAt(0)?.toUpperCase() || user.email.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-sidebar-foreground truncate">{user.full_name || user.email}</p>
                <p className="text-xs text-sidebar-foreground/70 capitalize flex items-center">
                  {user.role === "admin" && <Sparkles className="w-3 h-3 mr-1" />}
                  {user.role}
                </p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="w-full justify-start text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
              onClick={handleSignOut}
              disabled={isSigningOut}
            >
              <LogOut className="w-4 h-4 mr-2" />
              {isSigningOut ? "Signing out..." : "Sign Out"}
            </Button>
          </div>
        </div>
      </div>

      {/* Overlay for mobile */}
      {isOpen && (
        <div className="fixed inset-0 z-30 bg-black/50 backdrop-blur-sm md:hidden" onClick={() => setIsOpen(false)} />
      )}
    </>
  )
}
