"use client";

import { 
  BookOpen, 
  Building2, 
  Users, 
  Settings, 
  BarChart3, 
  Zap, 
  Shield, 
  Crown,
  Plus,
  ArrowRight,
  Activity,
  Globe,
  Star,
  TrendingUp,
  Calendar,
  Bell,
  Search,
  Filter,
  MoreHorizontal,
  LogOut,
  Check,
  Target,
  Award,
  FileText,
  Download,
  Upload,
  Eye,
  MessageSquare,
  Clock,
  CheckCircle,
  TrendingDown,
  Headphones
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { CreateCourseForm } from "@/components/courses/CreateCourseForm";
import { CreateSchoolForm } from "@/components/organization/CreateSchoolForm";
import { OrganizationManagement } from "@/components/organization/OrganizationManagement";
import { OrganizationNameField } from "@/components/organization/OrganizationNameField";
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
import { Input } from "@/components/ui/input";
import { useSession, signOut } from "next-auth/react";

interface Organization {
  id: string;
  name: string;
  slug: string;
  subscriptionTier?: string;
  schoolCode?: string;
  createdAt: string;
  logo?: string;
  metadata?: any;
  createdBy: string;
}

export default function DashboardPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const isPending = status === "loading";
  const [activeTab, setActiveTab] = useState("overview");
  const [showCreateSchool, setShowCreateSchool] = useState(false);
  const [showCreateCourse, setShowCreateCourse] = useState(false);
  const [userOrganization, setUserOrganization] = useState<Organization | null>(
    null,
  );
  const [isLoadingOrg, setIsLoadingOrg] = useState(true);
  const [dashboardStats, setDashboardStats] = useState<any>(null);
  const [isLoadingStats, setIsLoadingStats] = useState(true);
  const [courses, setCourses] = useState<any[]>([]);
  const [isLoadingCourses, setIsLoadingCourses] = useState(true);

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
        
        // Fetch organizations using API call
        const response = await fetch("/api/organization");
        if (response.ok) {
          const data = await response.json();
          const organizations = data.data;
          console.log("Organization list result:", { organizations });

          if (organizations && organizations.length > 0) {
            console.log("Setting organization:", organizations[0]);
            // Map the organization data to match our interface
            const org = organizations[0];
            setUserOrganization({
              id: org.id,
              name: org.name,
              slug: org.slug,
              subscriptionTier: org.subscriptionTier || "basic",
              schoolCode: org.schoolCode,
              createdAt: org.createdAt,
              logo: org.logo || undefined,
              metadata: org.metadata,
              createdBy: org.createdBy,
            });
          } else {
            console.log("No organizations found for user");
          }
        } else {
          console.error("Failed to fetch organizations:", response.status);
        }
      } catch (error) {
        console.error("Error fetching organization:", error);
      } finally {
        setIsLoadingOrg(false);
      }
    };

    fetchUserOrganization();
  }, [session?.user?.id]);

  // Fetch dashboard statistics
  useEffect(() => {
    const fetchDashboardStats = async () => {
      if (!session?.user?.id) return;

      try {
        setIsLoadingStats(true);
        const response = await fetch("/api/dashboard/stats");
        if (response.ok) {
          const data = await response.json();
          setDashboardStats(data.data);
        } else {
          console.error("Failed to fetch dashboard stats");
        }
      } catch (error) {
        console.error("Error fetching dashboard stats:", error);
      } finally {
        setIsLoadingStats(false);
      }
    };

    fetchDashboardStats();
  }, [session?.user?.id]);

  // Fetch courses
  useEffect(() => {
    const fetchCourses = async () => {
      if (!session?.user?.id) return;

      try {
        setIsLoadingCourses(true);
        const response = await fetch("/api/dashboard/courses");
        if (response.ok) {
          const data = await response.json();
          setCourses(data.data);
        } else {
          console.error("Failed to fetch courses");
        }
      } catch (error) {
        console.error("Error fetching courses:", error);
      } finally {
        setIsLoadingCourses(false);
      }
    };

    fetchCourses();
  }, [session?.user?.id]);

  const handleSignOut = async () => {
    await signOut({ callbackUrl: "/" });
  };

  if (isPending) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="w-16 h-16 bg-brand rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-brand-foreground font-bold text-2xl">M</span>
          </div>
          <div className="text-foreground text-lg">
            Loading Super User Dashboard...
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
            <span className="text-destructive-foreground font-bold text-2xl">!</span>
          </div>
          <div className="text-foreground text-lg">Please sign in to continue</div>
          <Button
            onClick={() => router.push("/auth/signin")}
            className="mt-4 bg-brand hover:bg-brand/90 text-brand-foreground"
          >
            Sign In
          </Button>
        </div>
      </div>
    );
  }

  if (!session) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation Bar */}
      <nav className="flex items-center justify-between px-6 py-4 border-b border-border sticky top-0 z-50 bg-background/80 backdrop-blur-sm">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-brand rounded flex items-center justify-center">
            <span className="text-brand-foreground font-bold text-lg">M</span>
          </div>
          <span className="text-foreground text-xl font-semibold">MindFlow</span>
          <Badge className="bg-gradient-to-r from-amber-500 to-orange-500 text-white border-0 shadow-sm ml-2">
            <Crown className="h-3 w-3 mr-1" />
            Super User
          </Badge>
        </div>
        
        <div className="flex items-center space-x-4">
          <Button variant="ghost" size="sm" className="text-foreground hover:bg-accent">
            <Bell className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm" className="text-foreground hover:bg-accent">
            <Settings className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            onClick={handleSignOut}
            className="text-foreground hover:bg-accent"
          >
            <LogOut className="h-4 w-4 mr-2" />
            Sign Out
          </Button>
        </div>
      </nav>

      <div className="px-6 py-8">
        <div className="max-w-7xl mx-auto">
          {/* Header Section */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-6">
                <div>
                  <p className="text-sm text-muted-foreground mb-2">Organization</p>
                  {isLoadingOrg ? (
                    <p className="text-lg font-semibold text-foreground">Loading...</p>
                  ) : (
                    <OrganizationNameField
                      organizationId={userOrganization?.id}
                      organizationName={userOrganization?.name}
                      onUpdate={(newName) => {
                        setUserOrganization((prev: any) => prev ? { ...prev, name: newName } : null);
                      }}
                      onCreate={(organization) => {
                        setUserOrganization(organization);
                        setIsLoadingOrg(false);
                      }}
                    />
                  )}
                </div>
                <div>
                  <h1 className="text-4xl font-bold text-foreground mb-2">
                    Super User Dashboard
                  </h1>
                  <p className="text-xl text-muted-foreground mb-4">
                    Welcome back, {session.user.name || session.user.email}!
                  </p>
                  <Badge className="bg-gradient-to-r from-amber-500 to-orange-500 text-white border-0 shadow-sm">
                    <Crown className="h-4 w-4 mr-2" />
                    Super User
                  </Badge>
                </div>
              </div>
            </div>
          </div>

          {/* Stats Overview */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card className="bg-card/50 border-border/50 hover:bg-card/70 transition-all duration-300">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-2xl font-bold text-foreground">
                    {isLoadingStats ? "..." : dashboardStats?.totalUsers || 0}
                  </span>
                  <Badge variant="secondary" className="bg-success/20 text-success border-success/30">
                    <TrendingUp className="h-3 w-3 mr-1" />
                    +12.5%
                  </Badge>
                </div>
                <p className="text-muted-foreground text-sm">Total Users</p>
              </CardContent>
            </Card>

            <Card className="bg-card/50 border-border/50 hover:bg-card/70 transition-all duration-300">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-2xl font-bold text-foreground">
                    {isLoadingStats ? "..." : dashboardStats?.totalOrganizations || 0}
                  </span>
                  <Badge variant="secondary" className="bg-success/20 text-success border-success/30">
                    <TrendingUp className="h-3 w-3 mr-1" />
                    +8.2%
                  </Badge>
                </div>
                <p className="text-muted-foreground text-sm">Active Organizations</p>
              </CardContent>
            </Card>

            <Card className="bg-card/50 border-border/50 hover:bg-card/70 transition-all duration-300">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-2xl font-bold text-foreground">
                    {isLoadingStats ? "..." : `${dashboardStats?.completionRate || 0}%`}
                  </span>
                  <Badge variant="secondary" className="bg-success/20 text-success border-success/30">
                    <TrendingUp className="h-3 w-3 mr-1" />
                    +2.1%
                  </Badge>
                </div>
                <p className="text-muted-foreground text-sm">Completion Rate</p>
              </CardContent>
            </Card>

            <Card className="bg-card/50 border-border/50 hover:bg-card/70 transition-all duration-300">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-2xl font-bold text-foreground">
                    {isLoadingStats ? "..." : dashboardStats?.averageRating || 0}
                  </span>
                  <Badge variant="secondary" className="bg-success/20 text-success border-success/30">
                    <Star className="h-3 w-3 mr-1" />
                    +0.2
                  </Badge>
                </div>
                <p className="text-muted-foreground text-sm">Avg. Rating</p>
              </CardContent>
            </Card>
          </div>

          {/* Organization Information */}
          <div className="mb-6">
            {isLoadingOrg ? (
              <Card className="bg-card/50 border-border/50 hover:bg-card/70 transition-all duration-300">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-brand rounded-lg flex items-center justify-center">
                        <Building2 className="h-5 w-5 text-brand-foreground" />
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
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-brand"></div>
                  </div>
                </CardContent>
              </Card>
            ) : null}
          </div>

          {/* Main Content */}
          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className="space-y-6"
          >
            <TabsList className="grid w-full grid-cols-5 bg-card/50 border-border/50">
              <TabsTrigger
                value="overview"
                className="text-foreground data-[state=active]:bg-foreground/10"
              >
                Overview
              </TabsTrigger>
              <TabsTrigger
                value="organization"
                className="text-foreground data-[state=active]:bg-foreground/10"
              >
                School
              </TabsTrigger>
              <TabsTrigger
                value="members"
                className="text-foreground data-[state=active]:bg-foreground/10"
              >
                Members
              </TabsTrigger>
              <TabsTrigger
                value="courses"
                className="text-foreground data-[state=active]:bg-foreground/10"
              >
                Courses
              </TabsTrigger>
              <TabsTrigger
                value="settings"
                className="text-foreground data-[state=active]:bg-foreground/10"
              >
                Settings
              </TabsTrigger>
            </TabsList>

            {/* Overview Tab */}
            <TabsContent value="overview" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Quick Actions */}
                <Card className="bg-card/50 border-border/50 hover:bg-card/70 transition-all duration-300">
                  <CardHeader>
                    <CardTitle className="text-foreground flex items-center">
                      <Zap className="h-5 w-5 mr-2 text-brand" />
                      Quick Actions
                    </CardTitle>
                    <CardDescription className="text-muted-foreground">
                      Common administrative tasks
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {!userOrganization ? (
                      <Button
                        onClick={() => setActiveTab("organization")}
                        className="w-full bg-brand hover:bg-brand/90 text-brand-foreground"
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Create Organization
                      </Button>
                    ) : (
                      <>
                        <Button
                          onClick={() => setActiveTab("members")}
                          className="w-full bg-brand hover:bg-brand/90 text-brand-foreground"
                        >
                          <Users className="h-4 w-4 mr-2" />
                          Manage Members
                        </Button>
                        <Button
                          onClick={() => setActiveTab("courses")}
                          variant="outline"
                          className="w-full border-border/20 text-foreground hover:bg-foreground/10"
                        >
                          <BookOpen className="h-4 w-4 mr-2" />
                          Create Course
                        </Button>
                        <Button
                          onClick={() => setActiveTab("organization")}
                          variant="outline"
                          className="w-full border-border/20 text-foreground hover:bg-foreground/10"
                        >
                          <Settings className="h-4 w-4 mr-2" />
                          Organization Settings
                        </Button>
                      </>
                    )}
                  </CardContent>
                </Card>

                {/* System Status */}
                <Card className="bg-card/50 border-border/50 hover:bg-card/70 transition-all duration-300">
                  <CardHeader>
                    <CardTitle className="text-foreground flex items-center">
                      <Activity className="h-5 w-5 mr-2 text-success" />
                      System Status
                    </CardTitle>
                    <CardDescription className="text-muted-foreground">
                      Platform health and performance
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-2 h-2 bg-success rounded-full"></div>
                      <div className="flex-1">
                        <p className="text-sm text-foreground">All systems operational</p>
                        <p className="text-xs text-muted-foreground">Last checked 2 minutes ago</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="w-2 h-2 bg-success rounded-full"></div>
                      <div className="flex-1">
                        <p className="text-sm text-foreground">Database: Healthy</p>
                        <p className="text-xs text-muted-foreground">Response time: 12ms</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="w-2 h-2 bg-success rounded-full"></div>
                      <div className="flex-1">
                        <p className="text-sm text-foreground">API: Running</p>
                        <p className="text-xs text-muted-foreground">Uptime: 99.9%</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Recent Activity */}
                <Card className="bg-card/50 border-border/50 hover:bg-card/70 transition-all duration-300">
                  <CardHeader>
                    <CardTitle className="text-foreground flex items-center">
                      <Clock className="h-5 w-5 mr-2 text-accent" />
                      Recent Activity
                    </CardTitle>
                    <CardDescription className="text-muted-foreground">
                      Latest platform activities
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-2 h-2 bg-brand rounded-full"></div>
                      <div className="flex-1">
                        <p className="text-sm text-foreground">New organization created</p>
                        <p className="text-xs text-muted-foreground">1 hour ago</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="w-2 h-2 bg-success rounded-full"></div>
                      <div className="flex-1">
                        <p className="text-sm text-foreground">System backup completed</p>
                        <p className="text-xs text-muted-foreground">3 hours ago</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="w-2 h-2 bg-accent rounded-full"></div>
                      <div className="flex-1">
                        <p className="text-sm text-foreground">Security scan passed</p>
                        <p className="text-xs text-muted-foreground">6 hours ago</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Profile & Organization Info */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card className="bg-card/50 border-border/50 hover:bg-card/70 transition-all duration-300">
                  <CardHeader>
                    <CardTitle className="text-foreground flex items-center">
                      <Crown className="h-5 w-5 mr-2 text-amber-500" />
                      Profile Information
                    </CardTitle>
                    <CardDescription className="text-muted-foreground">
                      Your account details
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Name:</span>
                      <span className="text-sm text-foreground font-medium">
                        {session.user.name || "Not set"}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Email:</span>
                      <span className="text-sm text-foreground font-medium">
                        {session.user.email}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Role:</span>
                      <Badge className="bg-gradient-to-r from-amber-500 to-orange-500 text-white">
                        <Crown className="h-3 w-3 mr-1" />
                        Super User
                      </Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Last Sign-in:</span>
                      <Badge variant="outline" className="text-xs">
                        {(() => {
                          console.log("Debug - session.user.signInMethod:", session.user.signInMethod);
                          if (session.user.signInMethod === 'google') {
                            return (
                              <>
                                <svg className="w-3 h-3 mr-1" viewBox="0 0 24 24">
                                  <path
                                    fill="currentColor"
                                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                                  />
                                </svg>
                                Google
                              </>
                            );
                          }
                          if (session.user.signInMethod === 'github') {
                            return (
                              <>
                                <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 24 24">
                                  <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                                </svg>
                                GitHub
                              </>
                            );
                          }
                          if (session.user.signInMethod === 'credentials') {
                            return (
                              <>
                                <Shield className="h-3 w-3 mr-1" />
                                Email & Password
                              </>
                            );
                          }
                          return (
                            <>
                              <Shield className="h-3 w-3 mr-1" />
                              Email & Password (default)
                            </>
                          );
                        })()}
                      </Badge>
                    </div>
                    {userOrganization && (
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">School:</span>
                        <span className="text-sm text-foreground font-medium">
                          {userOrganization.name}
                        </span>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {userOrganization && (
                  <Card className="bg-card/50 border-border/50 hover:bg-card/70 transition-all duration-300">
                    <CardHeader>
                      <CardTitle className="text-foreground flex items-center">
                        <Building2 className="h-5 w-5 mr-2 text-primary" />
                        School Statistics
                      </CardTitle>
                      <CardDescription className="text-muted-foreground">
                        Organization overview
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Subscription:</span>
                        <Badge variant="outline" className="text-xs border-brand/30 text-brand">
                          {userOrganization.subscriptionTier || "Basic"}
                        </Badge>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Created:</span>
                        <span className="text-sm text-foreground font-medium">
                          {new Date(userOrganization.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      {userOrganization.schoolCode && (
                        <div className="flex justify-between">
                          <span className="text-sm text-muted-foreground">School Code:</span>
                          <span className="text-sm text-foreground font-mono font-medium">
                            {userOrganization.schoolCode}
                          </span>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )}
              </div>
            </TabsContent>

            {/* Organization Tab */}
            <TabsContent value="organization" className="space-y-6">
              {!userOrganization ? (
                <Card className="bg-card/50 border-border/50 hover:bg-card/70 transition-all duration-300">
                  <CardHeader>
                    <CardTitle className="text-foreground flex items-center">
                      <Building2 className="h-5 w-5 mr-2 text-primary" />
                      Organization Management
                    </CardTitle>
                    <CardDescription className="text-muted-foreground">
                      Create and manage your school organization
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {!showCreateSchool ? (
                      <div className="text-center py-12">
                        <div className="w-16 h-16 bg-gradient-to-br from-primary/20 to-brand/20 rounded-full flex items-center justify-center mx-auto mb-4">
                          <Building2 className="h-8 w-8 text-primary" />
                        </div>
                        <h3 className="text-lg font-medium text-foreground mb-2">
                          Ready to create your school?
                        </h3>
                        <p className="text-muted-foreground mb-4">
                          Set up your organization with teams, courses, and member
                          management
                        </p>
                        <Button 
                          onClick={() => setShowCreateSchool(true)}
                          className="bg-brand hover:bg-brand/90 text-brand-foreground"
                        >
                          <Plus className="h-4 w-4 mr-2" />
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
                <OrganizationManagement
                  organizationId={userOrganization.id}
                  onSuccess={() => {
                    // Refresh organization data
                    window.location.reload();
                  }}
                />
              )}
            </TabsContent>

            {/* Members Tab */}
            <TabsContent value="members" className="space-y-6">
              {userOrganization ? (
                <OrganizationManagement
                  organizationId={userOrganization.id}
                  onSuccess={() => {
                    // Refresh organization data
                    window.location.reload();
                  }}
                />
              ) : (
                <Card className="bg-card/50 border-border/50 hover:bg-card/70 transition-all duration-300">
                  <CardContent className="text-center py-12">
                    <div className="w-16 h-16 bg-gradient-to-br from-primary/20 to-brand/20 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Users className="h-8 w-8 text-primary" />
                    </div>
                    <h3 className="text-lg font-medium text-foreground mb-2">
                      {isLoadingOrg ? "Loading organization..." : "No organization found"}
                    </h3>
                    <p className="text-muted-foreground mb-4">
                      {isLoadingOrg 
                        ? "Please wait while we load your organization details"
                        : "Create an organization to start managing members"
                      }
                    </p>
                    {!isLoadingOrg && (
                      <Button 
                        onClick={() => setShowCreateSchool(true)}
                        className="bg-brand hover:bg-brand/90 text-brand-foreground"
                      >
                        <Plus className="h-4 w-4 mr-2" />
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
                <Card className="bg-card/50 border-border/50 hover:bg-card/70 transition-all duration-300">
                  <CardHeader>
                    <CardTitle className="text-foreground flex items-center">
                      <BookOpen className="h-5 w-5 mr-2 text-success" />
                      Course Management
                    </CardTitle>
                    <CardDescription className="text-muted-foreground">
                      Create and manage courses for your organization
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center py-12">
                      <div className="w-16 h-16 bg-gradient-to-br from-success/20 to-brand/20 rounded-full flex items-center justify-center mx-auto mb-4">
                        <BookOpen className="h-8 w-8 text-success" />
                      </div>
                      <h3 className="text-lg font-medium text-foreground mb-2">
                        Create Your First Course
                      </h3>
                      <p className="text-muted-foreground mb-4">
                        Start building engaging learning experiences for your
                        students
                      </p>
                      <Button
                        className="bg-brand hover:bg-brand/90 text-brand-foreground"
                        onClick={() => setShowCreateCourse(true)}
                      >
                        <Plus className="h-4 w-4 mr-2" />
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
              <Card className="bg-card/50 border-border/50 hover:bg-card/70 transition-all duration-300">
                <CardHeader>
                  <CardTitle className="text-foreground flex items-center">
                    <Settings className="h-5 w-5 mr-2 text-accent" />
                    Account Settings
                  </CardTitle>
                  <CardDescription className="text-muted-foreground">
                    Manage your preferences and security
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <Button 
                      variant="outline" 
                      className="w-full justify-start text-foreground hover:bg-foreground/10"
                    >
                      <Shield className="h-4 w-4 mr-2" />
                      Change Password
                    </Button>
                    <Button 
                      variant="outline" 
                      className="w-full justify-start text-foreground hover:bg-foreground/10"
                    >
                      <Bell className="h-4 w-4 mr-2" />
                      Notification Preferences
                    </Button>
                    <Button 
                      variant="outline" 
                      className="w-full justify-start text-foreground hover:bg-foreground/10"
                    >
                      <Globe className="h-4 w-4 mr-2" />
                      Privacy Settings
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
