"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

export default function AcceptInvitationRedirectPage({
  params,
}: {
  params: { token: string };
}) {
  const router = useRouter();

  useEffect(() => {
    // Redirect to the correct invitation page
    router.replace(`/invitation/${params.token}`);
  }, [router, params.token]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-900 via-purple-900 to-blue-900">
      <div className="text-center">
        <div className="w-16 h-16 bg-orange-500 rounded-full flex items-center justify-center mx-auto mb-4">
          <Loader2 className="h-8 w-8 text-white animate-spin" />
        </div>
        <div className="text-white text-lg">Redirecting to invitation...</div>
      </div>
    </div>
  );
}
