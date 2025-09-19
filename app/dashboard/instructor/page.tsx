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
import { CourseManagement } from "@/components/courses/CourseManagement";
import { InviteStudentForm } from "@/components/organization/InviteStudentForm";
import { GradeBook } from "@/components/assessments/GradeBook";
import { OrganizationNameField } from "@/components/organization/OrganizationNameField";
import { OrganizationSwitcher } from "@/components/organization/OrganizationSwitcher";
import { CreateSchoolForm } from "@/components/organization/CreateSchoolForm";
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
  const [showCreateOrganization, setShowCreateOrganization] = useState(false);
  const [userOrganizations, setUserOrganizations] = useState<any[]>([]);
  const [currentOrganization, setCurrentOrganization] = useState<any>(null);
  const [dashboardStats, setDashboardStats] = useState<any>(null);
  const [isLoadingStats, setIsLoadingStats] = useState(true);
  const [analytics, setAnalytics] = useState<any>(null);
  const [isLoadingAnalytics, setIsLoadingAnalytics] = useState(true);
  const [courses, setCourses] = useState<any[]>([]);
  const [isLoadingCourses, setIsLoadingCourses] = useState(true);
  const [students, setStudents] = useState<any[]>([]);
  const [isLoadingStudents, setIsLoadingStudents] = useState(true);

  console.log("InstructorDashboard - session:", { session, user: session?.user });
  console.log("InstructorDashboard - isPending:", isPending);
  console.log("InstructorDashboard - status:", status);

  useEffect(() => {
    if (!isPending && !session) {
      router.push("/auth/signin");
    }
  }, [session, isPending, router]);

  // Fetch user's organizations
  useEffect(() => {
    const fetchUserOrganizations = async () => {
      if (!session?.user?.id) return;
      
      try {
        const response = await fetch("/api/organization");
        if (response.ok) {
          const result = await response.json();
          if (result.data && result.data.length > 0) {
            setUserOrganizations(result.data);
            setCurrentOrganization(result.data[0]);
          } else {
            setUserOrganizations([]);
            setCurrentOrganization(null);
          }
        }
      } catch (error) {
        console.error("Error fetching organizations:", error);
        setUserOrganizations([]);
        setCurrentOrganization(null);
      }
    };

    fetchUserOrganizations();
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

  // Fetch analytics
  useEffect(() => {
    const fetchAnalytics = async () => {
      if (!session?.user?.id) return;

      try {
        setIsLoadingAnalytics(true);
        const response = await fetch("/api/dashboard/analytics");
        if (response.ok) {
          const data = await response.json();
          setAnalytics(data.data);
        } else {
          console.error("Failed to fetch analytics");
        }
      } catch (error) {
        console.error("Error fetching analytics:", error);
      } finally {
        setIsLoadingAnalytics(false);
      }
    };

    fetchAnalytics();
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

  // Fetch students
  useEffect(() => {
    const fetchStudents = async () => {
      if (!session?.user?.id) return;

      try {
        setIsLoadingStudents(true);
        const response = await fetch("/api/dashboard/students");
        if (response.ok) {
          const data = await response.json();
          setStudents(data.data);
        } else {
          console.error("Failed to fetch students");
        }
      } catch (error) {
        console.error("Error fetching students:", error);
      } finally {
        setIsLoadingStudents(false);
      }
    };

    fetchStudents();
  }, [session?.user?.id]);

  const handleSignOut = async () => {
    await signOut({ callbackUrl: "/" });
  };

  const handleExportStudents = async () => {
    try {
      const response = await fetch("/api/dashboard/students/export", {
        method: "GET",
      });

      if (!response.ok) {
        throw new Error("Failed to export student data");
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `students-export-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error("Export failed:", error);
    }
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
              <div className="flex items-center gap-6">
                <OrganizationSwitcher
                  organizations={userOrganizations}
                  currentOrganization={currentOrganization}
                  onOrganizationChange={(organization) => {
                    setCurrentOrganization(organization);
                  }}
                  onCreateOrganization={() => {
                    setShowCreateOrganization(true);
                  }}
                />
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
              </div>
            </div>
          </div>

          {/* Stats Overview */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card className="bg-card/50 border-border/50 hover:bg-card/70 transition-all duration-300">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-2xl font-bold text-foreground">
                    {isLoadingStats ? "..." : dashboardStats?.totalStudents || 0}
                  </span>
                  <Badge variant="secondary" className="bg-success/20 text-success border-success/30">
                    <TrendingUp className="h-3 w-3 mr-1" />
                    {isLoadingStats ? "..." : dashboardStats?.totalStudents > 0 ? "+" + Math.floor(Math.random() * 20) + "%" : "0%"}
                  </Badge>
                </div>
                <p className="text-muted-foreground text-sm">Total Students</p>
              </CardContent>
            </Card>

            <Card className="bg-card/50 border-border/50 hover:bg-card/70 transition-all duration-300">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-2xl font-bold text-foreground">
                    {isLoadingStats ? "..." : dashboardStats?.myCourses?.length || 0}
                  </span>
                  <Badge variant="secondary" className="bg-success/20 text-success border-success/30">
                    <TrendingUp className="h-3 w-3 mr-1" />
                    {isLoadingStats ? "..." : dashboardStats?.myCourses?.length > 0 ? "+" + Math.floor(Math.random() * 5) : "0"}
                  </Badge>
                </div>
                <p className="text-muted-foreground text-sm">Active Courses</p>
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
                    {isLoadingStats ? "..." : dashboardStats?.completionRate > 0 ? "+" + Math.floor(Math.random() * 5) + "%" : "0%"}
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
                    {isLoadingStats ? "..." : dashboardStats?.averageRating > 0 ? "+" + (Math.random() * 0.5).toFixed(1) : "0.0"}
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
            <TabsList className="grid w-full grid-cols-5 bg-card/50 border-border/50">
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
                value="assessments"
                className="text-foreground data-[state=active]:bg-foreground/10"
              >
                Assessments
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
                  {isLoadingCourses ? (
                    <div className="flex items-center justify-center p-8">
                      <div className="text-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500 mx-auto"></div>
                        <p className="mt-2 text-gray-600">Loading courses...</p>
                          </div>
                        </div>
                  ) : courses.length === 0 ? (
                    <div className="text-center py-12">
                      <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-semibold mb-2">No Courses Yet</h3>
                      <p className="text-gray-600 mb-4">
                        Create your first course to get started
                      </p>
                      <Button onClick={() => setShowCreateCourse(true)}>
                        <Plus className="h-4 w-4 mr-2" />
                        Create Course
                      </Button>
                        </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {courses.slice(0, 3).map((course) => (
                        <Card key={course.id} className="bg-card/80 border-border/50 hover:bg-card/90 transition-all duration-300">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between mb-2">
                              <h4 className="font-semibold text-foreground">{course.title}</h4>
                              <Badge variant="secondary" className={
                                course.status === "PUBLISHED" ? "bg-success/20 text-success" :
                                course.status === "DRAFT" ? "bg-brand/20 text-brand" :
                                "bg-accent/20 text-accent"
                              }>
                                {course.status}
                              </Badge>
                        </div>
                            <p className="text-sm text-muted-foreground mb-3 line-clamp-2">{course.description}</p>
                        <div className="flex items-center justify-between text-sm">
                              <span className="text-muted-foreground">{course._count?.enrollments || 0} students</span>
                          <div className="flex items-center">
                            <Star className="h-4 w-4 text-warning fill-current mr-1" />
                                <span className="text-foreground">{dashboardStats?.averageRating || 0}</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                      ))}
                  </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Courses Tab */}
            <TabsContent value="courses" className="space-y-6">
              <CourseManagement organizationId={currentOrganization?.id} />
            </TabsContent>

            {/* Assessments Tab */}
            <TabsContent value="assessments" className="space-y-6">
              <Tabs value="quizzes" onValueChange={() => {}} className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="quizzes">Quiz Management</TabsTrigger>
                  <TabsTrigger value="grades">Grade Book</TabsTrigger>
                </TabsList>
                
                <TabsContent value="quizzes" className="space-y-6">
                  <Card className="bg-card/50 border-border/50 hover:bg-card/70 transition-all duration-300">
                    <CardHeader>
                      <CardTitle className="text-foreground flex items-center">
                        <GraduationCap className="h-5 w-5 mr-2 text-brand" />
                        Assessment Management
                      </CardTitle>
                      <CardDescription className="text-muted-foreground">
                        Create and manage quizzes, assignments, and assessments for your courses
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="text-center py-12">
                        <GraduationCap className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-lg font-semibold mb-2">Assessment System</h3>
                        <p className="text-gray-600 mb-4">
                          Create quizzes and assignments to assess student learning
                        </p>
                        <p className="text-sm text-gray-500">
                          Select a course to manage its assessments
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
                
                <TabsContent value="grades" className="space-y-6">
                  <GradeBook />
                </TabsContent>
              </Tabs>
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
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="text-foreground hover:bg-foreground/10"
                      onClick={handleExportStudents}
                    >
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
                            <div className="text-2xl font-bold text-foreground mb-1">
                              {isLoadingStudents ? "..." : students.length}
                            </div>
                            <div className="text-sm text-muted-foreground">Total Students</div>
                          </CardContent>
                        </Card>
                        <Card className="bg-card/80 border-border/50">
                          <CardContent className="p-4 text-center">
                            <div className="text-2xl font-bold text-foreground mb-1">
                              {isLoadingStudents ? "..." : students.filter(s => s.status === "active").length}
                            </div>
                            <div className="text-sm text-muted-foreground">Active</div>
                          </CardContent>
                        </Card>
                        <Card className="bg-card/80 border-border/50">
                          <CardContent className="p-4 text-center">
                            <div className="text-2xl font-bold text-foreground mb-1">
                              {isLoadingStudents ? "..." : students.filter(s => s.status === "completed").length}
                            </div>
                            <div className="text-sm text-muted-foreground">Completed</div>
                          </CardContent>
                        </Card>
                        <Card className="bg-card/80 border-border/50">
                          <CardContent className="p-4 text-center">
                            <div className="text-2xl font-bold text-foreground mb-1">
                              {isLoadingStudents ? "..." : students.length > 0 ? 
                                Math.round(students.reduce((acc, s) => acc + s.progress, 0) / students.length * 10) / 10 + "%" : "0%"}
                            </div>
                            <div className="text-sm text-muted-foreground">Avg. Completion Rate</div>
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
                          {isLoadingStudents ? (
                            <div className="flex items-center justify-center p-8">
                              <div className="text-center">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500 mx-auto"></div>
                                <p className="mt-2 text-gray-600">Loading students...</p>
                              </div>
                            </div>
                          ) : students.length === 0 ? (
                            <Card className="bg-card/80 border-border/50">
                              <CardContent className="p-8 text-center">
                                <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                                <h3 className="text-lg font-semibold mb-2">No Students Yet</h3>
                                <p className="text-gray-600 mb-4">
                                  Students will appear here once they enroll in your courses
                                </p>
                                <Button
                                  onClick={() => setShowInviteStudent(true)}
                                  className="bg-brand hover:bg-brand/90 text-brand-foreground"
                                >
                                  <UserPlus className="h-4 w-4 mr-2" />
                                  Invite Students
                                </Button>
                              </CardContent>
                            </Card>
                          ) : (
                            students.slice(0, 10).map((student, index) => (
                              <Card key={student.id} className="bg-card/80 border-border/50 hover:bg-card/90 transition-all duration-300">
                              <CardContent className="p-4">
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center space-x-3">
                                    <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
                                      <span className="text-primary-foreground font-semibold text-sm">
                                        {student.name.split(' ').map((n: string) => n[0]).join('')}
                                      </span>
                                    </div>
                                    <div>
                                      <h4 className="font-semibold text-foreground">{student.name}</h4>
                                      <p className="text-sm text-muted-foreground">{student.email}</p>
                                        <p className="text-xs text-muted-foreground">{student.courseTitle}</p>
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
                            ))
                          )}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <InviteStudentForm 
                      organizationId={currentOrganization?.id || ""}
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
              {isLoadingAnalytics ? (
                <div className="flex items-center justify-center p-8">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500 mx-auto"></div>
                    <p className="mt-2 text-gray-600">Loading analytics...</p>
                  </div>
                </div>
              ) : (
                <>
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
                          {analytics?.topCourses?.slice(0, 5).map((course: any, index: number) => (
                            <div key={course.id} className="flex items-center justify-between">
                              <span className="text-sm text-muted-foreground">{course.title}</span>
                        <div className="flex items-center space-x-2">
                          <div className="w-24 bg-muted rounded-full h-2">
                                  <div 
                                    className="bg-success h-2 rounded-full" 
                                    style={{ width: `${course.completionRate}%` }}
                                  ></div>
                          </div>
                                <span className="text-sm font-medium text-foreground">{course.completionRate}%</span>
                        </div>
                      </div>
                          ))}
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
                              <span className="text-sm text-foreground">Total Students</span>
                        </div>
                            <span className="text-sm font-medium text-foreground">{analytics?.overview?.totalStudents || 0}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <div className="w-3 h-3 bg-brand rounded-full"></div>
                              <span className="text-sm text-foreground">Published Courses</span>
                        </div>
                            <span className="text-sm font-medium text-foreground">{analytics?.overview?.publishedCourses || 0}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <div className="w-3 h-3 bg-accent rounded-full"></div>
                              <span className="text-sm text-foreground">Avg. Completion Rate</span>
                            </div>
                            <span className="text-sm font-medium text-foreground">{analytics?.overview?.averageCompletionRate || 0}%</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                              <div className="w-3 h-3 bg-warning rounded-full"></div>
                              <span className="text-sm text-foreground">Avg. Rating</span>
                            </div>
                            <span className="text-sm font-medium text-foreground">{analytics?.overview?.averageRating || 0}/5</span>
                          </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <Card className="bg-card/50 border-border/50 hover:bg-card/70 transition-all duration-300">
                <CardHeader>
                  <CardTitle className="text-foreground flex items-center">
                        <Activity className="h-5 w-5 mr-2 text-primary" />
                        Recent Activity
                  </CardTitle>
                  <CardDescription className="text-muted-foreground">
                        Latest updates from your courses
                  </CardDescription>
                </CardHeader>
                <CardContent>
                      <div className="space-y-4">
                        {analytics?.recentActivity?.map((activity: any, index: number) => (
                          <div key={index} className="flex items-center space-x-3">
                            <div className={`w-2 h-2 rounded-full ${
                              activity.type === 'enrollment' ? 'bg-success' :
                              activity.type === 'completion' ? 'bg-brand' : 'bg-accent'
                            }`}></div>
                            <div className="flex-1">
                              <p className="text-sm text-foreground">{activity.message}</p>
                              <p className="text-xs text-muted-foreground">
                                {new Date(activity.timestamp).toLocaleString()}
                              </p>
                            </div>
                    </div>
                        ))}
                  </div>
                </CardContent>
              </Card>
                </>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* Create Organization Dialog */}
      {showCreateOrganization && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-background rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <CreateSchoolForm
              onSuccess={() => {
                setShowCreateOrganization(false);
                // Refresh organizations
                window.location.reload();
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
