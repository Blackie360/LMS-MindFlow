"use client";

import { CheckCircle, Eye, EyeOff, Loader2, XCircle } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
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

interface Invitation {
  id: string;
  email: string;
  role: string;
  organization: {
    name: string;
    slug: string;
  };
  expiresAt: string;
}

function AcceptInvitationPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [invitation, setInvitation] = useState<Invitation | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAccepting, setIsAccepting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    if (!token) {
      setError("No invitation token provided");
      setIsLoading(false);
      return;
    }

    const fetchInvitation = async () => {
      try {
        const response = await fetch(
          `/api/auth/invitation/verify?token=${token}`,
        );
        if (response.ok) {
          const data = await response.json();
          setInvitation(data.data);
        } else {
          const errorData = await response.json();
          setError(errorData.error || "Invalid invitation");
        }
      } catch (_error) {
        setError("Failed to verify invitation");
      } finally {
        setIsLoading(false);
      }
    };

    fetchInvitation();
  }, [token]);

  const handleAcceptInvitation = async () => {
    if (formData.password.length < 8) {
      setError("Password must be at least 8 characters long");
      return;
    }

    setIsAccepting(true);
    setError(null);

    try {
      console.log("Sending invitation acceptance request...");
      const response = await fetch(`/api/auth/invitation/${token}/accept`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: formData.name,
          password: formData.password,
        }),
      });

      const responseData = await response.json();
      console.log("Response:", responseData);

      if (response.ok) {
        if (responseData.success) {
          // Show success message
          setError(null);
          setIsSuccess(true);

          // Redirect to sign in page with success message
          router.push("/auth/signin?message=Invitation accepted successfully. Please sign in to continue.");
        } else {
          setError(responseData.error || "Failed to accept invitation");
        }
      } else {
        setError(responseData.error || "Failed to accept invitation");
      }
    } catch (error) {
      console.error("Error accepting invitation:", error);
      setError("Network error. Please check your connection and try again.");
    } finally {
      setIsAccepting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-900 via-purple-900 to-blue-900">
        <div className="text-center">
          <div className="w-16 h-16 bg-orange-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <Loader2 className="h-8 w-8 text-white animate-spin" />
          </div>
          <div className="text-white text-lg">Verifying invitation...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-900 via-purple-900 to-blue-900">
        <div className="text-center">
          <div className="w-16 h-16 bg-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <XCircle className="h-8 w-8 text-white" />
          </div>
          <div className="text-white text-lg mb-4">{error}</div>
          <div className="text-white/60 text-sm mb-4">
            This could be due to:
            <ul className="mt-2 text-left max-w-md mx-auto">
              <li>• Invalid or expired invitation link</li>
              <li>• Server error during account creation</li>
              <li>• Database connection issues</li>
            </ul>
          </div>
          <div className="space-y-2">
            <Button
              onClick={() => window.location.reload()}
              className="bg-blue-500 hover:bg-blue-600 mr-2"
            >
              Try Again
            </Button>
            <Button
              onClick={() => router.push("/auth/signin")}
              className="bg-orange-500 hover:bg-orange-600"
            >
              Go to Sign In
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (!invitation) {
    return null;
  }

  if (isSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-900 via-purple-900 to-blue-900 py-12 px-4">
        <Card className="w-full max-w-md bg-white/10 border-white/20">
          <CardHeader className="text-center">
            <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="h-8 w-8 text-white" />
            </div>
            <CardTitle className="text-white text-2xl">
              Invitation Accepted!
            </CardTitle>
            <CardDescription className="text-white/60">
              Welcome to {invitation.organization.name}
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-white/80 mb-4">
              Your account has been created successfully. Signing you in and
              redirecting to your dashboard...
            </p>
            <div className="text-white/60 text-sm">
              Please wait while we set up your account...
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-900 via-purple-900 to-blue-900 py-12 px-4">
      <Card className="w-full max-w-md bg-white/10 border-white/20">
        <CardHeader className="text-center">
          <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="h-8 w-8 text-white" />
          </div>
          <CardTitle className="text-white text-2xl">
            Accept Invitation
          </CardTitle>
          <CardDescription className="text-white/60">
            You've been invited to join {invitation.organization.name}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Invitation Details */}
          <div className="p-4 bg-white/5 rounded-lg border border-white/10">
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-white/60">Organization:</span>
                <span className="text-white font-medium">
                  {invitation.organization.name}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-white/60">Role:</span>
                <Badge variant="outline" className="border-white/20 text-white">
                  {invitation.role}
                </Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-white/60">Email:</span>
                <span className="text-white font-medium">
                  {invitation.email}
                </span>
              </div>
            </div>
          </div>

          {/* Sign Up Form */}
          <div className="space-y-4">
            <div>
              <Label htmlFor="name" className="text-white">
                Full Name
              </Label>
              <Input
                id="name"
                type="text"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                className="bg-white/10 border-white/20 text-white placeholder:text-white/50"
                placeholder="Enter your full name"
              />
            </div>
            <div>
              <Label htmlFor="password" className="text-white">
                Password
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={formData.password}
                  onChange={(e) =>
                    setFormData({ ...formData, password: e.target.value })
                  }
                  className="bg-white/10 border-white/20 text-white placeholder:text-white/50 pr-10"
                  placeholder="Create a password (min. 8 characters)"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent text-white/70 hover:text-white"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>
          </div>

          <Button
            onClick={handleAcceptInvitation}
            disabled={isAccepting || !formData.name || !formData.password}
            className="w-full bg-green-500 hover:bg-green-600 disabled:opacity-50"
          >
            {isAccepting ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Accepting...
              </>
            ) : (
              "Accept Invitation & Create Account"
            )}
          </Button>

          <div className="text-center">
            <p className="text-white/60 text-sm">
              By accepting this invitation, you agree to our terms of service
              and privacy policy.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default function AcceptInvitationPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p>Loading invitation...</p>
        </div>
      </div>
    }>
      <AcceptInvitationPageContent />
    </Suspense>
  );
}
