"use client";

import { Award, BarChart3, BookOpen, CheckCircle, Clock } from "lucide-react";
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
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-blue-50">
        <div className="text-center">
          <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-primary-foreground font-bold text-2xl">🎓</span>
          </div>
          <div className="text-foreground text-lg">Loading Student Dashboard...</div>
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
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-primary-foreground font-bold text-2xl">
              🎓
            </span>
          </div>
          <div className="text-foreground text-lg">Loading Student Dashboard...</div>
          <div className="mt-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold text-foreground">
                Student Dashboard
              </h1>
              <p className="mt-2 text-muted-foreground">
                Welcome back, {session.user.name || session.user.email}!
              </p>
              <div className="mt-2">
                <Badge
                  variant="secondary"
                  className="bg-primary/20 text-primary border-primary/30"
                >
                  <Award className="h-4 w-4 mr-2" />
                  Student
                </Badge>
              </div>
            </div>
            <Button
              variant="outline"
              onClick={handleSignOut}
              className="border-border/20 text-foreground hover:bg-foreground/10"
            >
              Sign Out
            </Button>
          </div>
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
              className="text-foreground data-[state=active]:bg-primary/20 data-[state=active]:text-primary"
            >
              Overview
            </TabsTrigger>
            <TabsTrigger
              value="courses"
              className="text-foreground data-[state=active]:bg-primary/20 data-[state=active]:text-primary"
            >
              My Courses
            </TabsTrigger>
            <TabsTrigger
              value="progress"
              className="text-foreground data-[state=active]:bg-primary/20 data-[state=active]:text-primary"
            >
              Progress
            </TabsTrigger>
            <TabsTrigger
              value="achievements"
              className="text-foreground data-[state=active]:bg-primary/20 data-[state=active]:text-primary"
            >
              Achievements
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="bg-card/50 border-border/50 hover:bg-card/70 transition-all duration-300">
                <CardHeader>
                  <CardTitle className="text-foreground">Learning Summary</CardTitle>
                  <CardDescription className="text-muted-foreground">
                    Your current learning status
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <BookOpen className="h-5 w-5 text-primary" />
                      <span className="text-foreground">Enrolled Courses</span>
                    </div>
                    <Badge
                      variant="outline"
                      className="border-border/20 text-foreground"
                    >
                      0
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <CheckCircle className="h-5 w-5 text-green-500" />
                      <span className="text-foreground">Completed Lessons</span>
                    </div>
                    <Badge
                      variant="outline"
                      className="border-border/20 text-foreground"
                    >
                      0
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <Clock className="h-5 w-5 text-orange-500" />
                      <span className="text-foreground">Study Time</span>
                    </div>
                    <Badge
                      variant="outline"
                      className="border-border/20 text-foreground"
                    >
                      0h
                    </Badge>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-card/50 border-border/50 hover:bg-card/70 transition-all duration-300">
                <CardHeader>
                  <CardTitle className="text-foreground">Quick Actions</CardTitle>
                  <CardDescription className="text-muted-foreground">
                    Continue your learning journey
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button
                    onClick={() => setActiveTab("courses")}
                    className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
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
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Courses Tab */}
          <TabsContent value="courses" className="space-y-6">
            <Card className="bg-card/50 border-border/50 hover:bg-card/70 transition-all duration-300">
              <CardHeader>
                <CardTitle className="text-foreground">My Courses</CardTitle>
                <CardDescription className="text-muted-foreground">
                  Courses you're enrolled in
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12">
                  <BookOpen className="h-16 w-16 text-muted-foreground/40 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-foreground mb-2">
                    No courses enrolled yet
                  </h3>
                  <p className="text-muted-foreground mb-4">
                    You'll see your enrolled courses here once you join a course
                  </p>
                  <Button
                    variant="outline"
                    className="border-border/20 text-foreground hover:bg-foreground/10"
                  >
                    Browse Available Courses
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Progress Tab */}
          <TabsContent value="progress" className="space-y-6">
            <Card className="bg-card/50 border-border/50 hover:bg-card/70 transition-all duration-300">
              <CardHeader>
                <CardTitle className="text-foreground">Learning Progress</CardTitle>
                <CardDescription className="text-muted-foreground">
                  Track your learning achievements
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12">
                  <BarChart3 className="h-16 w-16 text-muted-foreground/40 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-foreground mb-2">
                    Progress Tracking
                  </h3>
                  <p className="text-muted-foreground">
                    Your learning progress will appear here once you start
                    taking courses
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Achievements Tab */}
          <TabsContent value="achievements" className="space-y-6">
            <Card className="bg-card/50 border-border/50 hover:bg-card/70 transition-all duration-300">
              <CardHeader>
                <CardTitle className="text-foreground">
                  Achievements & Badges
                </CardTitle>
                <CardDescription className="text-muted-foreground">
                  Celebrate your learning milestones
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12">
                  <Award className="h-16 w-16 text-muted-foreground/40 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-foreground mb-2">
                    No achievements yet
                  </h3>
                  <p className="text-muted-foreground">
                    Complete courses and lessons to earn badges and achievements
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
