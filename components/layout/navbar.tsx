"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { signOut, useSession } from "@/lib/auth-client"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/use-toast"
import { BookOpen, LogOut, User } from "lucide-react"
import { APP_CONFIG, ROUTES } from "@/lib/constants"

export function Navbar() {
  const { data: session } = useSession()
  const router = useRouter()
  const { toast } = useToast()

  const handleSignOut = async () => {
    try {
      await signOut()
      toast({
        title: "Signed out",
        description: "You have been signed out successfully.",
      })
      router.push("/auth")
      router.refresh()
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to sign out. Please try again.",
        variant: "destructive",
      })
    }
  }

  return (
    <nav className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link href={ROUTES.DASHBOARD} className="flex items-center space-x-2">
              <BookOpen className="h-6 w-6 text-primary" />
              <span className="text-xl font-bold">{APP_CONFIG.name}</span>
            </Link>

            {session?.user && (
              <div className="hidden md:flex items-center space-x-4 ml-8">
                <Link
                  href={ROUTES.DASHBOARD}
                  className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                >
                  Dashboard
                </Link>

                {session.user.role === "STUDENT" ? (
                  <>
                    <Link
                      href={ROUTES.COURSES}
                      className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                    >
                      Browse Courses
                    </Link>
                    <Link
                      href={ROUTES.MY_COURSES}
                      className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                    >
                      My Courses
                    </Link>
                  </>
                ) : (
                  <>
                    <Link
                      href={ROUTES.INSTRUCTOR.COURSES}
                      className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                    >
                      My Courses
                    </Link>
                    <Link
                      href={ROUTES.INSTRUCTOR.STUDENTS}
                      className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                    >
                      Students
                    </Link>
                  </>
                )}
              </div>
            )}
          </div>

          <div className="flex items-center space-x-4">
            {session?.user ? (
              <>
                <div className="flex items-center space-x-2 text-sm">
                  <User className="h-4 w-4" />
                  <span className="hidden sm:inline">{session.user.name}</span>
                  <span className="text-xs text-muted-foreground capitalize">({session.user.role?.toLowerCase()})</span>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleSignOut}
                  className="text-muted-foreground hover:text-foreground"
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  Sign Out
                </Button>
              </>
            ) : (
              <Button asChild>
                <Link href="/auth">Sign In</Link>
              </Button>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}
