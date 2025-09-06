"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export function DebugEnv() {
  // Only show in development or when explicitly enabled
  if (process.env.NODE_ENV === "production" && !process.env.NEXT_PUBLIC_DEBUG_ENV) {
    return null;
  }

  return (
    <Card className="bg-yellow-50 border-yellow-200">
      <CardHeader>
        <CardTitle className="text-yellow-800">Environment Debug Info</CardTitle>
        <CardDescription className="text-yellow-700">
          This component helps debug environment variable configuration
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-2">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div>
            <strong>NEXT_PUBLIC_APP_URL:</strong>
            <br />
            <code className="bg-gray-100 px-2 py-1 rounded">
              {process.env.NEXT_PUBLIC_APP_URL || "Not set"}
            </code>
          </div>
          <div>
            <strong>NODE_ENV:</strong>
            <br />
            <code className="bg-gray-100 px-2 py-1 rounded">
              {process.env.NODE_ENV}
            </code>
          </div>
          <div>
            <strong>Current URL:</strong>
            <br />
            <code className="bg-gray-100 px-2 py-1 rounded">
              {typeof window !== "undefined" ? window.location.origin : "Server-side"}
            </code>
          </div>
          <div>
            <strong>Auth Client Base URL:</strong>
            <br />
            <code className="bg-gray-100 px-2 py-1 rounded">
              {process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}
            </code>
          </div>
        </div>
        <div className="mt-4 p-3 bg-yellow-100 rounded">
          <p className="text-sm text-yellow-800">
            <strong>Note:</strong> In production, set <code>NEXT_PUBLIC_DEBUG_ENV=true</code> to show this debug info.
            Remove this component after debugging.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
