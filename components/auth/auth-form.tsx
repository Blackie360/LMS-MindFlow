"use client"

import type React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { toast } from "@/hooks/use-toast"
import { Loader2, Eye, EyeOff } from "lucide-react"
import { signIn, signUp } from "@/lib/auth-client"

interface AuthFormProps {
  mode?: "signin" | "signup"
}

export function AuthForm({ mode = "signin" }: AuthFormProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [formMode, setFormMode] = useState(mode)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsLoading(true)

    const formData = new FormData(e.currentTarget)
    const email = formData.get("email") as string
    const password = formData.get("password") as string
    const name = formData.get("name") as string

    try {
      if (formMode === "signup") {
        const { data, error } = await signUp.email({
          email,
          password,
          name,
        })

        if (error) {
          let errorMessage = "Failed to create account"
          
          // Provide more specific error messages
          if (error.message?.includes("email")) {
            errorMessage = "This email is already registered. Please use a different email or try signing in."
          } else if (error.message?.includes("password")) {
            errorMessage = "Password must be at least 8 characters long."
          } else if (error.message?.includes("network") || error.message?.includes("fetch")) {
            errorMessage = "Network error. Please check your connection and try again."
          } else if (error.message) {
            errorMessage = error.message
          }

          toast({
            title: "Registration Failed",
            description: errorMessage,
            variant: "destructive",
          })
          return
        }

        toast({
          title: "Account created!",
          description: "Welcome to MindFlow. You can now start learning.",
        })
      } else {
        const { data, error } = await signIn.email({
          email,
          password,
        })

        if (error) {
          let errorMessage = "Failed to sign in"
          
          // Provide more specific error messages
          if (error.message?.includes("credentials") || error.message?.includes("invalid")) {
            errorMessage = "Invalid email or password. Please check your credentials and try again."
          } else if (error.message?.includes("not found") || error.message?.includes("user")) {
            errorMessage = "No account found with this email. Please check your email or create a new account."
          } else if (error.message?.includes("network") || error.message?.includes("fetch")) {
            errorMessage = "Network error. Please check your connection and try again."
          } else if (error.message) {
            errorMessage = error.message
          }

          toast({
            title: "Sign In Failed",
            description: errorMessage,
            variant: "destructive",
          })
          return
        }

        toast({
          title: "Welcome back!",
          description: "You have been signed in successfully.",
        })
      }

      router.push("/dashboard")
      router.refresh()
    } catch (error) {
      console.error("Authentication error:", error)
      
      let errorMessage = "Something went wrong. Please try again."
      
      if (error instanceof Error) {
        if (error.message?.includes("network") || error.message?.includes("fetch")) {
          errorMessage = "Network error. Please check your internet connection and try again."
        } else if (error.message?.includes("timeout")) {
          errorMessage = "Request timed out. Please try again."
        }
      }

      toast({
        title: "Authentication Error",
        description: errorMessage,
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">MindFlow</CardTitle>
          <CardDescription>{formMode === "signin" ? "Sign in to your account" : "Create your account"}</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {formMode === "signup" && (
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  name="name"
                  type="text"
                  placeholder="Enter your full name"
                  required
                  disabled={isLoading}
                />
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="Enter your email"
                required
                disabled={isLoading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  required
                  disabled={isLoading}
                  minLength={8}
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
                  {formMode === "signin" ? "Signing in..." : "Creating account..."}
                </>
              ) : formMode === "signin" ? (
                "Sign In"
              ) : (
                "Create Account"
              )}
            </Button>

            {isLoading && (
              <p className="text-xs text-muted-foreground text-center mt-2">
                Please wait while we {formMode === "signin" ? "sign you in" : "create your account"}...
              </p>
            )}
          </form>

          <div className="mt-4 text-center text-sm">
            {formMode === "signin" ? (
              <>
                Don't have an account?{" "}
                <button
                  type="button"
                  onClick={() => setFormMode("signup")}
                  className="text-primary hover:underline font-medium"
                  disabled={isLoading}
                >
                  Sign up
                </button>
              </>
            ) : (
              <>
                Already have an account?{" "}
                <button
                  type="button"
                  onClick={() => setFormMode("signin")}
                  className="text-primary hover:underline font-medium"
                  disabled={isLoading}
                >
                  Sign in
                </button>
              </>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
