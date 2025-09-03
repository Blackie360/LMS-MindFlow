"use client";

import { useRouter, usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { DebugInfo } from "@/components/ui/debug-info";
import { authClient } from "@/lib/auth-client";

// Removed unused interfaces

interface Organization {
  id: string;
  name: string;
  slug: string;
  createdBy: string;
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const { data: session, isPending, error } = authClient.useSession();
  const [userRole, setUserRole] = useState<string>("");
  const [organizationRole, setOrganizationRole] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);
  const [shouldRedirect, setShouldRedirect] = useState<string | null>(null);
  const [userOrganizations, setUserOrganizations] = useState<Organization[]>(
    [],
  );

  // First useEffect: Handle authentication and role fetching
  useEffect(() => {
    if (!isPending && !session) {
      router.push("/auth/signin");
      return;
    }

    if (session?.user) {
      const fetchUserData = async () => {
        try {
          // Get user's role from the database
          const userResponse = await fetch(`/api/auth/user/${session.user.id}`);
          if (userResponse.ok) {
            const userData = await userResponse.json();
            setUserRole(userData.role || "STUDENT");
          }

          // Get user's organizations
          const orgResponse = await fetch("/api/auth/organization/list");
          if (orgResponse.ok) {
            const orgData = await orgResponse.json();
            if (orgData.data && orgData.data.length > 0) {
              setUserOrganizations(orgData.data);

              // Check if user is the creator of any organization (Super User)
              const isSuperUser = orgData.data.some(
                (org: Organization) => org.createdBy === session.user.id,
              );
              if (isSuperUser) {
                setOrganizationRole("super_admin");
                return;
              }

              // Get user's organization role as a member
              const memberResponse = await fetch(
                `/api/auth/organization/${orgData.data[0].id}/member/${session.user.id}`,
              );
              if (memberResponse.ok) {
                const memberData = await memberResponse.json();
                setOrganizationRole(memberData.role || "student");
              }
            }
          }
        } catch (error) {
          console.error("Error fetching user data:", error);
        } finally {
          setIsLoading(false);
        }
      };

      fetchUserData();
    }
  }, [session, isPending, router]);

  // Second useEffect: Handle navigation based on role
  useEffect(() => {
    if (!isLoading && !isPending && session) {
      // Determine effective role - organization role takes precedence
      let effectiveRole = organizationRole || userRole.toLowerCase();

      // If user is organization creator, they're a super user
      if (userOrganizations.some((org) => org.createdBy === session.user.id)) {
        effectiveRole = "super_admin";
      }

      console.log("User role:", userRole);
      console.log("Organization role:", organizationRole);
      console.log("Effective role:", effectiveRole);
      console.log("User organizations:", userOrganizations);

      if (effectiveRole === "super_admin" || effectiveRole === "admin") {
        // Super User - stay on main dashboard
        setShouldRedirect(null);
      } else if (
        effectiveRole === "instructor" ||
        effectiveRole === "lead_instructor"
      ) {
        setShouldRedirect("instructor");
      } else if (effectiveRole === "student") {
        setShouldRedirect("student");
      } else {
        // Default to student if no role is determined
        setShouldRedirect("student");
      }
    }
  }, [
    isLoading,
    isPending,
    session,
    organizationRole,
    userRole,
    userOrganizations,
  ]);

  // Third useEffect: Handle actual navigation
  useEffect(() => {
    if (shouldRedirect === "instructor" && pathname !== "/dashboard/instructor") {
      console.log("Redirecting to instructor dashboard");
      router.replace("/dashboard/instructor");
    } else if (shouldRedirect === "student" && pathname !== "/dashboard/student") {
      console.log("Redirecting to student dashboard");
      router.replace("/dashboard/student");
    }
  }, [shouldRedirect, router, pathname]);

  // Early returns for loading and error states
  if (isPending || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-primary-foreground font-bold text-2xl">
              M
            </span>
          </div>
          <div className="text-foreground text-lg">
            Loading your dashboard...
          </div>
          <div className="mt-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="w-16 h-16 bg-destructive rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-destructive-foreground font-bold text-2xl">
              !
            </span>
          </div>
          <div className="text-foreground text-lg">Error: {error.message}</div>
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-primary text-primary-foreground rounded hover:bg-primary/90"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!session) {
    return null;
  }

  // Determine which dashboard to show based on role
  let effectiveRole = organizationRole || userRole.toLowerCase();

  // If user is organization creator, they're a super user
  if (userOrganizations.some((org) => org.createdBy === session.user.id)) {
    effectiveRole = "super_admin";
  }

  console.log("Final effective role:", effectiveRole);

  // Route to appropriate dashboard based on role
  if (effectiveRole === "super_admin" || effectiveRole === "admin") {
    // Super User Dashboard
    return (
      <div className="min-h-screen bg-background">
        {children}
        <DebugInfo
          userRole={userRole}
          organizationRole={organizationRole}
          effectiveRole={effectiveRole}
          userOrganizations={userOrganizations}
          session={session}
        />
      </div>
    );
  } else if (
    effectiveRole === "instructor" ||
    effectiveRole === "lead_instructor"
  ) {
    // Show instructor dashboard if already on correct path, otherwise redirect
    if (pathname === "/dashboard/instructor") {
      return <div className="min-h-screen bg-background">{children}</div>;
    }
    return null;
  } else if (effectiveRole === "student") {
    // Show student dashboard if already on correct path, otherwise redirect
    if (pathname === "/dashboard/student") {
      return <div className="min-h-screen bg-background">{children}</div>;
    }
    return null;
  }

  // Default case - show loading or error
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center">
        <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-4">
          <span className="text-primary-foreground font-bold text-2xl">M</span>
        </div>
        <div className="text-foreground text-lg">Loading your dashboard...</div>
        <div className="mt-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
        </div>
      </div>
      <DebugInfo
        userRole={userRole}
        organizationRole={organizationRole}
        effectiveRole={effectiveRole}
        userOrganizations={userOrganizations}
        session={session}
      />
    </div>
  );
}
