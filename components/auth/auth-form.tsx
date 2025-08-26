"use client"

import type React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { toast } from "@/hooks/use-toast"
import { Loader2, Eye, EyeOff, Mail, AlertCircle, GraduationCap, Sparkles, ArrowRight, ArrowLeft } from "lucide-react"
import { signIn, signUp } from "@/lib/auth-client"

import { ForgotPasswordForm } from "./forgot-password-form"

interface AuthFormProps {
  mode?: "signin" | "signup"
}

export function AuthForm({ mode = "signin" }: AuthFormProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [formMode, setFormMode] = useState(mode)
  const [emailSent, setEmailSent] = useState(false)
  const [showForgotPassword, setShowForgotPassword] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsLoading(true)

    const formData = new FormData(e.currentTarget)
    const email = formData.get("email") as string
    const password = formData.get("password") as string
    const name = formData.get("name") as string

    console.log("Form submission:", { formMode, email, name, selectedRole })

    try {
      if (formMode === "signup") {
        console.log("Attempting to sign up user...")
        console.log("Signup data:", { email, password, name })
        
        const { data, error } = await signUp.email({
          email,
          password,
          name,
        })

        console.log("Signup response:", { data, error })
        console.log("Error details:", error ? {
          code: error.code,
          message: error.message,
          status: error.status,
          statusText: error.statusText
        } : "No error")

        if (error) {
          console.error("Signup error:", error)
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

        console.log("Signup successful, showing email verification message")
        
        // Show email verification message
        setEmailSent(true)
        toast({
          title: "Account created!",
          description: "Please check your email to verify your account before signing in.",
        })
        return
      } else {
        console.log("Attempting to sign in user...")
        
        const { data, error } = await signIn.email({
          email,
          password,
        })

        console.log("Signin response:", { data, error })

        if (error) {
          console.error("Signin error:", error)
          let errorMessage = "Failed to sign in"
          
          // Provide more specific error messages
          if (error.message?.includes("credentials") || error.message?.includes("invalid")) {
            errorMessage = "Invalid email or password. Please check your credentials and try again."
          } else if (error.message?.includes("not found") || error.message?.includes("user")) {
            errorMessage = "No account found with this email. Please check your email or create a new account."
          } else if (error.message?.includes("email verification")) {
            errorMessage = "Please verify your email address before signing in. Check your inbox for a verification link."
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

        console.log("Signin successful, redirecting to dashboard")
        
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

  // Show forgot password form
  if (showForgotPassword) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4 relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-br from-orange-500/20 via-amber-500/15 to-red-500/10 rounded-full blur-3xl"></div>
          <div className="absolute top-20 right-20 w-48 h-48 bg-gradient-to-br from-orange-400/15 to-amber-400/10 rounded-full blur-2xl"></div>
        </div>
        
        <div className="relative z-10 w-full max-w-md">
          <ForgotPasswordForm onBack={() => setShowForgotPassword(false)} />
        </div>
      </div>
    )
  }

  // Show email verification message after signup
  if (emailSent) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4 relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-br from-green-500/20 via-emerald-500/15 to-teal-500/10 rounded-full blur-3xl"></div>
          <div className="absolute top-20 right-20 w-48 h-48 bg-gradient-to-br from-green-400/15 to-emerald-400/10 rounded-full blur-2xl"></div>
        </div>
        
        <div className="relative z-10 w-full max-w-md">
          <Card className="bg-gray-800/50 backdrop-blur-sm border-gray-700/50 shadow-2xl">
            <CardHeader className="text-center pb-6">
              <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-green-500/20 border border-green-500/30">
                <Mail className="h-8 w-8 text-green-400" />
              </div>
              <CardTitle className="text-2xl font-bold text-white font-poppins">Check Your Email</CardTitle>
              <CardDescription className="text-gray-300">
                We've sent you a verification link to complete your registration.
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <div className="mb-6 rounded-lg bg-green-500/10 border border-green-500/20 p-4">
                <div className="flex items-center space-x-2 text-green-400">
                  <AlertCircle className="h-4 w-4" />
                  <span className="text-sm font-medium">
                    Please verify your email before signing in.
                  </span>
                </div>
              </div>
              <Button
                onClick={() => {
                  setEmailSent(false)
                  setFormMode("signin")
                }}
                className="w-full bg-orange-500 hover:bg-orange-600 text-white border-0 group"
              >
                <ArrowLeft className="mr-2 h-4 w-4 group-hover:-translate-x-1 transition-transform" />
                Back to Sign In
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }



  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-to-br from-orange-500/30 via-amber-500/20 to-red-500/10 rounded-full blur-3xl"></div>
        <div className="absolute top-20 right-20 w-64 h-64 bg-gradient-to-br from-orange-400/20 to-amber-400/10 rounded-full blur-2xl"></div>
        <div className="absolute bottom-20 left-20 w-48 h-48 bg-gradient-to-tr from-amber-400/15 to-orange-400/10 rounded-full blur-2xl"></div>
      </div>

      <div className="relative z-10 w-full max-w-md">
        <Card className="bg-gray-800/50 backdrop-blur-sm border-gray-700/50 shadow-2xl">
          <CardHeader className="text-center pb-6">
            {/* Logo/Brand */}
            <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-orange-500 to-amber-500 shadow-lg">
              <Sparkles className="h-8 w-8 text-white" />
            </div>
            
            <CardTitle className="text-3xl font-bold text-white font-poppins mb-2">
              MindFlow
            </CardTitle>
            
            <CardDescription className="text-gray-300 text-lg">
              {formMode === "signin" ? "Welcome back to your learning journey" : "Start your learning journey today"}
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            <form onSubmit={handleSubmit} className="space-y-5">
              {formMode === "signup" && (
                <>
                  <div className="space-y-3">
                    <Label htmlFor="name" className="text-sm font-medium text-gray-200">
                      Full Name
                    </Label>
                    <Input
                      id="name"
                      name="name"
                      type="text"
                      placeholder="Enter your full name"
                      required
                      disabled={isLoading}
                      className="bg-gray-700/50 border-gray-600 text-white placeholder:text-gray-400 focus:border-orange-500 focus:ring-orange-500/20 h-12"
                    />
                  </div>

                  {/* Role is automatically set to STUDENT by default */}
                  <div className="flex items-center space-x-2 p-3 rounded-lg bg-blue-500/10 border border-blue-500/20">
                    <div className="flex items-center space-x-2 text-blue-400">
                      <GraduationCap className="h-4 w-4" />
                      <span className="text-sm font-medium">Student Account</span>
                    </div>
                    <Badge variant="secondary" className="ml-auto bg-blue-500/20 text-blue-400 border-blue-500/30">
                      Access courses and track your progress
                    </Badge>
                  </div>
                </>
              )}

              <div className="space-y-3">
                <Label htmlFor="email" className="text-sm font-medium text-gray-200">
                  Email Address
                </Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="Enter your email"
                  required
                  disabled={isLoading}
                  className="bg-gray-700/50 border-gray-600 text-white placeholder:text-gray-400 focus:border-orange-500 focus:ring-orange-500/20 h-12"
                />
              </div>

              <div className="space-y-3">
                <Label htmlFor="password" className="text-sm font-medium text-gray-200">
                  Password
                </Label>
                <div className="relative">
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    required
                    disabled={isLoading}
                    minLength={8}
                    className="bg-gray-700/50 border-gray-600 text-white placeholder:text-gray-400 focus:border-orange-500 focus:ring-orange-500/20 h-12 pr-12"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent text-gray-400 hover:text-white"
                    onClick={() => setShowPassword(!showPassword)}
                    disabled={isLoading}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
                <p className="text-xs text-gray-400">
                  Password must be at least 8 characters long
                </p>
              </div>

              <Button 
                type="submit" 
                className="w-full h-12 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white border-0 font-semibold text-lg shadow-lg hover:shadow-xl transition-all duration-200 group" 
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    {formMode === "signin" ? "Signing in..." : "Creating account..."}
                  </>
                ) : (
                  <>
                    {formMode === "signin" ? "Sign In" : "Create Account"}
                    <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </Button>

              {isLoading && (
                <p className="text-xs text-gray-400 text-center mt-3">
                  Please wait while we {formMode === "signin" ? "sign you in" : "create your account"}...
                </p>
              )}
            </form>

            {/* Forgot Password Link - Only show on signin */}
            {formMode === "signin" && (
              <div className="text-center">
                <button
                  type="button"
                  onClick={() => setShowForgotPassword(true)}
                  className="text-sm text-orange-400 hover:text-orange-300 hover:underline transition-colors"
                  disabled={isLoading}
                >
                  Forgot your password?
                </button>
              </div>
            )}

            <Separator className="bg-gray-600" />

            <div className="text-center">
              {formMode === "signin" ? (
                <div className="space-y-2">
                  <p className="text-sm text-gray-400">
                    Don't have an account?
                  </p>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setFormMode("signup")}
                    className="w-full border-gray-600 text-gray-300 hover:bg-gray-700 hover:text-white hover:border-gray-500"
                    disabled={isLoading}
                  >
                    Create Account
                  </Button>
                </div>
              ) : (
                <div className="space-y-2">
                  <p className="text-sm text-gray-400">
                    Already have an account?
                  </p>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setFormMode("signin")}
                    className="w-full border-gray-600 text-gray-300 hover:bg-gray-700 hover:text-white hover:border-gray-500"
                    disabled={isLoading}
                  >
                    Sign In
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
