"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { toast } from "@/hooks/use-toast"
import { Loader2, Mail, UserPlus } from "lucide-react"

interface InvitationFormProps {
  userRole: "ADMIN" | "INSTRUCTOR"
  courseId?: string
  courseTitle?: string
}

export function InvitationForm({ userRole, courseId, courseTitle }: InvitationFormProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [email, setEmail] = useState("")
  const [role, setRole] = useState<string>("")
  const [invitedBy, setInvitedBy] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const response = await fetch("/api/invites", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: email.trim().toLowerCase(),
          role: role || undefined,
          courseId: courseId || undefined,
          invitedBy: invitedBy.trim() || undefined,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to send invitation")
      }

      toast({
        title: "Invitation sent!",
        description: data.message,
      })

      // Reset form
      setEmail("")
      setRole("")
      setInvitedBy("")
    } catch (error) {
      console.error("Error sending invitation:", error)
      toast({
        title: "Failed to send invitation",
        description: error instanceof Error ? error.message : "Something went wrong",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const canInviteToRole = (targetRole: string) => {
    if (userRole === "ADMIN") return true
    if (userRole === "INSTRUCTOR" && targetRole === "INSTRUCTOR") return true
    return false
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <UserPlus className="h-5 w-5" />
          Send Invitation
        </CardTitle>
        <CardDescription>
          {courseId 
            ? `Invite someone to join "${courseTitle}"`
            : "Invite someone to join MindFlow"
          }
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email Address</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter email address"
              required
              disabled={isLoading}
            />
          </div>

          {!courseId && (
            <div className="space-y-2">
              <Label htmlFor="role">Role (Optional)</Label>
              <Select value={role} onValueChange={setRole}>
                <SelectTrigger>
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Student (Default)</SelectItem>
                  {canInviteToRole("INSTRUCTOR") && (
                    <SelectItem value="INSTRUCTOR">Instructor</SelectItem>
                  )}
                  {canInviteToRole("ADMIN") && (
                    <SelectItem value="ADMIN">Admin</SelectItem>
                  )}
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="invitedBy">Invited By (Optional)</Label>
            <Input
              id="invitedBy"
              type="text"
              value={invitedBy}
              onChange={(e) => setInvitedBy(e.target.value)}
              placeholder="Your name or title"
              disabled={isLoading}
            />
          </div>

          <Button 
            type="submit" 
            className="w-full" 
            disabled={isLoading || !email.trim()}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Sending...
              </>
            ) : (
              <>
                <Mail className="mr-2 h-4 w-4" />
                Send Invitation
              </>
            )}
          </Button>
        </form>

        <div className="mt-4 text-xs text-gray-500">
          <p>• Invitations expire in 7 days</p>
          <p>• Users will receive an email with instructions</p>
          {courseId && (
            <p>• Students will be automatically enrolled upon acceptance</p>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
