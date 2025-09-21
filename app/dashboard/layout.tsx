"use client";

import { useRouter, usePathname } from "next/navigation";
import { useEffect, useState, useMemo, useCallback } from "react";
import { useSession, signOut } from "next-auth/react";
import { DebugInfo } from "@/components/ui/debug-info";

// Removed unused interfaces

interface Organization {
  id: string;
  name: string;
  slug: string;
  createdBy: string;
}

// Normalize role names to handle different naming conventions
const normalizeRole = (role: string): string => {
  if (!role) return "student";

  const normalized = role.toLowerCase();

  // Handle different naming conventions
  if (normalized === "lead_instructor" || normalized === "leadinstructor") {
    return "leadInstructor";
  }
  if (normalized === "super_admin" || normalized === "superadmin") {
    return "superAdmin";
  }

  return normalized;
};

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const { data: session, status } = useSession();
  const isPending = status === "loading";
  const [userRole, setUserRole] = useState<string>("");
  const [organizationRole, setOrganizationRole] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);
  const [shouldRedirect, setShouldRedirect] = useState<string | null>(null);
  const [userOrganizations, setUserOrganizations] = useState<Organization[]>(
    [],
  );

  // Memoize session user ID to prevent unnecessary API calls
  const userId = useMemo(() => session?.user?.id, [session?.user?.id]);

  // Consolidated API call function
  const fetchUserData = useCallback(async () => {
    if (!session?.user?.id) return;

    try {
      // Get user's role from the database
      const userResponse = await fetch(`/api/auth/user/${session.user.id}`);

      if (userResponse.ok) {
        const userData = await userResponse.json();
        setUserRole(userData.data?.role || "STUDENT");
      } else {
        // Fallback: use session role if API fails
        if (session.user.role) {
          setUserRole(session.user.role);
        }
      }

      // Get user's organizations
      const orgResponse = await fetch("/api/organization");
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

          // Get user's organization role from the first organization's members
          const firstOrg = orgData.data[0];
          if (firstOrg.members) {
            const userMembership = firstOrg.members.find(
              (member: any) => member.userId === session.user.id
            );
            if (userMembership) {
              setOrganizationRole(userMembership.role || "student");
            }
          }
        }
      } else {
        // If organization API fails, check if user is SUPER_ADMIN
        // This handles the case where session auth fails but user is still authenticated
        const currentUserRole = userRole || session.user.role;
        if (currentUserRole === "SUPER_ADMIN") {
          setOrganizationRole("super_admin");
          // Create a mock organization for SUPER_ADMIN users
          setUserOrganizations([{
            id: "super-admin-org",
            name: "Super Admin Organization",
            slug: "super-admin",
            createdBy: session.user.id
          }]);
        }
      }
    } catch (error) {
      console.error("Error fetching user data:", error);
    } finally {
      setIsLoading(false);
    }
  }, [session?.user?.id, session?.user?.role, userRole]);

  // First useEffect: Handle authentication and role fetching
  useEffect(() => {
    if (!isPending && !session) {
      router.push("/auth/signin");
      return;
    }

    if (session?.user?.id) {
      fetchUserData();
    }
  }, [session, isPending, router, fetchUserData]);

  // Memoize effective role calculation
  const effectiveRole = useMemo(() => {
    if (isLoading || isPending || !session) return "";

    // Determine effective role - organization role takes precedence over user role
    let role = normalizeRole(organizationRole || userRole.toLowerCase());

    // If user is organization creator, they're a super user
    if (userOrganizations.some((org) => org.createdBy === session.user.id)) {
      role = "superAdmin";
    }

    return role;
  }, [isLoading, isPending, session, organizationRole, userRole, userOrganizations]);

  // Memoize redirect logic
  const redirectTarget = useMemo(() => {
    if (isLoading || isPending || !session) return null;

    if (effectiveRole === "superadmin" || effectiveRole === "superAdmin" || effectiveRole === "admin") {
      // Super User - stay on main dashboard
      return null;
    } else if (effectiveRole === "instructor" || effectiveRole === "leadinstructor") {
      return "instructor";
    } else if (effectiveRole === "student") {
      return "student";
    } else {
      // Default to student if no role is determined
      return "student";
    }
  }, [isLoading, isPending, session, effectiveRole]);

  // Update shouldRedirect when redirectTarget changes
  useEffect(() => {
    setShouldRedirect(redirectTarget);
  }, [redirectTarget]);

  // Handle actual navigation
  useEffect(() => {
    if (shouldRedirect === "instructor" && pathname !== "/dashboard/instructor") {
      router.replace("/dashboard/instructor");
    } else if (shouldRedirect === "student" && pathname !== "/dashboard/student") {
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

  if (status === "unauthenticated") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="w-16 h-16 bg-destructive rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-destructive-foreground font-bold text-2xl">
              !
            </span>
          </div>
          <div className="text-foreground text-lg">Please sign in to continue</div>
          <button
            type="button"
            onClick={() => router.push("/auth/signin")}
            className="mt-4 px-4 py-2 bg-primary text-primary-foreground rounded hover:bg-primary/90"
          >
            Sign In
          </button>
        </div>
      </div>
    );
  }

  if (!session) {
    return null;
  }

  // Route to appropriate dashboard based on role
  if (effectiveRole === "superadmin" || effectiveRole === "superAdmin" || effectiveRole === "admin") {
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
  } else if (effectiveRole === "instructor" || effectiveRole === "leadinstructor") {
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
