'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, XCircle, Loader2 } from 'lucide-react';

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

export default function InvitationPage({ params }: { params: { token: string } }) {
  const [invitation, setInvitation] = useState<InvitationData | null>(null);
  const [loading, setLoading] = useState(true);
  const [accepting, setAccepting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const router = useRouter();

  useEffect(() => {
    fetchInvitation();
  }, []);

  const fetchInvitation = async () => {
    try {
      const response = await fetch(`/api/auth/invitation/${params.token}`);
      if (!response.ok) {
        throw new Error('Invitation not found or expired');
      }
      const data = await response.json();
      setInvitation(data.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load invitation');
    } finally {
      setLoading(false);
    }
  };

  const acceptInvitation = async () => {
    if (!invitation) return;
    
    setAccepting(true);
    try {
      const response = await fetch(`/api/auth/invitation/${params.token}/accept`, {
        method: 'POST',
      });
      
      if (!response.ok) {
        throw new Error('Failed to accept invitation');
      }
      
      setSuccess(true);
      setTimeout(() => {
        router.push(`/organization/${invitation.organization.slug}`);
      }, 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to accept invitation');
    } finally {
      setAccepting(false);
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
              onClick={() => router.push('/')} 
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
            <CardTitle className="text-green-600">Invitation Accepted!</CardTitle>
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
              <span className="font-medium">{invitation.organization.name}</span>
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
                This invitation has expired. Please contact the organization administrator.
              </p>
            </div>
          ) : (
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
                'Accept Invitation'
              )}
            </Button>
          )}
          
          <p className="text-xs text-gray-500 text-center">
            By accepting this invitation, you agree to join {invitation.organization.name} 
            and follow their organization policies.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
