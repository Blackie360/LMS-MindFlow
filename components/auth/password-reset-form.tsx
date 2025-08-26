"use client"

import type React from "react"
import { useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { toast } from "@/hooks/use-toast"
import { Loader2, Eye, EyeOff, Lock, CheckCircle } from "lucide-react"
import { authClient } from "@/lib/auth-client"

export function PasswordResetForm() {
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [resetSuccess, setResetSuccess] = useState(false)
  const router = useRouter()
  const searchParams = useSearchParams()
  const token = searchParams.get("token")

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    
    if (password !== confirmPassword) {
      toast({
        title: "Passwords don't match",
        description: "Please make sure both passwords are identical.",
        variant: "destructive",
      })
      return
    }

    if (password.length < 8) {
      toast({
        title: "Password too short",
        description: "Password must be at least 8 characters long.",
        variant: "destructive",
      })
      return
    }

    if (!token) {
      toast({
        title: "Invalid reset link",
        description: "Please use the link from your email to reset your password.",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)

    try {
      const { data, error } = await authClient.resetPassword({
        newPassword: password,
        token,
      })

      if (error) {
        let errorMessage = "Failed to reset password"
        
        if (error.message?.includes("invalid") || error.message?.includes("expired")) {
          errorMessage = "This reset link is invalid or has expired. Please request a new one."
        } else if (error.message?.includes("network") || error.message?.includes("fetch")) {
          errorMessage = "Network error. Please check your connection and try again."
        } else if (error.message) {
          errorMessage = error.message
        }

        toast({
          title: "Password Reset Failed",
          description: errorMessage,
          variant: "destructive",
        })
        return
      }

      setResetSuccess(true)
      toast({
        title: "Password reset successfully!",
        description: "You can now sign in with your new password.",
      })
    } catch (error) {
      console.error("Password reset error:", error)
      
      let errorMessage = "Something went wrong. Please try again."
      
      if (error instanceof Error) {
        if (error.message?.includes("network") || error.message?.includes("fetch")) {
          errorMessage = "Network error. Please check your internet connection and try again."
        } else if (error.message?.includes("timeout")) {
          errorMessage = "Request timed out. Please try again."
        }
      }

      toast({
        title: "Password Reset Error",
        description: errorMessage,
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleRequestReset = async () => {
    setIsLoading(true)
    
    try {
      const { data, error } = await authClient.requestPasswordReset({
        email: "", // This would need to be collected from user
        redirectTo: `${window.location.origin}/auth/reset-password`,
      })

      if (error) {
        toast({
          title: "Request Failed",
          description: "Failed to send password reset email. Please try again.",
          variant: "destructive",
        })
        return
      }

      toast({
        title: "Reset email sent",
        description: "Check your email for password reset instructions.",
      })
    } catch (error) {
      toast({
        title: "Request Failed",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Show success message after password reset
  if (resetSuccess) {
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
                <CheckCircle className="h-8 w-8 text-green-400" />
              </div>
              <CardTitle className="text-2xl font-bold text-white font-poppins">Password Reset Successfully</CardTitle>
              <CardDescription className="text-gray-300">
                Your password has been updated. You can now sign in with your new password.
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <Button
                onClick={() => router.push("/auth")}
                className="w-full bg-orange-500 hover:bg-orange-600 text-white border-0"
              >
                Go to Sign In
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  // Show error if no token
  if (!token) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4 relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-br from-red-500/20 via-pink-500/15 to-rose-500/10 rounded-full blur-3xl"></div>
          <div className="absolute top-20 right-20 w-48 h-48 bg-gradient-to-br from-red-400/15 to-pink-400/10 rounded-full blur-2xl"></div>
        </div>
        
        <div className="relative z-10 w-full max-w-md">
          <Card className="bg-gray-800/50 backdrop-blur-sm border-gray-700/50 shadow-2xl">
            <CardHeader className="text-center pb-6">
              <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-red-500/20 border border-red-500/30">
                <Lock className="h-8 w-8 text-red-400" />
              </div>
              <CardTitle className="text-2xl font-bold text-white font-poppins">Invalid Reset Link</CardTitle>
              <CardDescription className="text-gray-300">
                This password reset link is invalid or has expired.
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center space-y-4">
              <Button
                onClick={() => router.push("/auth")}
                variant="outline"
                className="w-full border-gray-600 text-gray-300 hover:bg-gray-700 hover:text-white hover:border-gray-500"
              >
                Back to Sign In
              </Button>
              <Button
                onClick={handleRequestReset}
                className="w-full bg-orange-500 hover:bg-orange-600 text-white border-0"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Sending...
                  </>
                ) : (
                  "Request New Reset Link"
                )}
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
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-br from-orange-500/20 via-amber-500/15 to-red-500/10 rounded-full blur-3xl"></div>
        <div className="absolute top-20 right-20 w-48 h-48 bg-gradient-to-br from-orange-400/15 to-amber-400/10 rounded-full blur-2xl"></div>
      </div>
      
      <div className="relative z-10 w-full max-w-md">
        <Card className="bg-gray-800/50 backdrop-blur-sm border-gray-700/50 shadow-2xl">
          <CardHeader className="text-center pb-6">
            <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-orange-500 to-amber-500 shadow-lg">
              <Lock className="h-8 w-8 text-white" />
            </div>
            <CardTitle className="text-2xl font-bold text-white font-poppins">Reset Your Password</CardTitle>
            <CardDescription className="text-gray-300">
              Enter your new password below
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-3">
                <Label htmlFor="password" className="text-sm font-medium text-gray-200">
                  New Password
                </Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your new password"
                    required
                    disabled={isLoading}
                    minLength={8}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
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

              <div className="space-y-3">
                <Label htmlFor="confirmPassword" className="text-sm font-medium text-gray-200">
                  Confirm New Password
                </Label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Confirm your new password"
                    required
                    disabled={isLoading}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="bg-gray-700/50 border-gray-600 text-white placeholder:text-gray-400 focus:border-orange-500 focus:ring-orange-500/20 h-12 pr-12"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent text-gray-400 hover:text-white"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    disabled={isLoading}
                  >
                    {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
              </div>

              <Button 
                type="submit" 
                className="w-full h-12 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white border-0 font-semibold text-lg shadow-lg hover:shadow-xl transition-all duration-200" 
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Resetting Password...
                  </>
                ) : (
                  "Reset Password"
                )}
              </Button>

              {isLoading && (
                <p className="text-xs text-gray-400 text-center mt-3">
                  Please wait while we reset your password...
                </p>
              )}
            </form>

            <div className="mt-6 text-center">
              <Button
                onClick={() => router.push("/auth")}
                variant="ghost"
                className="text-sm text-gray-400 hover:text-white hover:bg-gray-700/50"
                disabled={isLoading}
              >
                Back to Sign In
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
