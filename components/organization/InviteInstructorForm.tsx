"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { authClient } from "@/lib/auth-client";

interface InviteInstructorFormProps {
  organizationId: string;
  onSuccess?: () => void;
}

export function InviteInstructorForm({ organizationId, onSuccess }: InviteInstructorFormProps) {
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("instructor");
  const [department, setDepartment] = useState("");
  const [teamId, setTeamId] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    setSuccess("");

    try {
      // Send invitation using Better Auth
      const { data, error } = await authClient.organization.invite({
        organizationId,
        email,
        role,
        additionalFields: {
          department,
          teamId: teamId || undefined,
          expiresIn: 7, // 7 days
        },
      });

      if (error) {
        setError(error.message);
      } else {
        setSuccess(`Invitation sent to ${email}`);
        setEmail("");
        setDepartment("");
        setTeamId("");
        onSuccess?.();
      }
    } catch (err) {
      setError("An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>Invite Instructor</CardTitle>
        <CardDescription>
          Send an invitation to join your school organization
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email Address *</Label>
            <Input
              id="email"
              type="email"
              placeholder="instructor@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={isLoading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="role">Role *</Label>
            <Select value={role} onValueChange={setRole}>
              <SelectTrigger>
                <SelectValue placeholder="Select role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="leadInstructor">Lead Instructor</SelectItem>
                <SelectItem value="instructor">Instructor</SelectItem>
                <SelectItem value="student">Student</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="department">Department</Label>
            <Input
              id="department"
              placeholder="e.g., Science, Math, English"
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
              disabled={isLoading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="teamId">Assign to Team (Optional)</Label>
            <Input
              id="teamId"
              placeholder="Team ID or leave empty for general"
              value={teamId}
              onChange={(e) => setTeamId(e.target.value)}
              disabled={isLoading}
            />
          </div>

          {error && (
            <div className="text-sm text-red-600 bg-red-50 p-3 rounded-md">
              {error}
            </div>
          )}

          {success && (
            <div className="text-sm text-green-600 bg-green-50 p-3 rounded-md">
              {success}
            </div>
          )}

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? "Sending..." : "Send Invitation"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
