"use client";

import {
  BarChart3,
  BookOpen,
  GraduationCap,
  Plus,
  UserPlus,
  Users,
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
  Clock,
  Award,
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
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { CreateCourseForm } from "@/components/courses/CreateCourseForm";
import { InviteStudentForm } from "@/components/organization/InviteStudentForm";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useSession, signOut } from "next-auth/react";

export default function InstructorDashboard() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const isPending = status === "loading";
  const [activeTab, setActiveTab] = useState("overview");
  const [showCreateCourse, setShowCreateCourse] = useState(false);
  const [showInviteStudent, setShowInviteStudent] = useState(false);
  const [userOrganization, setUserOrganization] = useState<any>(null);

  console.log("InstructorDashboard - session:", { session, user: session?.user });
  console.log("InstructorDashboard - isPending:", isPending);
  console.log("InstructorDashboard - status:", status);

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
        const response = await fetch("/api/organization");
        if (response.ok) {
          const result = await response.json();
          if (result.data && result.data.length > 0) {
            setUserOrganization(result.data[0]);
          }
        }
      } catch (error) {
        console.error("Error fetching organization:", error);
      }
    };

    fetchUserOrganization();
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
            Loading Instructor Dashboard...
          </div>
        </div>
      </div>
    );
  }

  if (status === "unauthenticated" || !session) {
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
              <div>
                <h1 className="text-4xl font-bold text-foreground mb-2">
                  Instructor Dashboard
                </h1>
                <p className="text-xl text-muted-foreground mb-4">
                  Welcome back, {session.user.name || session.user.email}!
                </p>
                <Badge
                  variant="secondary"
                  className="bg-brand/20 text-brand border-brand/30"
                >
                  <GraduationCap className="h-4 w-4 mr-2" />
                  Instructor
                </Badge>
              </div>
              <div className="text-right">
                <p className="text-sm text-muted-foreground">Organization</p>
                <p className="text-lg font-semibold text-foreground">
                  {userOrganization?.name || "Loading..."}
                </p>
              </div>
            </div>
          </div>

          {/* Stats Overview */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card className="bg-card/50 border-border/50 hover:bg-card/70 transition-all duration-300">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-2xl font-bold text-foreground">247</span>
                  <Badge variant="secondary" className="bg-success/20 text-success border-success/30">
                    <TrendingUp className="h-3 w-3 mr-1" />
                    +12.5%
                  </Badge>
                </div>
                <p className="text-muted-foreground text-sm">Total Students</p>
              </CardContent>
            </Card>

            <Card className="bg-card/50 border-border/50 hover:bg-card/70 transition-all duration-300">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-2xl font-bold text-foreground">12</span>
                  <Badge variant="secondary" className="bg-success/20 text-success border-success/30">
                    <TrendingUp className="h-3 w-3 mr-1" />
                    +3
                  </Badge>
                </div>
                <p className="text-muted-foreground text-sm">Active Courses</p>
              </CardContent>
            </Card>

            <Card className="bg-card/50 border-border/50 hover:bg-card/70 transition-all duration-300">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-2xl font-bold text-foreground">94.2%</span>
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
                  <span className="text-2xl font-bold text-foreground">4.8</span>
                  <Badge variant="secondary" className="bg-success/20 text-success border-success/30">
                    <Star className="h-3 w-3 mr-1" />
                    +0.2
                  </Badge>
                </div>
                <p className="text-muted-foreground text-sm">Avg. Rating</p>
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
                Courses
              </TabsTrigger>
              <TabsTrigger
                value="students"
                className="text-foreground data-[state=active]:bg-foreground/10"
              >
                Students
              </TabsTrigger>
              <TabsTrigger
                value="analytics"
                className="text-foreground data-[state=active]:bg-foreground/10"
              >
                Analytics
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
                      Common tasks for instructors
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <Button
                      onClick={() => setShowCreateCourse(true)}
                      className="w-full bg-brand hover:bg-brand/90 text-brand-foreground"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Create New Course
                    </Button>
                    <Button
                      onClick={() => setShowInviteStudent(true)}
                      variant="outline"
                      className="w-full border-border/20 text-foreground hover:bg-foreground/10"
                    >
                      <UserPlus className="h-4 w-4 mr-2" />
                      Invite Students
                    </Button>
                    <Button
                      variant="outline"
                      className="w-full border-border/20 text-foreground hover:bg-foreground/10"
                    >
                      <FileText className="h-4 w-4 mr-2" />
                      View Reports
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
                      Latest updates from your courses
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-2 h-2 bg-success rounded-full"></div>
                      <div className="flex-1">
                        <p className="text-sm text-foreground">New student enrolled in "React Fundamentals"</p>
                        <p className="text-xs text-muted-foreground">2 hours ago</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="w-2 h-2 bg-brand rounded-full"></div>
                      <div className="flex-1">
                        <p className="text-sm text-foreground">Course "JavaScript Basics" completed by 5 students</p>
                        <p className="text-xs text-muted-foreground">4 hours ago</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="w-2 h-2 bg-accent rounded-full"></div>
                      <div className="flex-1">
                        <p className="text-sm text-foreground">New assignment submitted for review</p>
                        <p className="text-xs text-muted-foreground">6 hours ago</p>
                      </div>
                    </div>
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
                      Your schedule and deadlines
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-2 h-2 bg-destructive rounded-full"></div>
                      <div className="flex-1">
                        <p className="text-sm text-foreground">Grade assignments - Due tomorrow</p>
                        <p className="text-xs text-muted-foreground">12 assignments pending</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="w-2 h-2 bg-warning rounded-full"></div>
                      <div className="flex-1">
                        <p className="text-sm text-foreground">Course content review</p>
                        <p className="text-xs text-muted-foreground">Due in 3 days</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="w-2 h-2 bg-success rounded-full"></div>
                      <div className="flex-1">
                        <p className="text-sm text-foreground">Student feedback session</p>
                        <p className="text-xs text-muted-foreground">Next week</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Featured Courses */}
              <Card className="bg-card/50 border-border/50 hover:bg-card/70 transition-all duration-300">
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle className="text-foreground flex items-center">
                      <BookOpen className="h-5 w-5 mr-2 text-primary" />
                      Featured Courses
                    </CardTitle>
                    <CardDescription className="text-muted-foreground">
                      Your most popular and recent courses
                    </CardDescription>
                  </div>
                  <Button variant="outline" size="sm" className="text-foreground hover:bg-foreground/10">
                    View All
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <Card className="bg-card/80 border-border/50 hover:bg-card/90 transition-all duration-300">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-semibold text-foreground">React Fundamentals</h4>
                          <Badge variant="secondary" className="bg-success/20 text-success">Active</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mb-3">Learn the basics of React development</p>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">45 students</span>
                          <div className="flex items-center">
                            <Star className="h-4 w-4 text-warning fill-current mr-1" />
                            <span className="text-foreground">4.8</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="bg-card/80 border-border/50 hover:bg-card/90 transition-all duration-300">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-semibold text-foreground">JavaScript Basics</h4>
                          <Badge variant="secondary" className="bg-brand/20 text-brand">Draft</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mb-3">Introduction to JavaScript programming</p>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">0 students</span>
                          <div className="flex items-center">
                            <Star className="h-4 w-4 text-muted-foreground mr-1" />
                            <span className="text-muted-foreground">-</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="bg-card/80 border-border/50 hover:bg-card/90 transition-all duration-300">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-semibold text-foreground">Advanced CSS</h4>
                          <Badge variant="secondary" className="bg-accent/20 text-accent">Published</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mb-3">Master advanced CSS techniques</p>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">23 students</span>
                          <div className="flex items-center">
                            <Star className="h-4 w-4 text-warning fill-current mr-1" />
                            <span className="text-foreground">4.6</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
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
                      Course Management
                    </CardTitle>
                    <CardDescription className="text-muted-foreground">
                      Create and manage your courses
                    </CardDescription>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button variant="outline" size="sm" className="text-foreground hover:bg-foreground/10">
                      <Filter className="h-4 w-4 mr-2" />
                      Filter
                    </Button>
                    <Button
                      onClick={() => setShowCreateCourse(true)}
                      className="bg-brand hover:bg-brand/90 text-brand-foreground"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      New Course
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  {!showCreateCourse ? (
                    <div className="space-y-6">
                      {/* Course Stats */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <Card className="bg-card/80 border-border/50">
                          <CardContent className="p-4 text-center">
                            <div className="text-2xl font-bold text-foreground mb-1">12</div>
                            <div className="text-sm text-muted-foreground">Total Courses</div>
                          </CardContent>
                        </Card>
                        <Card className="bg-card/80 border-border/50">
                          <CardContent className="p-4 text-center">
                            <div className="text-2xl font-bold text-foreground mb-1">8</div>
                            <div className="text-sm text-muted-foreground">Published</div>
                          </CardContent>
                        </Card>
                        <Card className="bg-card/80 border-border/50">
                          <CardContent className="p-4 text-center">
                            <div className="text-2xl font-bold text-foreground mb-1">4</div>
                            <div className="text-sm text-muted-foreground">Drafts</div>
                          </CardContent>
                        </Card>
                      </div>

                      {/* Course List */}
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <h3 className="text-lg font-semibold text-foreground">Your Courses</h3>
                          <div className="flex items-center space-x-2">
                            <Button variant="outline" size="sm" className="text-foreground hover:bg-foreground/10">
                              <Search className="h-4 w-4 mr-2" />
                              Search
                            </Button>
                            <Button variant="outline" size="sm" className="text-foreground hover:bg-foreground/10">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                          <Card className="bg-card/80 border-border/50 hover:bg-card/90 transition-all duration-300">
                            <CardContent className="p-4">
                              <div className="flex items-center justify-between mb-3">
                                <h4 className="font-semibold text-foreground">React Fundamentals</h4>
                                <Badge variant="secondary" className="bg-success/20 text-success">Published</Badge>
                              </div>
                              <p className="text-sm text-muted-foreground mb-3">Learn the basics of React development with hands-on projects</p>
                              <div className="flex items-center justify-between text-sm mb-3">
                                <span className="text-muted-foreground">45 students</span>
                                <div className="flex items-center">
                                  <Star className="h-4 w-4 text-warning fill-current mr-1" />
                                  <span className="text-foreground">4.8</span>
                                </div>
                              </div>
                              <div className="flex items-center justify-between">
                                <Button variant="outline" size="sm" className="text-foreground hover:bg-foreground/10">
                                  <Eye className="h-4 w-4 mr-1" />
                                  View
                                </Button>
                                <Button variant="outline" size="sm" className="text-foreground hover:bg-foreground/10">
                                  <Settings className="h-4 w-4 mr-1" />
                                  Edit
                                </Button>
                              </div>
                            </CardContent>
                          </Card>

                          <Card className="bg-card/80 border-border/50 hover:bg-card/90 transition-all duration-300">
                            <CardContent className="p-4">
                              <div className="flex items-center justify-between mb-3">
                                <h4 className="font-semibold text-foreground">JavaScript Basics</h4>
                                <Badge variant="secondary" className="bg-brand/20 text-brand">Draft</Badge>
                              </div>
                              <p className="text-sm text-muted-foreground mb-3">Introduction to JavaScript programming concepts</p>
                              <div className="flex items-center justify-between text-sm mb-3">
                                <span className="text-muted-foreground">0 students</span>
                                <div className="flex items-center">
                                  <Star className="h-4 w-4 text-muted-foreground mr-1" />
                                  <span className="text-muted-foreground">-</span>
                                </div>
                              </div>
                              <div className="flex items-center justify-between">
                                <Button variant="outline" size="sm" className="text-foreground hover:bg-foreground/10">
                                  <Eye className="h-4 w-4 mr-1" />
                                  Preview
                                </Button>
                                <Button variant="outline" size="sm" className="text-foreground hover:bg-foreground/10">
                                  <Settings className="h-4 w-4 mr-1" />
                                  Edit
                                </Button>
                              </div>
                            </CardContent>
                          </Card>

                          <Card className="bg-card/80 border-border/50 hover:bg-card/90 transition-all duration-300">
                            <CardContent className="p-4">
                              <div className="flex items-center justify-between mb-3">
                                <h4 className="font-semibold text-foreground">Advanced CSS</h4>
                                <Badge variant="secondary" className="bg-accent/20 text-accent">Published</Badge>
                              </div>
                              <p className="text-sm text-muted-foreground mb-3">Master advanced CSS techniques and modern layouts</p>
                              <div className="flex items-center justify-between text-sm mb-3">
                                <span className="text-muted-foreground">23 students</span>
                                <div className="flex items-center">
                                  <Star className="h-4 w-4 text-warning fill-current mr-1" />
                                  <span className="text-foreground">4.6</span>
                                </div>
                              </div>
                              <div className="flex items-center justify-between">
                                <Button variant="outline" size="sm" className="text-foreground hover:bg-foreground/10">
                                  <Eye className="h-4 w-4 mr-1" />
                                  View
                                </Button>
                                <Button variant="outline" size="sm" className="text-foreground hover:bg-foreground/10">
                                  <Settings className="h-4 w-4 mr-1" />
                                  Edit
                                </Button>
                              </div>
                            </CardContent>
                          </Card>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <CreateCourseForm
                      onSuccess={() => {
                        setShowCreateCourse(false);
                        setActiveTab("overview");
                      }}
                      onCancel={() => setShowCreateCourse(false)}
                    />
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Students Tab */}
            <TabsContent value="students" className="space-y-6">
              <Card className="bg-card/50 border-border/50 hover:bg-card/70 transition-all duration-300">
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle className="text-foreground flex items-center">
                      <Users className="h-5 w-5 mr-2 text-success" />
                      Student Management
                    </CardTitle>
                    <CardDescription className="text-muted-foreground">
                      Manage your enrolled students and track their progress
                    </CardDescription>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button variant="outline" size="sm" className="text-foreground hover:bg-foreground/10">
                      <Download className="h-4 w-4 mr-2" />
                      Export
                    </Button>
                    <Button
                      onClick={() => setShowInviteStudent(true)}
                      className="bg-brand hover:bg-brand/90 text-brand-foreground"
                    >
                      <UserPlus className="h-4 w-4 mr-2" />
                      Invite Students
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  {!showInviteStudent ? (
                    <div className="space-y-6">
                      {/* Student Stats */}
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <Card className="bg-card/80 border-border/50">
                          <CardContent className="p-4 text-center">
                            <div className="text-2xl font-bold text-foreground mb-1">247</div>
                            <div className="text-sm text-muted-foreground">Total Students</div>
                          </CardContent>
                        </Card>
                        <Card className="bg-card/80 border-border/50">
                          <CardContent className="p-4 text-center">
                            <div className="text-2xl font-bold text-foreground mb-1">189</div>
                            <div className="text-sm text-muted-foreground">Active</div>
                          </CardContent>
                        </Card>
                        <Card className="bg-card/80 border-border/50">
                          <CardContent className="p-4 text-center">
                            <div className="text-2xl font-bold text-foreground mb-1">58</div>
                            <div className="text-sm text-muted-foreground">Completed</div>
                          </CardContent>
                        </Card>
                        <Card className="bg-card/80 border-border/50">
                          <CardContent className="p-4 text-center">
                            <div className="text-2xl font-bold text-foreground mb-1">94.2%</div>
                            <div className="text-sm text-muted-foreground">Completion Rate</div>
                          </CardContent>
                        </Card>
                      </div>

                      {/* Student List */}
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <h3 className="text-lg font-semibold text-foreground">Recent Students</h3>
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
                        </div>

                        <div className="space-y-3">
                          {[
                            { name: "Sarah Johnson", email: "sarah@example.com", course: "React Fundamentals", progress: 85, status: "active" },
                            { name: "Mike Chen", email: "mike@example.com", course: "JavaScript Basics", progress: 100, status: "completed" },
                            { name: "Emma Rodriguez", email: "emma@example.com", course: "Advanced CSS", progress: 60, status: "active" },
                            { name: "Alex Kim", email: "alex@example.com", course: "React Fundamentals", progress: 30, status: "active" },
                            { name: "Lisa Wang", email: "lisa@example.com", course: "JavaScript Basics", progress: 100, status: "completed" },
                          ].map((student, index) => (
                            <Card key={index} className="bg-card/80 border-border/50 hover:bg-card/90 transition-all duration-300">
                              <CardContent className="p-4">
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center space-x-3">
                                    <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
                                      <span className="text-primary-foreground font-semibold text-sm">
                                        {student.name.split(' ').map(n => n[0]).join('')}
                                      </span>
                                    </div>
                                    <div>
                                      <h4 className="font-semibold text-foreground">{student.name}</h4>
                                      <p className="text-sm text-muted-foreground">{student.email}</p>
                                      <p className="text-xs text-muted-foreground">{student.course}</p>
                                    </div>
                                  </div>
                                  <div className="flex items-center space-x-4">
                                    <div className="text-right">
                                      <div className="text-sm font-medium text-foreground">{student.progress}%</div>
                                      <div className="w-20 bg-muted rounded-full h-2">
                                        <div 
                                          className="bg-brand h-2 rounded-full" 
                                          style={{ width: `${student.progress}%` }}
                                        ></div>
                                      </div>
                                    </div>
                                    <Badge variant="secondary" className={
                                      student.status === 'completed' 
                                        ? "bg-success/20 text-success" 
                                        : "bg-brand/20 text-brand"
                                    }>
                                      {student.status}
                                    </Badge>
                                    <Button variant="outline" size="sm" className="text-foreground hover:bg-foreground/10">
                                      <MessageSquare className="h-4 w-4" />
                                    </Button>
                                  </div>
                                </div>
                              </CardContent>
                            </Card>
                          ))}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <InviteStudentForm 
                      organizationId={userOrganization?.id || ""}
                      onSuccess={() => {
                        setShowInviteStudent(false);
                        setActiveTab("overview");
                      }}
                    />
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Analytics Tab */}
            <TabsContent value="analytics" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card className="bg-card/50 border-border/50 hover:bg-card/70 transition-all duration-300">
                  <CardHeader>
                    <CardTitle className="text-foreground flex items-center">
                      <BarChart3 className="h-5 w-5 mr-2 text-accent" />
                      Course Performance
                    </CardTitle>
                    <CardDescription className="text-muted-foreground">
                      Track course completion and engagement metrics
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">React Fundamentals</span>
                        <div className="flex items-center space-x-2">
                          <div className="w-24 bg-muted rounded-full h-2">
                            <div className="bg-success h-2 rounded-full" style={{ width: '85%' }}></div>
                          </div>
                          <span className="text-sm font-medium text-foreground">85%</span>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">JavaScript Basics</span>
                        <div className="flex items-center space-x-2">
                          <div className="w-24 bg-muted rounded-full h-2">
                            <div className="bg-brand h-2 rounded-full" style={{ width: '72%' }}></div>
                          </div>
                          <span className="text-sm font-medium text-foreground">72%</span>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Advanced CSS</span>
                        <div className="flex items-center space-x-2">
                          <div className="w-24 bg-muted rounded-full h-2">
                            <div className="bg-accent h-2 rounded-full" style={{ width: '68%' }}></div>
                          </div>
                          <span className="text-sm font-medium text-foreground">68%</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-card/50 border-border/50 hover:bg-card/70 transition-all duration-300">
                  <CardHeader>
                    <CardTitle className="text-foreground flex items-center">
                      <TrendingUp className="h-5 w-5 mr-2 text-success" />
                      Learning Trends
                    </CardTitle>
                    <CardDescription className="text-muted-foreground">
                      Student engagement and progress over time
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <div className="w-3 h-3 bg-success rounded-full"></div>
                          <span className="text-sm text-foreground">Course Completions</span>
                        </div>
                        <span className="text-sm font-medium text-foreground">+23% this month</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <div className="w-3 h-3 bg-brand rounded-full"></div>
                          <span className="text-sm text-foreground">Student Engagement</span>
                        </div>
                        <span className="text-sm font-medium text-foreground">+15% this month</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <div className="w-3 h-3 bg-accent rounded-full"></div>
                          <span className="text-sm text-foreground">Assignment Submissions</span>
                        </div>
                        <span className="text-sm font-medium text-foreground">+8% this month</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <Card className="bg-card/50 border-border/50 hover:bg-card/70 transition-all duration-300">
                <CardHeader>
                  <CardTitle className="text-foreground flex items-center">
                    <Target className="h-5 w-5 mr-2 text-primary" />
                    Detailed Analytics
                  </CardTitle>
                  <CardDescription className="text-muted-foreground">
                    Comprehensive insights and performance metrics
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-12">
                    <div className="w-16 h-16 bg-gradient-to-br from-primary/20 to-brand/20 rounded-full flex items-center justify-center mx-auto mb-4">
                      <BarChart3 className="h-8 w-8 text-primary" />
                    </div>
                    <h3 className="text-lg font-medium text-foreground mb-2">
                      Advanced Analytics Coming Soon
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
          </Tabs>
        </div>
      </div>
    </div>
  );
}
