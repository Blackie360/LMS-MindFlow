"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CheckCircle, XCircle, RefreshCw, Bell, BellOff } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

// Fallback function for relative time formatting
const formatRelativeTime = (date: Date): string => {
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  
  if (diffInSeconds < 60) {
    return "just now";
  } else if (diffInSeconds < 3600) {
    const minutes = Math.floor(diffInSeconds / 60);
    return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
  } else if (diffInSeconds < 86400) {
    const hours = Math.floor(diffInSeconds / 3600);
    return `${hours} hour${hours > 1 ? 's' : ''} ago`;
  } else {
    const days = Math.floor(diffInSeconds / 86400);
    return `${days} day${days > 1 ? 's' : ''} ago`;
  }
};

interface InvitationUpdate {
  id: string;
  email: string;
  role: string;
  status: "accepted" | "rejected";
  acceptedAt: string;
  inviter: {
    id: string;
    name: string;
    email: string;
  };
}

interface InvitationNotificationsProps {
  organizationId: string;
  onRefresh?: () => void;
}

export function InvitationNotifications({
  organizationId,
  onRefresh,
}: InvitationNotificationsProps) {
  const [updates, setUpdates] = useState<InvitationUpdate[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [lastChecked, setLastChecked] = useState<Date>(new Date());

  const fetchUpdates = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/organization/${organizationId}/invitations/updates`);
      
      if (response.ok) {
        const data = await response.json();
        setUpdates(data.data || []);
        setLastChecked(new Date());
      } else {
        console.error("Failed to fetch invitation updates");
      }
    } catch (error) {
      console.error("Error fetching invitation updates:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUpdates();
    
    // Set up polling for real-time updates every 30 seconds
    const interval = setInterval(() => {
      if (notificationsEnabled) {
        fetchUpdates();
      }
    }, 30000); // 30 seconds

    return () => clearInterval(interval);
  }, [organizationId, notificationsEnabled]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "accepted":
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case "rejected":
        return <XCircle className="h-4 w-4 text-red-600" />;
      default:
        return null;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "accepted":
        return <Badge variant="default" className="bg-green-100 text-green-800">Accepted</Badge>;
      case "rejected":
        return <Badge variant="destructive" className="bg-red-100 text-red-800">Rejected</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getRoleBadge = (role: string) => {
    const roleColors = {
      'leadInstructor': 'bg-purple-100 text-purple-800',
      'instructor': 'bg-blue-100 text-blue-800',
      'student': 'bg-green-100 text-green-800',
      'admin': 'bg-red-100 text-red-800',
    };
    
    return (
      <Badge variant="secondary" className={roleColors[role as keyof typeof roleColors] || 'bg-gray-100 text-gray-800'}>
        {role.charAt(0).toUpperCase() + role.slice(1).replace(/([A-Z])/g, ' $1')}
      </Badge>
    );
  };

  if (!notificationsEnabled) {
    return (
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Invitation Updates</CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setNotificationsEnabled(true)}
          >
            <Bell className="h-4 w-4" />
          </Button>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Notifications are disabled. Click the bell icon to enable.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">Recent Invitation Updates</CardTitle>
        <div className="flex items-center space-x-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={fetchUpdates}
            disabled={isLoading}
          >
            <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setNotificationsEnabled(false)}
          >
            <BellOff className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {updates.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">
            No recent invitation updates
          </p>
        ) : (
          <div className="space-y-3">
            {updates.slice(0, 10).map((update) => (
              <div
                key={update.id}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
              >
                <div className="flex items-center space-x-3">
                  {getStatusIcon(update.status)}
                  <div>
                    <p className="text-sm font-medium">{update.email}</p>
                    <div className="flex items-center space-x-2">
                      {getRoleBadge(update.role)}
                      {getStatusBadge(update.status)}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xs text-muted-foreground">
                    {(() => {
                      try {
                        return formatDistanceToNow(new Date(update.acceptedAt), { addSuffix: true });
                      } catch {
                        return formatRelativeTime(new Date(update.acceptedAt));
                      }
                    })()}
                  </p>
                </div>
              </div>
            ))}
            
            {updates.length > 10 && (
              <p className="text-xs text-muted-foreground text-center">
                Showing 10 of {updates.length} updates
              </p>
            )}
          </div>
        )}
        
        <div className="mt-4 pt-3 border-t">
          <p className="text-xs text-muted-foreground">
            Last checked: {(() => {
              try {
                return formatDistanceToNow(lastChecked, { addSuffix: true });
              } catch {
                return formatRelativeTime(lastChecked);
              }
            })()}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
