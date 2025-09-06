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
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { authClient } from "@/lib/auth-client";

export default function StudentDashboard() {
  const router = useRouter();
  const { data: session, isPending, error } = authClient.useSession();
  const [activeTab, setActiveTab] = useState("overview");

  // Debug logging
  console.log("StudentDashboard - session:", session);
  console.log("StudentDashboard - isPending:", isPending);
  console.log("StudentDashboard - error:", error);

  useEffect(() => {
    if (!isPending && !session) {
      router.push("/auth/signin");
    }
  }, [session, isPending, router]);

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

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="w-16 h-16 bg-destructive rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-destructive-foreground font-bold text-2xl">!</span>
          </div>
          <div className="text-foreground text-lg">Error: {error.message}</div>
          <Button
            onClick={() => window.location.reload()}
            className="mt-4 bg-brand hover:bg-brand/90 text-brand-foreground"
          >
            Try Again
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
              <div className="text-right">
                <p className="text-sm text-muted-foreground">Learning Progress</p>
                <p className="text-lg font-semibold text-foreground">
                  Keep up the great work!
                </p>
              </div>
            </div>
          </div>

          {/* Stats Overview */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card className="bg-card/50 border-border/50 hover:bg-card/70 transition-all duration-300">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-2xl font-bold text-foreground">5</span>
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
                  <span className="text-2xl font-bold text-foreground">23</span>
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
                  <span className="text-2xl font-bold text-foreground">12h</span>
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
                  <span className="text-2xl font-bold text-foreground">8</span>
                  <Badge variant="secondary" className="bg-success/20 text-success border-success/30">
                    <Trophy className="h-3 w-3 mr-1" />
                    +2
                  </Badge>
                </div>
                <p className="text-muted-foreground text-sm">Achievements</p>
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
                    <div className="flex items-center space-x-3">
                      <div className="w-2 h-2 bg-success rounded-full"></div>
                      <div className="flex-1">
                        <p className="text-sm text-foreground">Completed "React Fundamentals" lesson 3</p>
                        <p className="text-xs text-muted-foreground">2 hours ago</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="w-2 h-2 bg-brand rounded-full"></div>
                      <div className="flex-1">
                        <p className="text-sm text-foreground">Started "JavaScript Basics" course</p>
                        <p className="text-xs text-muted-foreground">1 day ago</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="w-2 h-2 bg-accent rounded-full"></div>
                      <div className="flex-1">
                        <p className="text-sm text-foreground">Earned "First Steps" achievement</p>
                        <p className="text-xs text-muted-foreground">2 days ago</p>
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
                      Your learning schedule
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-2 h-2 bg-destructive rounded-full"></div>
                      <div className="flex-1">
                        <p className="text-sm text-foreground">Complete React assignment</p>
                        <p className="text-xs text-muted-foreground">Due tomorrow</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="w-2 h-2 bg-warning rounded-full"></div>
                      <div className="flex-1">
                        <p className="text-sm text-foreground">Review CSS concepts</p>
                        <p className="text-xs text-muted-foreground">Due in 3 days</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="w-2 h-2 bg-success rounded-full"></div>
                      <div className="flex-1">
                        <p className="text-sm text-foreground">Join study group session</p>
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
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <Card className="bg-card/80 border-border/50 hover:bg-card/90 transition-all duration-300">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-semibold text-foreground">React Fundamentals</h4>
                          <Badge variant="secondary" className="bg-success/20 text-success">In Progress</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mb-3">Learn the basics of React development</p>
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Progress</span>
                            <span className="text-foreground font-medium">65%</span>
                          </div>
                          <div className="w-full bg-muted rounded-full h-2">
                            <div className="bg-brand h-2 rounded-full" style={{ width: '65%' }}></div>
                          </div>
                        </div>
                        <div className="flex items-center justify-between mt-3">
                          <Button size="sm" className="bg-brand hover:bg-brand/90 text-brand-foreground">
                            <Play className="h-4 w-4 mr-1" />
                            Continue
                          </Button>
                          <Button variant="outline" size="sm" className="text-foreground hover:bg-foreground/10">
                            <Bookmark className="h-4 w-4" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="bg-card/80 border-border/50 hover:bg-card/90 transition-all duration-300">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-semibold text-foreground">JavaScript Basics</h4>
                          <Badge variant="secondary" className="bg-brand/20 text-brand">New</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mb-3">Introduction to JavaScript programming</p>
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Progress</span>
                            <span className="text-foreground font-medium">15%</span>
                          </div>
                          <div className="w-full bg-muted rounded-full h-2">
                            <div className="bg-brand h-2 rounded-full" style={{ width: '15%' }}></div>
                          </div>
                        </div>
                        <div className="flex items-center justify-between mt-3">
                          <Button size="sm" className="bg-brand hover:bg-brand/90 text-brand-foreground">
                            <Play className="h-4 w-4 mr-1" />
                            Start
                          </Button>
                          <Button variant="outline" size="sm" className="text-foreground hover:bg-foreground/10">
                            <Bookmark className="h-4 w-4" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="bg-card/80 border-border/50 hover:bg-card/90 transition-all duration-300">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-semibold text-foreground">Advanced CSS</h4>
                          <Badge variant="secondary" className="bg-accent/20 text-accent">Completed</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mb-3">Master advanced CSS techniques</p>
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Progress</span>
                            <span className="text-foreground font-medium">100%</span>
                          </div>
                          <div className="w-full bg-muted rounded-full h-2">
                            <div className="bg-success h-2 rounded-full" style={{ width: '100%' }}></div>
                          </div>
                        </div>
                        <div className="flex items-center justify-between mt-3">
                          <Button size="sm" variant="outline" className="text-foreground hover:bg-foreground/10">
                            <Eye className="h-4 w-4 mr-1" />
                            Review
                          </Button>
                          <Button variant="outline" size="sm" className="text-foreground hover:bg-foreground/10">
                            <Share2 className="h-4 w-4" />
                          </Button>
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
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">React Fundamentals</span>
                        <div className="flex items-center space-x-2">
                          <div className="w-24 bg-muted rounded-full h-2">
                            <div className="bg-success h-2 rounded-full" style={{ width: '65%' }}></div>
                          </div>
                          <span className="text-sm font-medium text-foreground">65%</span>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">JavaScript Basics</span>
                        <div className="flex items-center space-x-2">
                          <div className="w-24 bg-muted rounded-full h-2">
                            <div className="bg-brand h-2 rounded-full" style={{ width: '15%' }}></div>
                          </div>
                          <span className="text-sm font-medium text-foreground">15%</span>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Advanced CSS</span>
                        <div className="flex items-center space-x-2">
                          <div className="w-24 bg-muted rounded-full h-2">
                            <div className="bg-accent h-2 rounded-full" style={{ width: '100%' }}></div>
                          </div>
                          <span className="text-sm font-medium text-foreground">100%</span>
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
                        <span className="text-sm font-medium text-foreground">+23 this month</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <div className="w-3 h-3 bg-brand rounded-full"></div>
                          <span className="text-sm text-foreground">Study Time</span>
                        </div>
                        <span className="text-sm font-medium text-foreground">+12h this month</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <div className="w-3 h-3 bg-accent rounded-full"></div>
                          <span className="text-sm text-foreground">Streak Days</span>
                        </div>
                        <span className="text-sm font-medium text-foreground">7 days</span>
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
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <Card className="bg-card/50 border-border/50 hover:bg-card/70 transition-all duration-300">
                  <CardContent className="p-6 text-center">
                    <div className="w-16 h-16 bg-gradient-to-br from-amber-500/20 to-orange-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Trophy className="h-8 w-8 text-amber-500" />
                    </div>
                    <h3 className="text-lg font-semibold text-foreground mb-2">First Steps</h3>
                    <p className="text-sm text-muted-foreground mb-3">Complete your first lesson</p>
                    <Badge className="bg-success/20 text-success">Earned</Badge>
                  </CardContent>
                </Card>

                <Card className="bg-card/50 border-border/50 hover:bg-card/70 transition-all duration-300">
                  <CardContent className="p-6 text-center">
                    <div className="w-16 h-16 bg-gradient-to-br from-blue-500/20 to-cyan-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Medal className="h-8 w-8 text-blue-500" />
                    </div>
                    <h3 className="text-lg font-semibold text-foreground mb-2">Course Master</h3>
                    <p className="text-sm text-muted-foreground mb-3">Complete your first course</p>
                    <Badge className="bg-success/20 text-success">Earned</Badge>
                  </CardContent>
                </Card>

                <Card className="bg-card/50 border-border/50 hover:bg-card/70 transition-all duration-300">
                  <CardContent className="p-6 text-center">
                    <div className="w-16 h-16 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                      <BadgeIcon className="h-8 w-8 text-purple-500" />
                    </div>
                    <h3 className="text-lg font-semibold text-foreground mb-2">Streak Master</h3>
                    <p className="text-sm text-muted-foreground mb-3">Study for 7 consecutive days</p>
                    <Badge className="bg-brand/20 text-brand">In Progress</Badge>
                  </CardContent>
                </Card>
              </div>

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
