"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

interface InviteStudentFormProps {
  organizationId: string;
  onSuccess?: () => void;
}

export function InviteStudentForm({
  organizationId,
  onSuccess,
}: InviteStudentFormProps) {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [grade, setGrade] = useState("");
  const [department, setDepartment] = useState("");
  const [teamId, setTeamId] = useState("");
  const [notes, setNotes] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    setSuccess("");

    try {
      // Send invitation using the API endpoint
      const response = await fetch(
        `/api/auth/organization/${organizationId}/invitation`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email,
            role: "student",
            department,
            teamId: teamId || undefined,
            // Store additional fields in metadata or extend the invitation model
            metadata: {
              name,
              grade,
              notes,
            },
          }),
        },
      );

      const result = await response.json();

      if (!response.ok) {
        setError(result.error || "Failed to send invitation");
      } else {
        if (result.emailSent) {
          setSuccess(`Student invitation sent to ${email} successfully!`);
        } else {
          setSuccess(
            `Invitation created but email failed to send. Error: ${result.emailError || "Unknown error"}`,
          );
        }
        // Reset form
        setEmail("");
        setName("");
        setGrade("");
        setDepartment("");
        setTeamId("");
        setNotes("");
        onSuccess?.();
      }
    } catch (_err) {
      setError("An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>Invite Student</CardTitle>
        <CardDescription>
          Send an invitation to a student to join your school
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email Address *</Label>
            <Input
              id="email"
              type="email"
              placeholder="student@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={isLoading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="name">Student Name</Label>
            <Input
              id="name"
              placeholder="Full name (optional)"
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={isLoading}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="grade">Grade Level</Label>
              <Select value={grade} onValueChange={setGrade}>
                <SelectTrigger>
                  <SelectValue placeholder="Select grade" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="kindergarten">Kindergarten</SelectItem>
                  <SelectItem value="1st">1st Grade</SelectItem>
                  <SelectItem value="2nd">2nd Grade</SelectItem>
                  <SelectItem value="3rd">3rd Grade</SelectItem>
                  <SelectItem value="4th">4th Grade</SelectItem>
                  <SelectItem value="5th">5th Grade</SelectItem>
                  <SelectItem value="6th">6th Grade</SelectItem>
                  <SelectItem value="7th">7th Grade</SelectItem>
                  <SelectItem value="8th">8th Grade</SelectItem>
                  <SelectItem value="9th">9th Grade</SelectItem>
                  <SelectItem value="10th">10th Grade</SelectItem>
                  <SelectItem value="11th">11th Grade</SelectItem>
                  <SelectItem value="12th">12th Grade</SelectItem>
                  <SelectItem value="college">College</SelectItem>
                  <SelectItem value="adult">Adult Learner</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="department">Department</Label>
              <Input
                id="department"
                placeholder="e.g., Science, Math"
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                disabled={isLoading}
              />
            </div>
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

          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              placeholder="Additional information about the student..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
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
            {isLoading ? "Sending..." : "Send Student Invitation"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
