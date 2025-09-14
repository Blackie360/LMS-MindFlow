"use client";

import { CheckCircle, XCircle, Loader2, AlertCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState, use } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

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

export default function RejectInvitationPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const [invitation, setInvitation] = useState<InvitationData | null>(null);
  const [loading, setLoading] = useState(true);
  const [rejecting, setRejecting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");
  const router = useRouter();
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

  const rejectInvitation = async () => {
    if (!invitation) return;

    setRejecting(true);
    setError(null);

    try {
      const response = await fetch(
        `/api/auth/invitation/${token}/reject`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            reason: rejectionReason.trim() || undefined,
          }),
        },
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to reject invitation");
      }

      setSuccess(true);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to reject invitation",
      );
    } finally {
      setRejecting(false);
    }
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

  if (error && !invitation) {
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
              Invitation Declined
            </CardTitle>
            <CardDescription>
              You have successfully declined the invitation to join{" "}
              {invitation?.organization.name}.
            </CardDescription>
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

  if (!invitation) {
    return null;
  }

  const isExpired = new Date(invitation.expiresAt) < new Date();

  if (isExpired) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <AlertCircle className="h-12 w-12 text-orange-500 mx-auto mb-4" />
            <CardTitle className="text-orange-600">Invitation Expired</CardTitle>
            <CardDescription>
              This invitation has expired. Please contact the organization
              administrator for a new invitation.
            </CardDescription>
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

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gray-50">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
            <XCircle className="h-8 w-8 text-red-600" />
          </div>
          <CardTitle>Decline Invitation</CardTitle>
          <CardDescription>
            You have been invited to join {invitation.organization.name} on
            MindFlow
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Invitation Details */}
          <div className="bg-gray-50 rounded-lg p-4 space-y-2">
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
              <span className="text-sm text-gray-600">Email:</span>
              <span className="font-medium">{invitation.email}</span>
            </div>

            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Invited by:</span>
              <span className="font-medium">{invitation.inviter.name}</span>
            </div>
          </div>

          {/* Rejection Reason */}
          <div className="space-y-2">
            <Label htmlFor="reason">Reason for declining (optional)</Label>
            <Textarea
              id="reason"
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              placeholder="Let us know why you're declining this invitation..."
              rows={3}
            />
          </div>

          {error && (
            <div className="text-red-600 text-sm text-center bg-red-50 p-3 rounded-lg">
              {error}
            </div>
          )}

          <div className="space-y-3">
            <Button
              onClick={rejectInvitation}
              className="w-full"
              variant="destructive"
              disabled={rejecting}
            >
              {rejecting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Declining Invitation...
                </>
              ) : (
                "Decline Invitation"
              )}
            </Button>

            <Button
              onClick={() => router.push(`/invitation/${token}/onboarding`)}
              className="w-full"
              variant="outline"
            >
              Actually, I want to accept
            </Button>
          </div>

          <p className="text-xs text-gray-500 text-center">
            By declining this invitation, you will not be able to join{" "}
            {invitation.organization.name} unless you receive a new invitation.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
