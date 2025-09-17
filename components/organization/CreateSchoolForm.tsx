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
import { useSession } from "next-auth/react";

interface CreateSchoolFormProps {
  onSuccess?: (organization?: any) => void;
}

export function CreateSchoolForm({ onSuccess }: CreateSchoolFormProps) {
  const { data: session } = useSession();
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
      console.log("Creating organization...");
      
      if (!session?.user) {
        setError("You must be logged in to create an organization");
        setIsLoading(false);
        return;
      }

      // Create organization using API call
      const response = await fetch("/api/organization", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          slug,
          schoolCode,
          subscriptionTier,
        }),
      });

      let data;
      try {
        data = await response.json();
      } catch (jsonError) {
        console.error("Failed to parse response as JSON:", jsonError);
        setError("Server returned an invalid response. Please try again.");
        return;
      }

      if (response.ok) {
        console.log("Organization created successfully:", data);
        setIsSuccess(true);
        setTimeout(() => {
          onSuccess?.(data?.data);
        }, 2000);
      } else {
        console.error("Organization creation error:", data);
        setError(data.error || "Failed to create organization");
      }
    } catch (err) {
      console.error("Unexpected error creating organization:", err);
      setError("An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  if (isSuccess) {
    return (
      <Card className="w-full max-w-2xl mx-auto">
        <CardContent className="p-8 text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg
              className="w-8 h-8 text-green-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
          <h3 className="text-xl font-semibold text-foreground mb-2">
            Organization Created Successfully!
          </h3>
          <p className="text-muted-foreground mb-4">
            Your school organization has been set up and you're ready to start
            managing courses and students.
          </p>
          <div className="text-sm text-muted-foreground">
            Redirecting to your dashboard...
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl font-bold text-foreground">
          Create Your School
        </CardTitle>
        <CardDescription className="text-muted-foreground">
          Set up your educational institution to start managing courses and
          students
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">School Name *</Label>
              <Input
                id="name"
                type="text"
                placeholder="Enter your school name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                disabled={isLoading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="slug">URL Slug *</Label>
              <Input
                id="slug"
                type="text"
                placeholder="school-name"
                value={slug}
                onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""))}
                required
                disabled={isLoading}
              />
              <p className="text-xs text-muted-foreground">
                Used in URLs: yourschool.com/school-name
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="schoolCode">School Code</Label>
              <Input
                id="schoolCode"
                type="text"
                placeholder="e.g., ABC123"
                value={schoolCode}
                onChange={(e) => setSchoolCode(e.target.value.toUpperCase())}
                disabled={isLoading}
              />
              <p className="text-xs text-muted-foreground">
                Optional: Unique identifier for your school
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="subscriptionTier">Subscription Tier</Label>
              <Select
                value={subscriptionTier}
                onValueChange={setSubscriptionTier}
                disabled={isLoading}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a tier" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="basic">Basic (Free)</SelectItem>
                  <SelectItem value="premium">Premium</SelectItem>
                  <SelectItem value="enterprise">Enterprise</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-md">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          <div className="flex justify-end space-x-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => window.history.back()}
              disabled={isLoading}
            >
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