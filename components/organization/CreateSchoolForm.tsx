"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";

interface CreateSchoolFormProps {
  onSuccess?: () => void;
}

export function CreateSchoolForm({ onSuccess }: CreateSchoolFormProps) {
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [schoolCode, setSchoolCode] = useState("");
  const [description, setDescription] = useState("");
  const [subscriptionTier, setSubscriptionTier] = useState("basic");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      // Create organization using Better Auth
      const { data, error } = await authClient.organization.create({
        name,
        slug,
        image: "", // TODO: Add image upload
        additionalFields: {
          schoolCode,
          description,
          subscriptionTier,
          maxTeams: subscriptionTier === "premium" ? 20 : 5,
          maxMembersPerTeam: subscriptionTier === "premium" ? 200 : 50,
          branding: {
            primaryColor: "#3b82f6",
            secondaryColor: "#1e40af",
          },
        },
      });

      if (error) {
        setError(error.message);
      } else {
        // Success - redirect to organization dashboard
        router.push(`/organizations/${data.id}`);
        onSuccess?.();
      }
    } catch (err) {
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
          Set up a new school organization with teams, courses, and member management
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
              <Select value={subscriptionTier} onValueChange={setSubscriptionTier}>
                <SelectTrigger>
                  <SelectValue placeholder="Select tier" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="basic">Basic (5 teams, 50 members/team)</SelectItem>
                  <SelectItem value="premium">Premium (20 teams, 200 members/team)</SelectItem>
                  <SelectItem value="enterprise">Enterprise (Unlimited)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="Describe your school, mission, and goals..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              disabled={isLoading}
            />
          </div>

          {error && (
            <div className="text-sm text-red-600 bg-red-50 p-3 rounded-md">
              {error}
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
