"use client";

import { CheckCircle, Loader2, XCircle } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useState, use, Suspense } from "react";
import { signIn, useSession } from "next-auth/react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { InvitationRedirectHandler } from "@/components/auth/InvitationRedirectHandler";

interface InvitationData {
  id: string;
  organization: {
    name: string;
    slug: string;
  };
  role: string;
  department?: string;
  email: string;
  expiresAt: string;
  inviter: {
    name: string;
    email: string;
  };
}

function InvitationPageContent({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const [invitation, setInvitation] = useState<InvitationData | null>(null);
  const [loading, setLoading] = useState(true);
  const [accepting, _setAccepting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, _setSuccess] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: session, status } = useSession();
  const { token } = use(params);

  const fetchInvitation = useCallback(async () => {
    try {
      const response = await fetch(`/api/auth/invitation/${token}`);
      if (!response.ok) {
        throw new Error("Invitation not found or expired");
      }
      const data = await response.json();
      setInvitation(data.data);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to load invitation",
      );
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchInvitation();
  }, [fetchInvitation]);

  // Handle social auth callback
  useEffect(() => {
    if (searchParams.get('social') === 'true' && session?.user) {
      // User came back from social auth and is signed in
      // The auth callback should have already processed the invitation
      // Redirect to appropriate dashboard
      const role = session.user.role;
      let redirectUrl = "/dashboard";

      switch (role) {
        case "INSTRUCTOR":
          redirectUrl = "/dashboard/instructor?welcome=true";
          break;
        case "STUDENT":
          redirectUrl = "/dashboard/student?welcome=true";
          break;
        case "ADMIN":
        case "SUPER_ADMIN":
          redirectUrl = "/dashboard?welcome=true";
          break;
        default:
          redirectUrl = "/dashboard?welcome=true";
      }

      // Add organization info if available
      if (invitation) {
        redirectUrl += `&org=${invitation.organization.slug}`;
      }

      router.push(redirectUrl);
    }
  }, [searchParams, session, router, invitation]);

  const acceptInvitation = async () => {
    if (!invitation) return;

    // Redirect to onboarding page where user will create their credentials
    router.push(`/invitation/${token}/onboarding`);
  };

  const handleSocialAuth = async (provider: string) => {
    if (!invitation) return;

    // Sign in with social provider and redirect back to invitation page
    await signIn(provider, {
      callbackUrl: `/invitation/${token}?social=true`,
      redirect: true
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-indigo-600" />
          <p className="text-gray-600">Loading invitation...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <XCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <CardTitle className="text-red-600">Invitation Error</CardTitle>
            <CardDescription>{error}</CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              onClick={() => router.push("/")}
              className="w-full"
              variant="outline"
            >
              Go Home
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
            <CardTitle className="text-green-600">
              Invitation Accepted!
            </CardTitle>
            <CardDescription>
              Welcome to {invitation?.organization.name}! Redirecting you now...
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  if (!invitation) {
    return null;
  }

  const isExpired = new Date(invitation.expiresAt) < new Date();

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mb-4">
            <span className="text-2xl">🎓</span>
          </div>
          <CardTitle>You're Invited!</CardTitle>
          <CardDescription>
            Join {invitation.organization.name} on MindFlow
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Organization:</span>
              <span className="font-medium">
                {invitation.organization.name}
              </span>
            </div>

            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Role:</span>
              <Badge variant="secondary">{invitation.role}</Badge>
            </div>

            {invitation.department && (
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Department:</span>
                <span className="font-medium">{invitation.department}</span>
              </div>
            )}

            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Invited by:</span>
              <span className="font-medium">{invitation.inviter.name}</span>
            </div>

            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Expires:</span>
              <span className="text-sm">
                {new Date(invitation.expiresAt).toLocaleDateString()}
              </span>
            </div>
          </div>

          {isExpired ? (
            <div className="text-center py-4">
              <Badge variant="destructive">Expired</Badge>
              <p className="text-sm text-gray-600 mt-2">
                This invitation has expired. Please contact the organization
                administrator.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Social Auth Options */}
              <div className="space-y-2">
                <p className="text-sm text-gray-600 text-center">Quick sign-in with:</p>
                <div className="grid grid-cols-2 gap-2">
                  <Button
                    onClick={() => handleSocialAuth("google")}
                    variant="outline"
                    className="w-full"
                    disabled={accepting}
                  >
                    <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24">
                      <path
                        fill="currentColor"
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      />
                      <path
                        fill="currentColor"
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      />
                      <path
                        fill="currentColor"
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                      />
                      <path
                        fill="currentColor"
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                      />
                    </svg>
                    Google
                  </Button>
                  <Button
                    onClick={() => handleSocialAuth("github")}
                    variant="outline"
                    className="w-full"
                    disabled={accepting}
                  >
                    <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                    </svg>
                    GitHub
                  </Button>
                </div>
              </div>

              {/* Divider */}
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-background px-2 text-muted-foreground">Or</span>
                </div>
              </div>

              {/* Manual Account Creation */}
              <Button
                onClick={acceptInvitation}
                className="w-full"
                disabled={accepting}
              >
                {accepting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Accepting...
                  </>
                ) : (
                  "Create Account & Accept"
                )}
              </Button>
            </div>
          )}

          <p className="text-xs text-gray-500 text-center">
            By accepting this invitation, you agree to join{" "}
            {invitation.organization.name}
            and follow their organization policies.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

export default function InvitationPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-900 via-purple-900 to-blue-900">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-white" />
          <p className="text-white">Loading invitation...</p>
        </div>
      </div>
    }>
      <InvitationPageContent params={params} />
    </Suspense>
  );
}
