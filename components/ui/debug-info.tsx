"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface DebugInfoProps {
  userRole: string;
  organizationRole: string;
  effectiveRole: string;
  userOrganizations: any[];
  session: any;
}

export function DebugInfo({ userRole, organizationRole, effectiveRole, userOrganizations, session }: DebugInfoProps) {
  const [isVisible, setIsVisible] = useState(false);

  if (!isVisible) {
    return (
      <div className="fixed bottom-4 right-4 z-50">
        <Button
          onClick={() => setIsVisible(true)}
          variant="outline"
          size="sm"
          className="bg-yellow-500 text-white hover:bg-yellow-600"
        >
          Debug Info
        </Button>
      </div>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 w-80">
      <Card className="bg-yellow-50 border-yellow-200">
        <CardHeader className="pb-2">
          <div className="flex justify-between items-center">
            <CardTitle className="text-sm text-yellow-800">Debug Information</CardTitle>
            <Button
              onClick={() => setIsVisible(false)}
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0 text-yellow-600 hover:text-yellow-800"
            >
              ×
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-2 text-xs">
          <div>
            <span className="font-medium text-yellow-800">User ID:</span>
            <span className="text-yellow-600 ml-2">{session?.user?.id || "N/A"}</span>
          </div>
          <div>
            <span className="font-medium text-yellow-800">Email:</span>
            <span className="text-yellow-600 ml-2">{session?.user?.email || "N/A"}</span>
          </div>
          <div>
            <span className="font-medium text-yellow-800">User Role:</span>
            <Badge variant="outline" className="ml-2 text-xs">
              {userRole || "N/A"}
            </Badge>
          </div>
          <div>
            <span className="font-medium text-yellow-800">Org Role:</span>
            <Badge variant="outline" className="ml-2 text-xs">
              {organizationRole || "N/A"}
            </Badge>
          </div>
          <div>
            <span className="font-medium text-yellow-800">Effective Role:</span>
            <Badge variant="outline" className="ml-2 text-xs bg-green-100 text-green-800">
              {effectiveRole || "N/A"}
            </Badge>
          </div>
          <div>
            <span className="font-medium text-yellow-800">Organizations:</span>
            <span className="text-yellow-600 ml-2">{userOrganizations.length}</span>
          </div>
          {userOrganizations.length > 0 && (
            <div className="text-yellow-600">
              {userOrganizations.map((org, index) => (
                <div key={index} className="ml-2">
                  • {org.name} (Creator: {org.createdBy === session?.user?.id ? "Yes" : "No"})
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}



