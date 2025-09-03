"use client";

import { BookOpen, Building2, Users } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { CreateCourseForm } from "@/components/courses/CreateCourseForm";
import { CreateSchoolForm } from "@/components/organization/CreateSchoolForm";
import { MemberManagement } from "@/components/organization/MemberManagement";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { authClient } from "@/lib/auth-client";

interface Organization {
  id: string;
  name: string;
  slug: string;
  subscriptionTier: string;
  schoolCode?: string;
  createdAt: string;
}

export default function DashboardPage() {
  const router = useRouter();
  const { data: session, isPending, error } = authClient.useSession();
  const [activeTab, setActiveTab] = useState("overview");
  const [showCreateSchool, setShowCreateSchool] = useState(false);
  const [showCreateCourse, setShowCreateCourse] = useState(false);
  const [userOrganization, setUserOrganization] = useState<Organization | null>(
    null,
  );
  const [isLoadingOrg, setIsLoadingOrg] = useState(true);

  useEffect(() => {
    if (!isPending && !session) {
      router.push("/auth/signin");
    }
  }, [session, isPending, router]);

  // Fetch user's organization
  useEffect(() => {
    const fetchUserOrganization = async () => {
      if (!session?.user?.id) return;

      try {
        console.log("Fetching organizations for user:", session.user.id);
        const response = await fetch("/api/auth/organization/list");
        console.log("Organization list response status:", response.status);

        if (response.ok) {
          const result = await response.json();
          console.log("Organization list result:", result);

          if (result.data && result.data.length > 0) {
            console.log("Setting organization:", result.data[0]);
            setUserOrganization(result.data[0]); // Get the first organization
          } else {
            console.log("No organizations found for user");
          }
        } else {
          console.error(
            "Failed to fetch organizations:",
            response.status,
            response.statusText,
          );
        }
      } catch (error) {
        console.error("Error fetching organization:", error);
      } finally {
        setIsLoadingOrg(false);
      }
    };

    fetchUserOrganization();
  }, [session?.user?.id]);

  const handleSignOut = async () => {
    await authClient.signOut({
      fetchOptions: {
        onSuccess: () => {
          router.push("/");
        },
      },
    });
  };

  if (isPending) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg text-destructive">Error: {error.message}</div>
      </div>
    );
  }

  if (!session) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
              <p className="mt-2 text-muted-foreground">
                Welcome back, {session.user.name || session.user.email}!
              </p>
              <div className="mt-2">
                <Badge variant="secondary">Super User</Badge>
              </div>
            </div>
            <Button variant="outline" onClick={handleSignOut}>
              Sign Out
            </Button>
          </div>
        </div>

        {/* Organization Information */}
        <div className="mb-6">
          {isLoadingOrg ? (
            <Card className="bg-primary/10 border-primary/20">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                      <Building2 className="h-5 w-5 text-primary-foreground" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground">
                        Loading Organization...
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        Please wait while we load your school details
                      </p>
                    </div>
                  </div>
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                </div>
              </CardContent>
            </Card>
          ) : userOrganization ? (
            <Card className="bg-primary/10 border-primary/20">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                      <Building2 className="h-5 w-5 text-primary-foreground" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground">
                        Active School
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {userOrganization.name}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Badge
                      variant="outline"
                      className="border-primary/30 text-primary"
                    >
                      {userOrganization.subscriptionTier || "Basic"}
                    </Badge>
                    <Button
                      variant="outline"
                      size="sm"
                      className="border-primary/30 text-primary hover:bg-primary/10"
                      onClick={() => window.location.reload()}
                    >
                      Refresh
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : !isLoadingOrg ? (
            <Card className="bg-warning/10 border-warning/20">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-warning rounded-lg flex items-center justify-center">
                      <Building2 className="h-5 w-5 text-warning-foreground" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground">
                        Organization Not Found
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        We couldn't find your organization. Please refresh or
                        check if it was created properly.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Button
                      variant="outline"
                      size="sm"
                      className="border-warning/30 text-warning hover:bg-warning/10"
                      onClick={() => window.location.reload()}
                    >
                      Refresh
                    </Button>
                    <Button
                      onClick={() => setActiveTab("organization")}
                      className="bg-warning hover:bg-warning/90 text-warning-foreground"
                    >
                      Create School
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card className="bg-primary/10 border-primary/20">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                      <Building2 className="h-5 w-5 text-primary-foreground" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground">
                        No Organization Found
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        Create your first school to get started
                      </p>
                    </div>
                  </div>
                  <Button
                    onClick={() => setActiveTab("organization")}
                    className="bg-primary hover:bg-primary/90 text-primary-foreground"
                  >
                    Create School
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Main Content */}
        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="space-y-6"
        >
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="organization">School</TabsTrigger>
            <TabsTrigger value="members">Members</TabsTrigger>
            <TabsTrigger value="courses">Courses</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Profile</CardTitle>
                  <CardDescription>Your account information</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div>
                      <span className="font-medium">Name:</span>{" "}
                      {session.user.name || "Not set"}
                    </div>
                    <div>
                      <span className="font-medium">Email:</span>{" "}
                      {session.user.email}
                    </div>
                    <div>
                      <span className="font-medium">Role:</span> Super User
                    </div>
                    {userOrganization && (
                      <div>
                        <span className="font-medium">School:</span>{" "}
                        {userOrganization.name}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Quick Actions</CardTitle>
                  <CardDescription>Common tasks</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {!userOrganization ? (
                      <Button
                        variant="outline"
                        className="w-full justify-start"
                        onClick={() => setActiveTab("organization")}
                      >
                        Create Organization
                      </Button>
                    ) : (
                      <>
                        <Button
                          variant="outline"
                          className="w-full justify-start"
                          onClick={() => setActiveTab("members")}
                        >
                          Manage Members
                        </Button>
                        <Button
                          variant="outline"
                          className="w-full justify-start"
                          onClick={() => setActiveTab("courses")}
                        >
                          Create Course
                        </Button>
                        <Button
                          variant="outline"
                          className="w-full justify-start"
                          onClick={() => setActiveTab("organization")}
                        >
                          Organization Settings
                        </Button>
                      </>
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Account</CardTitle>
                  <CardDescription>Manage your account</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button variant="outline" className="w-full">
                    Edit Profile
                  </Button>
                </CardContent>
              </Card>

              {userOrganization && (
                <Card>
                  <CardHeader>
                    <CardTitle>School Stats</CardTitle>
                    <CardDescription>
                      Your organization overview
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">
                          Subscription:
                        </span>
                        <Badge variant="outline" className="text-xs">
                          {userOrganization.subscriptionTier || "Basic"}
                        </Badge>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">
                          Created:
                        </span>
                        <span className="text-sm text-foreground">
                          {new Date(
                            userOrganization.createdAt,
                          ).toLocaleDateString()}
                        </span>
                      </div>
                      {userOrganization.schoolCode && (
                        <div className="flex justify-between">
                          <span className="text-sm text-muted-foreground">
                            School Code:
                          </span>
                          <span className="text-sm text-foreground font-mono">
                            {userOrganization.schoolCode}
                          </span>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>

          {/* Organization Tab */}
          <TabsContent value="organization" className="space-y-6">
            {!userOrganization ? (
              <Card>
                <CardHeader>
                  <CardTitle>Organization Management</CardTitle>
                  <CardDescription>
                    Create and manage your school organization
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {!showCreateSchool ? (
                    <div className="text-center py-8">
                      <h3 className="text-lg font-medium text-gray-900 mb-2">
                        Ready to create your school?
                      </h3>
                      <p className="text-gray-600 mb-4">
                        Set up your organization with teams, courses, and member
                        management
                      </p>
                      <Button onClick={() => setShowCreateSchool(true)}>
                        Create New School
                      </Button>
                    </div>
                  ) : (
                    <CreateSchoolForm
                      onSuccess={() => {
                        setShowCreateSchool(false);
                        setActiveTab("overview");
                        // Refresh organization data
                        window.location.reload();
                      }}
                    />
                  )}
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>School Information</CardTitle>
                    <CardDescription>
                      Manage your school organization settings
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <div>
                          <Label className="text-sm font-medium text-gray-700">
                            School Name
                          </Label>
                          <p className="text-lg font-semibold text-gray-900">
                            {userOrganization.name}
                          </p>
                        </div>
                        <div>
                          <Label className="text-sm font-medium text-gray-700">
                            URL Slug
                          </Label>
                          <p className="text-sm text-gray-600 font-mono">
                            {userOrganization.slug}
                          </p>
                        </div>
                        <div>
                          <Label className="text-sm font-medium text-gray-700">
                            Subscription Tier
                          </Label>
                          <Badge variant="outline">
                            {userOrganization.subscriptionTier || "Basic"}
                          </Badge>
                        </div>
                      </div>
                      <div className="space-y-4">
                        <div>
                          <Label className="text-sm font-medium text-gray-700">
                            School Code
                          </Label>
                          <p className="text-sm text-gray-600">
                            {userOrganization.schoolCode || "Not set"}
                          </p>
                        </div>
                        <div>
                          <Label className="text-sm font-medium text-gray-700">
                            Created
                          </Label>
                          <p className="text-sm text-gray-600">
                            {new Date(
                              userOrganization.createdAt,
                            ).toLocaleDateString()}
                          </p>
                        </div>
                        <div>
                          <Label className="text-sm font-medium text-gray-700">
                            Status
                          </Label>
                          <Badge className="bg-success/20 text-success border-success/30">
                            Active
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Quick Actions</CardTitle>
                    <CardDescription>Manage your organization</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Button
                        variant="outline"
                        onClick={() => setActiveTab("members")}
                        className="h-20 flex flex-col items-center justify-center space-y-2"
                      >
                        <Users className="h-6 w-6" />
                        <span>Manage Members</span>
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => setActiveTab("courses")}
                        className="h-20 flex flex-col items-center justify-center space-y-2"
                      >
                        <BookOpen className="h-6 w-6" />
                        <span>Manage Courses</span>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </TabsContent>

          {/* Members Tab */}
          <TabsContent value="members" className="space-y-6">
            {userOrganization ? (
              <MemberManagement
                organizationId={userOrganization.id}
                onSuccess={() => {
                  // Refresh data if needed
                }}
              />
            ) : (
              <Card>
                <CardContent className="text-center py-8">
                  <p className="text-muted-foreground mb-4">
                    {isLoadingOrg
                      ? "Loading organization..."
                      : "No organization found"}
                  </p>
                  {!isLoadingOrg && (
                    <Button onClick={() => setShowCreateSchool(true)}>
                      Create Organization
                    </Button>
                  )}
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Courses Tab */}
          <TabsContent value="courses" className="space-y-6">
            {!showCreateCourse ? (
              <Card>
                <CardHeader>
                  <CardTitle>Course Management</CardTitle>
                  <CardDescription>
                    Create and manage courses for your organization
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8">
                    <div className="w-16 h-16 bg-success/20 rounded-full flex items-center justify-center mx-auto mb-4">
                      <BookOpen className="h-8 w-8 text-success" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      Create Your First Course
                    </h3>
                    <p className="text-gray-600 mb-4">
                      Start building engaging learning experiences for your
                      students
                    </p>
                    <Button
                      className="bg-success hover:bg-success/90 text-success-foreground"
                      onClick={() => setShowCreateCourse(true)}
                    >
                      Create Course
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <CreateCourseForm
                onSuccess={() => {
                  setShowCreateCourse(false);
                  setActiveTab("overview");
                }}
                onCancel={() => setShowCreateCourse(false)}
              />
            )}
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Account Settings</CardTitle>
                <CardDescription>
                  Manage your preferences and security
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <Button variant="outline" className="w-full justify-start">
                    Change Password
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    Notification Preferences
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    Privacy Settings
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
