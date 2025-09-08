"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";
import { Loader2 } from "lucide-react";

export function InvitationRedirectHandler() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (status === "loading") return;

    if (session?.user) {
      // User is signed in, redirect to appropriate dashboard
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

      // Check if there's invitation data in the session
      if ((session as any).invitationData) {
        const invitationData = (session as any).invitationData;
        redirectUrl += `&org=${invitationData.organization.slug}`;
      }

      router.push(redirectUrl);
    } else {
      // User is not signed in, redirect to sign in page
      router.push("/auth/signin");
    }
  }, [session, status, router]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-indigo-600" />
        <p className="text-gray-600">Redirecting to your dashboard...</p>
      </div>
    </div>
  );
}
