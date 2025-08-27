"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { toast } from "@/hooks/use-toast"
import { Loader2, Mail, Shield, GraduationCap, BookOpen } from "lucide-react"

interface Invitation {
  email: string
  role: string
  course?: {
    title: string
  }
  invitedBy?: {
    name: string
    email: string
  }
  expiresAt: string
}

export default function AcceptInvitationPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const token = searchParams.get("token")
  
  const [invitation, setInvitation] = useState<Invitation | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    password: "",
    confirmPassword: ""
  })

  useEffect(() => {
    if (token) {
      fetchInvitation()
    } else {
      setIsLoading(false)
    }
  }, [token])

  const fetchInvitation = async () => {
    try {
      const response = await fetch(`/api/invites/accept?token=${token}`)
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to fetch invitation")
      }

      setInvitation(data.invitation)
    } catch (error) {
      console.error("Error fetching invitation:", error)
      toast({
        title: "Invalid invitation",
        description: error instanceof Error ? error.message : "This invitation link is invalid or has expired",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (formData.password !== formData.confirmPassword) {
      toast({
        title: "Passwords don't match",
        description: "Please make sure both passwords are identical",
        variant: "destructive",
      })
      return
    }

    if (formData.password.length < 8) {
      toast({
        title: "Password too short",
        description: "Password must be at least 8 characters long",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)

    try {
      const response = await fetch("/api/invites/accept", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          token,
          name: formData.name,
          password: formData.password,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to accept invitation")
      }

      toast({
        title: "Account created successfully!",
        description: "Welcome to MindFlow! Redirecting you to your dashboard.",
      })

      // Redirect to dashboard
      setTimeout(() => {
        router.push("/dashboard")
      }, 2000)

    } catch (error) {
      console.error("Error accepting invitation:", error)
      toast({
        title: "Failed to create account",
        description: error instanceof Error ? error.message : "Something went wrong",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const getRoleIcon = (role: string) => {
    switch (role) {
      case "ADMIN":
        return <Shield className="h-5 w-5 text-red-500" />
      case "INSTRUCTOR":
        return <GraduationCap className="h-5 w-5 text-blue-500" />
      default:
        return <BookOpen className="h-5 w-5 text-green-500" />
    }
  }

  const getRoleDescription = (role: string) => {
    switch (role) {
      case "ADMIN":
        return "Administrative access to manage the platform"
      case "INSTRUCTOR":
        return "Create and manage courses, view student progress"
      default:
        return "Access courses and track your learning progress"
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-orange-500" />
          <p className="text-white">Loading invitation...</p>
        </div>
      </div>
    )
  }

  if (!invitation) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
        <Card className="w-full max-w-md bg-gray-800/50 backdrop-blur-sm border-gray-700/50">
          <CardHeader className="text-center">
            <CardTitle className="text-white">Invalid Invitation</CardTitle>
            <CardDescription className="text-gray-300">
              This invitation link is invalid or has expired.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <Button onClick={() => router.push("/auth")}>
              Go to Sign In
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-to-br from-orange-500/30 via-amber-500/20 to-red-500/10 rounded-full blur-3xl"></div>
        <div className="absolute top-20 right-20 w-64 h-64 bg-gradient-to-br from-orange-400/20 to-amber-400/10 rounded-full blur-2xl"></div>
      </div>

      <div className="relative z-10 w-full max-w-md">
        <Card className="bg-gray-800/50 backdrop-blur-sm border-gray-700/50 shadow-2xl">
          <CardHeader className="text-center pb-6">
            <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-orange-500 to-amber-500 shadow-lg">
              <Mail className="h-8 w-8 text-white" />
            </div>
            
            <CardTitle className="text-2xl font-bold text-white font-poppins mb-2">
              Accept Invitation
            </CardTitle>
            
            <CardDescription className="text-gray-300 text-lg">
              Complete your account setup
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Invitation Details */}
            <div className="p-4 rounded-lg bg-blue-500/10 border border-blue-500/20">
              <div className="flex items-center space-x-2 mb-3">
                {getRoleIcon(invitation.role)}
                <span className="text-sm font-medium text-blue-400">
                  {invitation.role} Account
                </span>
              </div>
              <p className="text-sm text-blue-300 mb-2">
                {getRoleDescription(invitation.role)}
              </p>
              {invitation.course && (
                <p className="text-sm text-blue-300">
                  <strong>Course:</strong> {invitation.course.title}
                </p>
              )}
              {invitation.invitedBy && (
                <p className="text-sm text-blue-300">
                  <strong>Invited by:</strong> {invitation.invitedBy.name || invitation.invitedBy.email}
                </p>
              )}
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium text-gray-200">
                  Email Address
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={invitation.email}
                  disabled
                  className="bg-gray-700/50 border-gray-600 text-gray-300"
                />
                <p className="text-xs text-gray-400">
                  This email is associated with your invitation
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="name" className="text-sm font-medium text-gray-200">
                  Full Name
                </Label>
                <Input
                  id="name"
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Enter your full name"
                  required
                  disabled={isSubmitting}
                  className="bg-gray-700/50 border-gray-600 text-white placeholder:text-gray-400 focus:border-orange-500 focus:ring-orange-500/20"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm font-medium text-gray-200">
                  Password
                </Label>
                <Input
                  id="password"
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  placeholder="Create a password"
                  required
                  minLength={8}
                  disabled={isSubmitting}
                  className="bg-gray-700/50 border-gray-600 text-white placeholder:text-gray-400 focus:border-orange-500 focus:ring-orange-500/20"
                />
                <p className="text-xs text-gray-400">
                  Password must be at least 8 characters long
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="text-sm font-medium text-gray-200">
                  Confirm Password
                </Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                  placeholder="Confirm your password"
                  required
                  disabled={isSubmitting}
                  className="bg-gray-700/50 border-gray-600 text-white placeholder:text-gray-400 focus:border-orange-500 focus:ring-orange-500/20"
                />
              </div>

              <Button 
                type="submit" 
                className="w-full h-12 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white border-0 font-semibold text-lg shadow-lg hover:shadow-xl transition-all duration-200" 
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Creating Account...
                  </>
                ) : (
                  "Create Account"
                )}
              </Button>
            </form>

            <div className="text-center text-xs text-gray-400">
              <p>By creating an account, you agree to our terms of service and privacy policy.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
