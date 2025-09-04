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
import { authClient } from "@/lib/auth-client";

interface CreateSchoolFormProps {
  onSuccess?: () => void;
}

export function CreateSchoolForm({ onSuccess }: CreateSchoolFormProps) {
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [schoolCode, setSchoolCode] = useState("");
  const [subscriptionTier, setSubscriptionTier] = useState("basic");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      console.log("Creating organization with Better Auth client...");
      
      // Check if user is authenticated
      const session = await authClient.getSession();
      console.log("Current session:", session);
      
      if (!session || !session.data || !session.data.user) {
        setError("You must be logged in to create an organization");
        setIsLoading(false);
        return;
      }
      
      // Create organization using Better Auth organization plugin
      // Store custom school data in metadata field due to Better Auth limitations
      const organizationData = {
        name,
        slug,
        logo: "", // Optional logo URL
        createdBy: session.data.user.id, // Set the creator to current user
        metadata: {
          type: "school",
          schoolCode,
          subscriptionTier,
          maxTeams: subscriptionTier === "premium" ? 20 : subscriptionTier === "enterprise" ? 999 : 5,
          maxMembersPerTeam: subscriptionTier === "premium" ? 200 : subscriptionTier === "enterprise" ? 999 : 50,
          branding: {
            primaryColor: "#3b82f6",
            secondaryColor: "#1e40af",
          },
          createdAt: new Date().toISOString(),
        },
      };
      
      console.log("Organization data being sent:", organizationData);
      
      const { data, error } = await authClient.organization.create(organizationData);

      if (error) {
        console.error("Organization creation error:", error);
        console.error("Error details:", JSON.stringify(error, null, 2));
        setError(error.message || error.statusText || "Failed to create organization");
      } else {
        // Success - show success message briefly then redirect
        setError(""); // Clear any previous errors
        setIsSuccess(true);
        
        // Create a default "General" team
        try {
          console.log("Creating default team for organization:", data.id);
          const teamResult = await authClient.organization.createTeam({
            name: "General",
            organizationId: data.id,
          });
          console.log("Team created successfully:", teamResult);
        } catch (teamError) {
          console.warn("Failed to create default team:", teamError);
          // Don't fail the whole process if team creation fails
        }
        
        // Call onSuccess which will trigger redirect
        onSuccess?.();
      }
    } catch (err) {
      console.error("Organization creation error:", err);
      setError("An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
  };

  const handleNameChange = (value: string) => {
    setName(value);
    if (!slug) {
      setSlug(generateSlug(value));
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Create New School</CardTitle>
        <CardDescription>
          Set up a new school organization with teams, courses, and member
          management
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">School Name *</Label>
              <Input
                id="name"
                placeholder="Enter school name"
                value={name}
                onChange={(e) => handleNameChange(e.target.value)}
                required
                disabled={isLoading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="slug">URL Slug *</Label>
              <Input
                id="slug"
                placeholder="school-url-slug"
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                required
                disabled={isLoading}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="schoolCode">School Code</Label>
              <Input
                id="schoolCode"
                placeholder="SCH001"
                value={schoolCode}
                onChange={(e) => setSchoolCode(e.target.value)}
                disabled={isLoading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="subscriptionTier">Subscription Tier</Label>
              <Select
                value={subscriptionTier}
                onValueChange={setSubscriptionTier}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select tier" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="basic">
                    Basic (5 teams, 50 members/team)
                  </SelectItem>
                  <SelectItem value="premium">
                    Premium (20 teams, 200 members/team)
                  </SelectItem>
                  <SelectItem value="enterprise">
                    Enterprise (Unlimited)
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {error && (
            <div className="text-sm text-destructive bg-destructive/10 p-3 rounded-md border border-destructive/20">
              {error}
            </div>
          )}

          {isSuccess && (
            <div className="text-sm text-success bg-success/10 p-3 rounded-md border border-success/20">
              ✅ Organization created successfully! Redirecting to dashboard...
            </div>
          )}

          <div className="flex justify-end space-x-3">
            <Button type="button" variant="outline" disabled={isLoading}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Creating..." : "Create School"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
