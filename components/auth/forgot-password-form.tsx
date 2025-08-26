"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { toast } from "@/hooks/use-toast"
import { Loader2, Mail, ArrowLeft, CheckCircle, ArrowRight } from "lucide-react"
import { authClient } from "@/lib/auth-client"

interface ForgotPasswordFormProps {
  onBack: () => void
}

export function ForgotPasswordForm({ onBack }: ForgotPasswordFormProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [email, setEmail] = useState("")
  const [emailSent, setEmailSent] = useState(false)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    
    if (!email) {
      toast({
        title: "Email required",
        description: "Please enter your email address.",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)

    try {
      const { data, error } = await authClient.requestPasswordReset({
        email,
        redirectTo: `${window.location.origin}/auth/reset-password`,
      })

      if (error) {
        let errorMessage = "Failed to send reset email"
        
        if (error.message?.includes("not found") || error.message?.includes("user")) {
          errorMessage = "No account found with this email address."
        } else if (error.message?.includes("network") || error.message?.includes("fetch")) {
          errorMessage = "Network error. Please check your connection and try again."
        } else if (error.message) {
          errorMessage = error.message
        }

        toast({
          title: "Request Failed",
          description: errorMessage,
          variant: "destructive",
        })
        return
      }

      setEmailSent(true)
      toast({
        title: "Reset email sent",
        description: "Check your email for password reset instructions.",
      })
    } catch (error) {
      console.error("Password reset request error:", error)
      
      let errorMessage = "Something went wrong. Please try again."
      
      if (error instanceof Error) {
        if (error.message?.includes("network") || error.message?.includes("fetch")) {
          errorMessage = "Network error. Please check your internet connection and try again."
        } else if (error.message?.includes("timeout")) {
          errorMessage = "Request timed out. Please try again."
        }
      }

      toast({
        title: "Request Failed",
        description: errorMessage,
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Show success message after email is sent
  if (emailSent) {
    return (
      <Card className="bg-gray-800/50 backdrop-blur-sm border-gray-700/50 shadow-2xl">
        <CardHeader className="text-center pb-6">
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-green-500/20 border border-green-500/30">
            <CheckCircle className="h-8 w-8 text-green-400" />
          </div>
          <CardTitle className="text-2xl font-bold text-white font-poppins">Check Your Email</CardTitle>
          <CardDescription className="text-gray-300">
            We've sent password reset instructions to {email}
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <div className="rounded-lg bg-green-500/10 border border-green-500/20 p-4">
            <p className="text-sm text-green-400">
              If you don't see the email, check your spam folder. The link will expire in 1 hour.
            </p>
          </div>
          <Button
            onClick={() => {
              setEmailSent(false)
              setEmail("")
            }}
            variant="outline"
            className="w-full border-gray-600 text-gray-300 hover:bg-gray-700 hover:text-white hover:border-gray-500"
          >
            Send Another Email
          </Button>
          <Button
            onClick={onBack}
            className="w-full bg-orange-500 hover:bg-orange-600 text-white border-0 group"
          >
            <ArrowLeft className="mr-2 h-4 w-4 group-hover:-translate-x-1 transition-transform" />
            Back to Sign In
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="bg-gray-800/50 backdrop-blur-sm border-gray-700/50 shadow-2xl">
      <CardHeader className="text-center pb-6">
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-orange-500 to-amber-500 shadow-lg">
          <Mail className="h-8 w-8 text-white" />
        </div>
        <CardTitle className="text-2xl font-bold text-white font-poppins">Forgot Password?</CardTitle>
        <CardDescription className="text-gray-300">
          Enter your email address and we'll send you a link to reset your password.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-3">
            <Label htmlFor="email" className="text-sm font-medium text-gray-200">
              Email Address
            </Label>
            <Input
              id="email"
              type="email"
              placeholder="Enter your email"
              required
              disabled={isLoading}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="bg-gray-700/50 border-gray-600 text-white placeholder:text-gray-400 focus:border-orange-500 focus:ring-orange-500/20 h-12"
            />
          </div>

          <Button 
            type="submit" 
            className="w-full h-12 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white border-0 font-semibold text-lg shadow-lg hover:shadow-xl transition-all duration-200 group" 
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Sending Reset Email...
              </>
            ) : (
              <>
                Send Reset Email
                <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </>
            )}
          </Button>

          {isLoading && (
            <p className="text-xs text-gray-400 text-center mt-3">
              Please wait while we send the reset email...
            </p>
          )}
        </form>

        <div className="mt-6 text-center">
          <Button
            onClick={onBack}
            variant="ghost"
            className="text-sm text-gray-400 hover:text-white hover:bg-gray-700/50"
            disabled={isLoading}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Sign In
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
