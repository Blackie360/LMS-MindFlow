"use client";

import { 
  Award, 
  BarChart3, 
  BookOpen, 
  CheckCircle, 
  Clock,
  TrendingUp,
  TrendingDown,
  Check,
  Star,
  Zap,
  Shield,
  Headphones,
  Settings,
  ArrowRight,
  Calendar,
  Target,
  Activity,
  Eye,
  MessageSquare,
  FileText,
  Download,
  Upload,
  Filter,
  Search,
  MoreHorizontal,
  Bell,
  LogOut,
  Play,
  Pause,
  RefreshCw,
  Trophy,
  Medal,
  Badge as BadgeIcon,
  Users,
  Bookmark,
  Heart,
  Share2
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { OrganizationNameField } from "@/components/organization/OrganizationNameField";
import { OrganizationSwitcher } from "@/components/organization/OrganizationSwitcher";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useSession, signOut } from "next-auth/react";

export default function StudentDashboard() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const isPending = status === "loading";
  const [activeTab, setActiveTab] = useState("overview");
  const [dashboardStats, setDashboardStats] = useState<any>(null);
  const [isLoadingStats, setIsLoadingStats] = useState(true);
  const [courses, setCourses] = useState<any[]>([]);
  const [isLoadingCourses, setIsLoadingCourses] = useState(true);
  const [recentActivity, setRecentActivity] = useState<any[]>([]);
  const [isLoadingActivity, setIsLoadingActivity] = useState(true);
  const [upcomingTasks, setUpcomingTasks] = useState<any[]>([]);
  const [isLoadingTasks, setIsLoadingTasks] = useState(true);
  const [achievements, setAchievements] = useState<any[]>([]);
  const [isLoadingAchievements, setIsLoadingAchievements] = useState(true);
  const [userOrganizations, setUserOrganizations] = useState<any[]>([]);
  const [currentOrganization, setCurrentOrganization] = useState<any>(null);

  // Debug logging
  console.log("StudentDashboard - session:", session);
  console.log("StudentDashboard - isPending:", isPending);
  console.log("StudentDashboard - status:", status);

  useEffect(() => {
    if (!isPending && !session) {
      router.push("/auth/signin");
    }
  }, [session, isPending, router]);

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

  // Fetch recent activity
  useEffect(() => {
    const fetchRecentActivity = async () => {
      if (!session?.user?.id) return;

      try {
        setIsLoadingActivity(true);
        const response = await fetch("/api/dashboard/activity");
        if (response.ok) {
          const data = await response.json();
          setRecentActivity(data.data);
        } else {
          console.error("Failed to fetch recent activity");
        }
      } catch (error) {
        console.error("Error fetching recent activity:", error);
      } finally {
        setIsLoadingActivity(false);
      }
    };

    fetchRecentActivity();
  }, [session?.user?.id]);

  // Fetch upcoming tasks
  useEffect(() => {
    const fetchUpcomingTasks = async () => {
      if (!session?.user?.id) return;

      try {
        setIsLoadingTasks(true);
        const response = await fetch("/api/dashboard/tasks");
        if (response.ok) {
          const data = await response.json();
          setUpcomingTasks(data.data);
        } else {
          console.error("Failed to fetch upcoming tasks");
        }
      } catch (error) {
        console.error("Error fetching upcoming tasks:", error);
      } finally {
        setIsLoadingTasks(false);
      }
    };

    fetchUpcomingTasks();
  }, [session?.user?.id]);

  // Fetch achievements
  useEffect(() => {
    const fetchAchievements = async () => {
      if (!session?.user?.id) return;

      try {
        setIsLoadingAchievements(true);
        const response = await fetch("/api/dashboard/achievements");
        
        if (response.ok) {
          const data = await response.json();
          setAchievements(data.data || []);
        } else {
          const errorData = await response.json().catch(() => ({ error: "Unknown error" }));
          console.error("Failed to fetch achievements:", errorData.error || `HTTP ${response.status}`);
          // Set empty achievements array on error to prevent undefined issues
          setAchievements([]);
        }
      } catch (error) {
        console.error("Error fetching achievements:", error);
        // Set empty achievements array on error to prevent undefined issues
        setAchievements([]);
      } finally {
        setIsLoadingAchievements(false);
      }
    };

    fetchAchievements();
  }, [session?.user?.id]);

  // Fetch user organizations
  useEffect(() => {
    const fetchUserOrganizations = async () => {
      if (!session?.user?.id) return;

      try {
        const response = await fetch("/api/organization");
        if (response.ok) {
          const data = await response.json();
          if (data.data && data.data.length > 0) {
            setUserOrganizations(data.data);
            setCurrentOrganization(data.data[0]);
          } else {
            setUserOrganizations([]);
            setCurrentOrganization(null);
          }
        }
      } catch (error) {
        console.error("Error fetching user organizations:", error);
        setUserOrganizations([]);
        setCurrentOrganization(null);
      }
    };

    fetchUserOrganizations();
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
            Loading Student Dashboard...
          </div>
        </div>
      </div>
    );
  }

  // Check if student belongs to at least one organization
  if (!isPending && session && userOrganizations.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center max-w-md mx-auto p-6">
          <div className="w-16 h-16 bg-warning rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-warning-foreground font-bold text-2xl">!</span>
          </div>
          <h1 className="text-2xl font-bold text-foreground mb-2">
            No Organization Found
          </h1>
          <p className="text-muted-foreground mb-6">
            You need to be a member of at least one organization to access the student dashboard. 
            Please contact your instructor or administrator to be added to an organization.
          </p>
          <Button
            onClick={() => router.push("/auth/signout")}
            variant="outline"
          >
            Sign Out
          </Button>
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
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="w-16 h-16 bg-brand rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-brand-foreground font-bold text-2xl">M</span>
          </div>
          <div className="text-foreground text-lg">Loading Student Dashboard...</div>
          <div className="mt-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand mx-auto"></div>
          </div>
        </div>
      </div>
    );
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
                <OrganizationSwitcher
                  organizations={userOrganizations}
                  currentOrganization={currentOrganization}
                  onOrganizationChange={(organization) => {
                    setCurrentOrganization(organization);
                  }}
                  onCreateOrganization={() => {
                    // Students typically can't create organizations
                    console.log("Students cannot create organizations");
                  }}
                />
                <div>
                  <h1 className="text-4xl font-bold text-foreground mb-2">
                    Student Dashboard
                  </h1>
                  <p className="text-xl text-muted-foreground mb-4">
                    Welcome back, {session.user.name || session.user.email}!
                  </p>
                  <Badge
                    variant="secondary"
                    className="bg-brand/20 text-brand border-brand/30"
                  >
                    <Award className="h-4 w-4 mr-2" />
                    Student
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
                    {isLoadingStats ? "..." : dashboardStats?.enrolledCourses || 0}
                  </span>
                  <Badge variant="secondary" className="bg-success/20 text-success border-success/30">
                    <TrendingUp className="h-3 w-3 mr-1" />
                    +2
                  </Badge>
                </div>
                <p className="text-muted-foreground text-sm">Enrolled Courses</p>
              </CardContent>
            </Card>

            <Card className="bg-card/50 border-border/50 hover:bg-card/70 transition-all duration-300">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-2xl font-bold text-foreground">
                    {isLoadingStats ? "..." : dashboardStats?.completedLessons || 0}
                  </span>
                  <Badge variant="secondary" className="bg-success/20 text-success border-success/30">
                    <TrendingUp className="h-3 w-3 mr-1" />
                    +5
                  </Badge>
                </div>
                <p className="text-muted-foreground text-sm">Completed Lessons</p>
              </CardContent>
            </Card>

            <Card className="bg-card/50 border-border/50 hover:bg-card/70 transition-all duration-300">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-2xl font-bold text-foreground">
                    {isLoadingStats ? "..." : "12h"}
                  </span>
                  <Badge variant="secondary" className="bg-success/20 text-success border-success/30">
                    <TrendingUp className="h-3 w-3 mr-1" />
                    +3h
                  </Badge>
                </div>
                <p className="text-muted-foreground text-sm">Study Time</p>
              </CardContent>
            </Card>

            <Card className="bg-card/50 border-border/50 hover:bg-card/70 transition-all duration-300">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-2xl font-bold text-foreground">
                    {isLoadingStats ? "..." : `${dashboardStats?.progressPercentage || 0}%`}
                  </span>
                  <Badge variant="secondary" className="bg-success/20 text-success border-success/30">
                    <Trophy className="h-3 w-3 mr-1" />
                    +2
                  </Badge>
                </div>
                <p className="text-muted-foreground text-sm">Progress</p>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className="space-y-6"
          >
            <TabsList className="grid w-full grid-cols-4 bg-card/50 border-border/50">
              <TabsTrigger
                value="overview"
                className="text-foreground data-[state=active]:bg-foreground/10"
              >
                Overview
              </TabsTrigger>
              <TabsTrigger
                value="courses"
                className="text-foreground data-[state=active]:bg-foreground/10"
              >
                My Courses
              </TabsTrigger>
              <TabsTrigger
                value="progress"
                className="text-foreground data-[state=active]:bg-foreground/10"
              >
                Progress
              </TabsTrigger>
              <TabsTrigger
                value="achievements"
                className="text-foreground data-[state=active]:bg-foreground/10"
              >
                Achievements
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
                      Continue your learning journey
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <Button
                      onClick={() => setActiveTab("courses")}
                      className="w-full bg-brand hover:bg-brand/90 text-brand-foreground"
                    >
                      <BookOpen className="h-4 w-4 mr-2" />
                      Browse Courses
                    </Button>
                    <Button
                      onClick={() => setActiveTab("progress")}
                      variant="outline"
                      className="w-full border-border/20 text-foreground hover:bg-foreground/10"
                    >
                      <BarChart3 className="h-4 w-4 mr-2" />
                      View Progress
                    </Button>
                    <Button
                      variant="outline"
                      className="w-full border-border/20 text-foreground hover:bg-foreground/10"
                    >
                      <Bookmark className="h-4 w-4 mr-2" />
                      Saved Content
                    </Button>
                  </CardContent>
                </Card>

                {/* Recent Activity */}
                <Card className="bg-card/50 border-border/50 hover:bg-card/70 transition-all duration-300">
                  <CardHeader>
                    <CardTitle className="text-foreground flex items-center">
                      <Activity className="h-5 w-5 mr-2 text-success" />
                      Recent Activity
                    </CardTitle>
                    <CardDescription className="text-muted-foreground">
                      Your latest learning activities
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {isLoadingActivity ? (
                      <div className="space-y-3">
                        {[1, 2, 3].map((i) => (
                          <div key={i} className="flex items-center space-x-3">
                            <div className="w-2 h-2 bg-muted rounded-full animate-pulse"></div>
                            <div className="flex-1">
                              <div className="h-4 bg-muted rounded animate-pulse mb-1"></div>
                              <div className="h-3 bg-muted rounded w-20 animate-pulse"></div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : recentActivity.length > 0 ? (
                      recentActivity.slice(0, 3).map((activity, index) => (
                        <div key={activity.id || index} className="flex items-center space-x-3">
                          <div className={`w-2 h-2 rounded-full ${
                            activity.color === 'success' ? 'bg-success' :
                            activity.color === 'brand' ? 'bg-brand' :
                            activity.color === 'warning' ? 'bg-warning' :
                            'bg-accent'
                          }`}></div>
                          <div className="flex-1">
                            <p className="text-sm text-foreground">{activity.title}</p>
                            <p className="text-xs text-muted-foreground">
                              {new Date(activity.timestamp).toLocaleDateString() === new Date().toLocaleDateString() 
                                ? 'Today' 
                                : new Date(activity.timestamp).toLocaleDateString() === new Date(Date.now() - 86400000).toLocaleDateString()
                                ? 'Yesterday'
                                : `${Math.floor((Date.now() - new Date(activity.timestamp).getTime()) / (1000 * 60 * 60 * 24))} days ago`
                              }
                            </p>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-4">
                        <p className="text-sm text-muted-foreground">No recent activity</p>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Upcoming Tasks */}
                <Card className="bg-card/50 border-border/50 hover:bg-card/70 transition-all duration-300">
                  <CardHeader>
                    <CardTitle className="text-foreground flex items-center">
                      <Calendar className="h-5 w-5 mr-2 text-accent" />
                      Upcoming Tasks
                    </CardTitle>
                    <CardDescription className="text-muted-foreground">
                      Your learning schedule
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {isLoadingTasks ? (
                      <div className="space-y-3">
                        {[1, 2, 3].map((i) => (
                          <div key={i} className="flex items-center space-x-3">
                            <div className="w-2 h-2 bg-muted rounded-full animate-pulse"></div>
                            <div className="flex-1">
                              <div className="h-4 bg-muted rounded animate-pulse mb-1"></div>
                              <div className="h-3 bg-muted rounded w-20 animate-pulse"></div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : upcomingTasks.length > 0 ? (
                      upcomingTasks.slice(0, 3).map((task, index) => {
                        const dueDate = new Date(task.dueDate);
                        const now = new Date();
                        const diffTime = dueDate.getTime() - now.getTime();
                        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                        
                        let dueText = '';
                        let colorClass = '';
                        
                        if (diffDays < 0) {
                          dueText = 'Overdue';
                          colorClass = 'bg-destructive';
                        } else if (diffDays === 0) {
                          dueText = 'Due today';
                          colorClass = 'bg-destructive';
                        } else if (diffDays === 1) {
                          dueText = 'Due tomorrow';
                          colorClass = 'bg-warning';
                        } else if (diffDays <= 3) {
                          dueText = `Due in ${diffDays} days`;
                          colorClass = 'bg-warning';
                        } else {
                          dueText = `Due in ${diffDays} days`;
                          colorClass = 'bg-success';
                        }

                        return (
                          <div key={task.id || index} className="flex items-center space-x-3">
                            <div className={`w-2 h-2 rounded-full ${colorClass}`}></div>
                            <div className="flex-1">
                              <p className="text-sm text-foreground">{task.title}</p>
                              <p className="text-xs text-muted-foreground">{dueText}</p>
                            </div>
                          </div>
                        );
                      })
                    ) : (
                      <div className="text-center py-4">
                        <p className="text-sm text-muted-foreground">No upcoming tasks</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* Featured Courses */}
              <Card className="bg-card/50 border-border/50 hover:bg-card/70 transition-all duration-300">
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle className="text-foreground flex items-center">
                      <BookOpen className="h-5 w-5 mr-2 text-primary" />
                      My Courses
                    </CardTitle>
                    <CardDescription className="text-muted-foreground">
                      Continue where you left off
                    </CardDescription>
                  </div>
                  <Button variant="outline" size="sm" className="text-foreground hover:bg-foreground/10">
                    View All
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </CardHeader>
                <CardContent>
                  {isLoadingCourses ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {[1, 2, 3].map((i) => (
                        <Card key={i} className="bg-card/80 border-border/50">
                          <CardContent className="p-4">
                            <div className="space-y-3">
                              <div className="h-4 bg-muted rounded animate-pulse"></div>
                              <div className="h-3 bg-muted rounded w-20 animate-pulse"></div>
                              <div className="h-3 bg-muted rounded animate-pulse"></div>
                              <div className="h-2 bg-muted rounded animate-pulse"></div>
                              <div className="flex justify-between">
                                <div className="h-8 bg-muted rounded w-20 animate-pulse"></div>
                                <div className="h-8 bg-muted rounded w-8 animate-pulse"></div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  ) : courses.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {courses.slice(0, 3).map((course) => {
                        const progressPercentage = course.progressPercentage || 0;
                        const isCompleted = progressPercentage >= 100;
                        const isNew = progressPercentage === 0;
                        const isInProgress = progressPercentage > 0 && progressPercentage < 100;

                        return (
                          <Card key={course.id} className="bg-card/80 border-border/50 hover:bg-card/90 transition-all duration-300">
                            <CardContent className="p-4">
                              <div className="flex items-center justify-between mb-2">
                                <h4 className="font-semibold text-foreground truncate">{course.title}</h4>
                                <Badge 
                                  variant="secondary" 
                                  className={
                                    isCompleted ? "bg-success/20 text-success" :
                                    isNew ? "bg-brand/20 text-brand" :
                                    "bg-warning/20 text-warning"
                                  }
                                >
                                  {isCompleted ? "Completed" : isNew ? "New" : "In Progress"}
                                </Badge>
                              </div>
                              <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                                {course.description || "No description available"}
                              </p>
                              <div className="space-y-2">
                                <div className="flex justify-between text-sm">
                                  <span className="text-muted-foreground">Progress</span>
                                  <span className="text-foreground font-medium">{Math.round(progressPercentage)}%</span>
                                </div>
                                <div className="w-full bg-muted rounded-full h-2">
                                  <div 
                                    className={`h-2 rounded-full ${
                                      isCompleted ? 'bg-success' : 'bg-brand'
                                    }`} 
                                    style={{ width: `${Math.min(progressPercentage, 100)}%` }}
                                  ></div>
                                </div>
                              </div>
                              <div className="flex items-center justify-between mt-3">
                                <Button 
                                  size="sm" 
                                  className={
                                    isCompleted 
                                      ? "bg-muted hover:bg-muted/80 text-muted-foreground" 
                                      : "bg-brand hover:bg-brand/90 text-brand-foreground"
                                  }
                                >
                                  {isCompleted ? (
                                    <>
                                      <Eye className="h-4 w-4 mr-1" />
                                      Review
                                    </>
                                  ) : (
                                    <>
                                      <Play className="h-4 w-4 mr-1" />
                                      {isNew ? "Start" : "Continue"}
                                    </>
                                  )}
                                </Button>
                                <Button variant="outline" size="sm" className="text-foreground hover:bg-foreground/10">
                                  {isCompleted ? (
                                    <Share2 className="h-4 w-4" />
                                  ) : (
                                    <Bookmark className="h-4 w-4" />
                                  )}
                                </Button>
                              </div>
                            </CardContent>
                          </Card>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <div className="w-16 h-16 bg-gradient-to-br from-primary/20 to-brand/20 rounded-full flex items-center justify-center mx-auto mb-4">
                        <BookOpen className="h-8 w-8 text-primary" />
                      </div>
                      <h3 className="text-lg font-medium text-foreground mb-2">
                        No courses enrolled yet
                      </h3>
                      <p className="text-muted-foreground mb-4">
                        You'll see your enrolled courses here once you join a course
                      </p>
                      <Button className="bg-brand hover:bg-brand/90 text-brand-foreground">
                        <BookOpen className="h-4 w-4 mr-2" />
                        Browse Available Courses
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Courses Tab */}
            <TabsContent value="courses" className="space-y-6">
              <Card className="bg-card/50 border-border/50 hover:bg-card/70 transition-all duration-300">
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle className="text-foreground flex items-center">
                      <BookOpen className="h-5 w-5 mr-2 text-primary" />
                      My Courses
                    </CardTitle>
                    <CardDescription className="text-muted-foreground">
                      Courses you're enrolled in
                    </CardDescription>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button variant="outline" size="sm" className="text-foreground hover:bg-foreground/10">
                      <Search className="h-4 w-4 mr-2" />
                      Search
                    </Button>
                    <Button variant="outline" size="sm" className="text-foreground hover:bg-foreground/10">
                      <Filter className="h-4 w-4 mr-2" />
                      Filter
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  {isLoadingCourses ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {[1, 2, 3, 4, 5, 6].map((i) => (
                        <Card key={i} className="bg-card/80 border-border/50">
                          <CardContent className="p-4">
                            <div className="space-y-3">
                              <div className="h-4 bg-muted rounded animate-pulse"></div>
                              <div className="h-3 bg-muted rounded w-20 animate-pulse"></div>
                              <div className="h-3 bg-muted rounded animate-pulse"></div>
                              <div className="h-2 bg-muted rounded animate-pulse"></div>
                              <div className="flex justify-between">
                                <div className="h-8 bg-muted rounded w-20 animate-pulse"></div>
                                <div className="h-8 bg-muted rounded w-8 animate-pulse"></div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  ) : courses.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {courses.map((course) => {
                        const progressPercentage = course.progressPercentage || 0;
                        const isCompleted = progressPercentage >= 100;
                        const isNew = progressPercentage === 0;
                        const isInProgress = progressPercentage > 0 && progressPercentage < 100;

                        return (
                          <Card key={course.id} className="bg-card/80 border-border/50 hover:bg-card/90 transition-all duration-300">
                            <CardContent className="p-4">
                              <div className="flex items-center justify-between mb-2">
                                <h4 className="font-semibold text-foreground truncate">{course.title}</h4>
                                <Badge 
                                  variant="secondary" 
                                  className={
                                    isCompleted ? "bg-success/20 text-success" :
                                    isNew ? "bg-brand/20 text-brand" :
                                    "bg-warning/20 text-warning"
                                  }
                                >
                                  {isCompleted ? "Completed" : isNew ? "New" : "In Progress"}
                                </Badge>
                              </div>
                              <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                                {course.description || "No description available"}
                              </p>
                              <div className="space-y-2">
                                <div className="flex justify-between text-sm">
                                  <span className="text-muted-foreground">Progress</span>
                                  <span className="text-foreground font-medium">{Math.round(progressPercentage)}%</span>
                                </div>
                                <div className="w-full bg-muted rounded-full h-2">
                                  <div 
                                    className={`h-2 rounded-full ${
                                      isCompleted ? 'bg-success' : 'bg-brand'
                                    }`} 
                                    style={{ width: `${Math.min(progressPercentage, 100)}%` }}
                                  ></div>
                                </div>
                              </div>
                              <div className="flex items-center justify-between mt-3">
                                <Button 
                                  size="sm" 
                                  className={
                                    isCompleted 
                                      ? "bg-muted hover:bg-muted/80 text-muted-foreground" 
                                      : "bg-brand hover:bg-brand/90 text-brand-foreground"
                                  }
                                >
                                  {isCompleted ? (
                                    <>
                                      <Eye className="h-4 w-4 mr-1" />
                                      Review
                                    </>
                                  ) : (
                                    <>
                                      <Play className="h-4 w-4 mr-1" />
                                      {isNew ? "Start" : "Continue"}
                                    </>
                                  )}
                                </Button>
                                <Button variant="outline" size="sm" className="text-foreground hover:bg-foreground/10">
                                  {isCompleted ? (
                                    <Share2 className="h-4 w-4" />
                                  ) : (
                                    <Bookmark className="h-4 w-4" />
                                  )}
                                </Button>
                              </div>
                            </CardContent>
                          </Card>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <div className="w-16 h-16 bg-gradient-to-br from-primary/20 to-brand/20 rounded-full flex items-center justify-center mx-auto mb-4">
                        <BookOpen className="h-8 w-8 text-primary" />
                      </div>
                      <h3 className="text-lg font-medium text-foreground mb-2">
                        No courses enrolled yet
                      </h3>
                      <p className="text-muted-foreground mb-4">
                        You'll see your enrolled courses here once you join a course
                      </p>
                      <Button
                        className="bg-brand hover:bg-brand/90 text-brand-foreground"
                      >
                        <BookOpen className="h-4 w-4 mr-2" />
                        Browse Available Courses
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Progress Tab */}
            <TabsContent value="progress" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card className="bg-card/50 border-border/50 hover:bg-card/70 transition-all duration-300">
                  <CardHeader>
                    <CardTitle className="text-foreground flex items-center">
                      <BarChart3 className="h-5 w-5 mr-2 text-accent" />
                      Learning Progress
                    </CardTitle>
                    <CardDescription className="text-muted-foreground">
                      Track your learning achievements
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {isLoadingCourses ? (
                      <div className="space-y-4">
                        {[1, 2, 3].map((i) => (
                          <div key={i} className="flex items-center justify-between">
                            <div className="h-4 bg-muted rounded w-32 animate-pulse"></div>
                            <div className="flex items-center space-x-2">
                              <div className="w-24 bg-muted rounded-full h-2 animate-pulse"></div>
                              <div className="h-4 bg-muted rounded w-8 animate-pulse"></div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : courses.length > 0 ? (
                      <div className="space-y-4">
                        {courses.map((course) => {
                          const progressPercentage = course.progressPercentage || 0;
                          const isCompleted = progressPercentage >= 100;
                          
                          return (
                            <div key={course.id} className="flex items-center justify-between">
                              <span className="text-sm text-muted-foreground truncate max-w-32">
                                {course.title}
                              </span>
                              <div className="flex items-center space-x-2">
                                <div className="w-24 bg-muted rounded-full h-2">
                                  <div 
                                    className={`h-2 rounded-full ${
                                      isCompleted ? 'bg-success' : 'bg-brand'
                                    }`} 
                                    style={{ width: `${Math.min(progressPercentage, 100)}%` }}
                                  ></div>
                                </div>
                                <span className="text-sm font-medium text-foreground">
                                  {Math.round(progressPercentage)}%
                                </span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <p className="text-sm text-muted-foreground">No course progress to display</p>
                      </div>
                    )}
                  </CardContent>
                </Card>

                <Card className="bg-card/50 border-border/50 hover:bg-card/70 transition-all duration-300">
                  <CardHeader>
                    <CardTitle className="text-foreground flex items-center">
                      <TrendingUp className="h-5 w-5 mr-2 text-success" />
                      Learning Trends
                    </CardTitle>
                    <CardDescription className="text-muted-foreground">
                      Your learning momentum
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <div className="w-3 h-3 bg-success rounded-full"></div>
                          <span className="text-sm text-foreground">Lessons Completed</span>
                        </div>
                        <span className="text-sm font-medium text-foreground">
                          {isLoadingStats ? "..." : dashboardStats?.completedLessons || 0}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <div className="w-3 h-3 bg-brand rounded-full"></div>
                          <span className="text-sm text-foreground">Study Time</span>
                        </div>
                        <span className="text-sm font-medium text-foreground">
                          {isLoadingStats ? "..." : "12h"} {/* Placeholder - would need study time tracking */}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <div className="w-3 h-3 bg-accent rounded-full"></div>
                          <span className="text-sm text-foreground">Streak Days</span>
                        </div>
                        <span className="text-sm font-medium text-foreground">
                          {isLoadingStats ? "..." : "7 days"} {/* Placeholder - would need streak calculation */}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <Card className="bg-card/50 border-border/50 hover:bg-card/70 transition-all duration-300">
                <CardHeader>
                  <CardTitle className="text-foreground flex items-center">
                    <Target className="h-5 w-5 mr-2 text-primary" />
                    Detailed Progress
                  </CardTitle>
                  <CardDescription className="text-muted-foreground">
                    Comprehensive learning analytics
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-12">
                    <div className="w-16 h-16 bg-gradient-to-br from-primary/20 to-brand/20 rounded-full flex items-center justify-center mx-auto mb-4">
                      <BarChart3 className="h-8 w-8 text-primary" />
                    </div>
                    <h3 className="text-lg font-medium text-foreground mb-2">
                      Advanced Progress Tracking Coming Soon
                    </h3>
                    <p className="text-muted-foreground mb-4">
                      Detailed analytics, charts, and insights will be available here
                    </p>
                    <Button className="bg-brand hover:bg-brand/90 text-brand-foreground">
                      <Bell className="h-4 w-4 mr-2" />
                      Notify Me When Available
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Achievements Tab */}
            <TabsContent value="achievements" className="space-y-6">
              {isLoadingAchievements ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {[1, 2, 3, 4, 5, 6].map((i) => (
                    <Card key={i} className="bg-card/50 border-border/50">
                      <CardContent className="p-6 text-center">
                        <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse"></div>
                        <div className="h-6 bg-muted rounded animate-pulse mb-2"></div>
                        <div className="h-4 bg-muted rounded animate-pulse mb-3"></div>
                        <div className="h-6 bg-muted rounded w-20 mx-auto animate-pulse"></div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : achievements.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {achievements.map((achievement) => {
                    const isEarned = achievement.status === "earned";
                    const colorClasses = {
                      amber: "from-amber-500/20 to-orange-500/20 text-amber-500",
                      blue: "from-blue-500/20 to-cyan-500/20 text-blue-500",
                      purple: "from-purple-500/20 to-pink-500/20 text-purple-500",
                      green: "from-green-500/20 to-emerald-500/20 text-green-500",
                      indigo: "from-indigo-500/20 to-blue-500/20 text-indigo-500",
                      gold: "from-yellow-500/20 to-amber-500/20 text-yellow-500"
                    };
                    
                    const iconMap = {
                      trophy: Trophy,
                      medal: Medal,
                      badge: BadgeIcon,
                      "book-open": BookOpen,
                      "graduation-cap": Award,
                      award: Award
                    };
                    
                    const IconComponent = iconMap[achievement.icon as keyof typeof iconMap] || Trophy;
                    const colorClass = colorClasses[achievement.color as keyof typeof colorClasses] || colorClasses.amber;

                    return (
                      <Card key={achievement.id} className="bg-card/50 border-border/50 hover:bg-card/70 transition-all duration-300">
                        <CardContent className="p-6 text-center">
                          <div className={`w-16 h-16 bg-gradient-to-br ${colorClass.split(' ')[0]} ${colorClass.split(' ')[1]} rounded-full flex items-center justify-center mx-auto mb-4`}>
                            <IconComponent className={`h-8 w-8 ${colorClass.split(' ')[2]}`} />
                          </div>
                          <h3 className="text-lg font-semibold text-foreground mb-2">{achievement.title}</h3>
                          <p className="text-sm text-muted-foreground mb-3">{achievement.description}</p>
                          <div className="space-y-2">
                            <Badge 
                              className={
                                isEarned 
                                  ? "bg-success/20 text-success" 
                                  : "bg-brand/20 text-brand"
                              }
                            >
                              {isEarned ? "Earned" : "In Progress"}
                            </Badge>
                            {!isEarned && (
                              <div className="text-xs text-muted-foreground">
                                {achievement.progress}/{achievement.maxProgress}
                              </div>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-gradient-to-br from-amber-500/20 to-orange-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Award className="h-8 w-8 text-amber-500" />
                  </div>
                  <h3 className="text-lg font-medium text-foreground mb-2">
                    No achievements yet
                  </h3>
                  <p className="text-muted-foreground mb-4">
                    Complete courses and lessons to unlock achievements
                  </p>
                </div>
              )}

              <Card className="bg-card/50 border-border/50 hover:bg-card/70 transition-all duration-300">
                <CardHeader>
                  <CardTitle className="text-foreground flex items-center">
                    <Award className="h-5 w-5 mr-2 text-amber-500" />
                    Achievement Gallery
                  </CardTitle>
                  <CardDescription className="text-muted-foreground">
                    Celebrate your learning milestones
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-12">
                    <div className="w-16 h-16 bg-gradient-to-br from-amber-500/20 to-orange-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Award className="h-8 w-8 text-amber-500" />
                    </div>
                    <h3 className="text-lg font-medium text-foreground mb-2">
                      More Achievements Coming Soon
                    </h3>
                    <p className="text-muted-foreground mb-4">
                      Complete more courses and lessons to unlock new achievements and badges
                    </p>
                    <Button className="bg-brand hover:bg-brand/90 text-brand-foreground">
                      <BookOpen className="h-4 w-4 mr-2" />
                      Continue Learning
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
