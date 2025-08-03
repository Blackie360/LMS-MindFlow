"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Progress } from "@/components/ui/progress"
import { signIn, signUp, checkAuthStatus } from "@/lib/auth"
import { toast } from "@/hooks/use-toast"
import { Eye, EyeOff, Loader2, CheckCircle, ArrowRight } from "lucide-react"

export function AuthForm() {
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState("")
  const [activeTab, setActiveTab] = useState("signin")
  const [authProgress, setAuthProgress] = useState(0)
  const [isRedirecting, setIsRedirecting] = useState(false)
  const router = useRouter()
  const searchParams = useSearchParams()

  // Check if user is already authenticated
  useEffect(() => {
    const checkExistingAuth = async () => {
      const { isAuthenticated } = await checkAuthStatus()
      if (isAuthenticated) {
        setIsRedirecting(true)
        router.push("/dashboard")
      }
    }

    checkExistingAuth()
  }, [router])

  // Handle redirect parameter
  useEffect(() => {
    const redirect = searchParams.get("redirect")
    if (redirect === "signup") {
      setActiveTab("signup")
    }
  }, [searchParams])

  const handleSignIn = async (formData: FormData) => {
    setIsLoading(true)
    setError("")
    setAuthProgress(0)

    const email = formData.get("email") as string
    const password = formData.get("password") as string

    if (!email || !password) {
      setError("Please fill in all fields")
      setIsLoading(false)
      return
    }

    try {
      // Progress: Starting authentication
      setAuthProgress(25)

      const { data, error } = await signIn(email, password)

      if (error) {
        console.error("Sign in error:", error)
        setError(error.message)
        toast({
          title: "Sign In Failed",
          description: error.message,
          variant: "destructive",
        })
        setAuthProgress(0)
      } else if (data.user) {
        // Progress: Authentication successful
        setAuthProgress(75)

        toast({
          title: "Welcome back! 🎉",
          description: "You have been signed in successfully.",
        })

        // Progress: Redirecting
        setAuthProgress(100)
        setIsRedirecting(true)

        // Use window.location for more reliable redirect in deployed environments
        setTimeout(() => {
          window.location.href = "/dashboard"
        }, 500)
      }
    } catch (err) {
      console.error("Unexpected error:", err)
      setError("An unexpected error occurred. Please try again.")
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      })
      setAuthProgress(0)
    } finally {
      if (!isRedirecting) {
        setIsLoading(false)
      }
    }
  }

  const handleSignUp = async (formData: FormData) => {
    setIsLoading(true)
    setError("")
    setAuthProgress(0)

    const email = formData.get("email") as string
    const password = formData.get("password") as string
    const fullName = formData.get("fullName") as string

    if (!email || !password || !fullName) {
      setError("Please fill in all fields")
      setIsLoading(false)
      return
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters long")
      setIsLoading(false)
      return
    }

    try {
      // Progress: Starting registration
      setAuthProgress(25)

      const { data, error } = await signUp(email, password, fullName)

      if (error) {
        console.error("Sign up error:", error)
        setError(error.message)
        toast({
          title: "Sign Up Failed",
          description: error.message,
          variant: "destructive",
        })
        setAuthProgress(0)
      } else if (data.user) {
        // Progress: Registration successful
        setAuthProgress(75)

        // Check if email confirmation is required
        if (!data.user.email_confirmed_at && data.user.confirmation_sent_at) {
          toast({
            title: "Account Created! 📧",
            description: "Please check your email to confirm your account, then sign in.",
          })
          setActiveTab("signin")
          setAuthProgress(100)
        } else {
          // Auto sign-in for immediate confirmation
          toast({
            title: "Welcome to LMS Platform! 🎉",
            description: "Your account has been created. Redirecting to dashboard...",
          })

          // Progress: Auto-signing in
          setAuthProgress(90)
          setIsRedirecting(true)

          // Use window.location for more reliable redirect in deployed environments
          setTimeout(() => {
            setAuthProgress(100)
            window.location.href = "/dashboard"
          }, 1000)
        }
      }
    } catch (err) {
      console.error("Unexpected error:", err)
      setError("An unexpected error occurred. Please try again.")
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      })
      setAuthProgress(0)
    } finally {
      if (!isRedirecting) {
        setIsLoading(false)
      }
    }
  }

  if (isRedirecting) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-primary/5 to-primary/10 p-4">
        <Card className="w-full max-w-md">
          <CardContent className="p-8 text-center">
            <div className="space-y-4">
              <div className="w-16 h-16 mx-auto bg-primary/10 rounded-full flex items-center justify-center">
                <CheckCircle className="w-8 h-8 text-primary" />
              </div>
              <div>
                <h3 className="text-lg font-semibold">Redirecting to Dashboard</h3>
                <p className="text-sm text-muted-foreground">Please wait while we set up your workspace...</p>
              </div>
              <Progress value={100} className="w-full" />
              <div className="flex items-center justify-center text-sm text-muted-foreground">
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Taking you to your dashboard
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-primary/5 to-primary/10 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">LMS Platform</CardTitle>
          <CardDescription>
            {activeTab === "signin"
              ? "Welcome back! Sign in to continue learning"
              : "Join thousands of learners and start your journey"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {(isLoading || authProgress > 0) && (
            <div className="mb-4 space-y-2">
              <Progress value={authProgress} className="w-full" />
              <p className="text-xs text-center text-muted-foreground">
                {authProgress < 25 && "Initializing..."}
                {authProgress >= 25 && authProgress < 75 && "Authenticating..."}
                {authProgress >= 75 && authProgress < 100 && "Setting up your account..."}
                {authProgress === 100 && "Redirecting to dashboard..."}
              </p>
            </div>
          )}

          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="signin">Sign In</TabsTrigger>
              <TabsTrigger value="signup">Sign Up</TabsTrigger>
            </TabsList>

            <TabsContent value="signin" className="space-y-4">
              <form action={handleSignIn} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="signin-email">Email</Label>
                  <Input
                    id="signin-email"
                    name="email"
                    type="email"
                    placeholder="Enter your email"
                    required
                    disabled={isLoading}
                    autoComplete="email"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signin-password">Password</Label>
                  <div className="relative">
                    <Input
                      id="signin-password"
                      name="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter your password"
                      required
                      disabled={isLoading}
                      autoComplete="current-password"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                      onClick={() => setShowPassword(!showPassword)}
                      disabled={isLoading}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Signing in...
                    </>
                  ) : (
                    <>
                      Sign In
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </>
                  )}
                </Button>
              </form>

              <div className="text-center text-sm text-muted-foreground">
                Don't have an account?{" "}
                <button
                  type="button"
                  onClick={() => setActiveTab("signup")}
                  className="text-primary hover:underline font-medium"
                  disabled={isLoading}
                >
                  Sign up here
                </button>
              </div>
            </TabsContent>

            <TabsContent value="signup" className="space-y-4">
              <form action={handleSignUp} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="signup-fullName">Full Name</Label>
                  <Input
                    id="signup-fullName"
                    name="fullName"
                    type="text"
                    placeholder="Enter your full name"
                    required
                    disabled={isLoading}
                    autoComplete="name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signup-email">Email</Label>
                  <Input
                    id="signup-email"
                    name="email"
                    type="email"
                    placeholder="Enter your email"
                    required
                    disabled={isLoading}
                    autoComplete="email"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signup-password">Password</Label>
                  <div className="relative">
                    <Input
                      id="signup-password"
                      name="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Create a password (min. 6 characters)"
                      required
                      minLength={6}
                      disabled={isLoading}
                      autoComplete="new-password"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                      onClick={() => setShowPassword(!showPassword)}
                      disabled={isLoading}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creating account...
                    </>
                  ) : (
                    <>
                      Create Account
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </>
                  )}
                </Button>
              </form>

              <div className="text-center text-sm text-muted-foreground">
                Already have an account?{" "}
                <button
                  type="button"
                  onClick={() => setActiveTab("signin")}
                  className="text-primary hover:underline font-medium"
                  disabled={isLoading}
                >
                  Sign in here
                </button>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}
