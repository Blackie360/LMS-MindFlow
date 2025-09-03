"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { authClient } from "@/lib/auth-client";
import { BookOpen, Users, BarChart3, Play, CheckCircle, Clock, Award } from "lucide-react";

export default function StudentDashboard() {
  const router = useRouter();
  const { data: session, isPending, error } = authClient.useSession();
  const [activeTab, setActiveTab] = useState("overview");

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
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-900 via-purple-900 to-blue-900">
        <div className="text-center">
          <div className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-white font-bold text-2xl">🎓</span>
          </div>
          <div className="text-white text-lg">Loading Student Dashboard...</div>
        </div>
      </div>
    );
  }

  if (error || !session) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-blue-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold text-white">Student Dashboard</h1>
              <p className="mt-2 text-white/80">
                Welcome back, {session.user.name || session.user.email}!
              </p>
              <div className="mt-2">
                <Badge variant="secondary" className="bg-blue-500/20 text-blue-400 border-blue-500/30">
                  <Award className="h-4 w-4 mr-2" />
                  Student
                </Badge>
              </div>
            </div>
            <Button 
              variant="outline" 
              onClick={handleSignOut}
              className="border-white/20 text-white hover:bg-white/10"
            >
              Sign Out
            </Button>
          </div>
        </div>

        {/* Main Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 bg-white/10 border-white/20">
            <TabsTrigger value="overview" className="text-white data-[state=active]:bg-white/20">Overview</TabsTrigger>
            <TabsTrigger value="courses" className="text-white data-[state=active]:bg-white/20">My Courses</TabsTrigger>
            <TabsTrigger value="progress" className="text-white data-[state=active]:bg-white/20">Progress</TabsTrigger>
            <TabsTrigger value="achievements" className="text-white data-[state=active]:bg-white/20">Achievements</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="bg-white/10 border-white/20">
                <CardHeader>
                  <CardTitle className="text-white">Learning Summary</CardTitle>
                  <CardDescription className="text-white/60">Your current learning status</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <BookOpen className="h-5 w-5 text-blue-400" />
                      <span className="text-white">Enrolled Courses</span>
                    </div>
                    <Badge variant="outline" className="border-white/20 text-white">0</Badge>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <CheckCircle className="h-5 w-5 text-green-400" />
                      <span className="text-white">Completed Lessons</span>
                    </div>
                    <Badge variant="outline" className="border-white/20 text-white">0</Badge>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <Clock className="h-5 w-5 text-orange-400" />
                      <span className="text-white">Study Time</span>
                    </div>
                    <Badge variant="outline" className="border-white/20 text-white">0h</Badge>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white/10 border-white/20">
                <CardHeader>
                  <CardTitle className="text-white">Quick Actions</CardTitle>
                  <CardDescription className="text-white/60">Continue your learning journey</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button 
                    onClick={() => setActiveTab("courses")}
                    className="w-full bg-blue-500 hover:bg-blue-600"
                  >
                    <BookOpen className="h-4 w-4 mr-2" />
                    Browse Courses
                  </Button>
                  <Button 
                    onClick={() => setActiveTab("progress")}
                    variant="outline"
                    className="w-full border-white/20 text-white hover:bg-white/10"
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
            <Card className="bg-white/10 border-white/20">
              <CardHeader>
                <CardTitle className="text-white">My Courses</CardTitle>
                <CardDescription className="text-white/60">
                  Courses you're enrolled in
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12">
                  <BookOpen className="h-16 w-16 text-white/40 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-white mb-2">No courses enrolled yet</h3>
                  <p className="text-white/60 mb-4">You'll see your enrolled courses here once you join a course</p>
                  <Button 
                    variant="outline"
                    className="border-white/20 text-white hover:bg-white/10"
                  >
                    Browse Available Courses
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Progress Tab */}
          <TabsContent value="progress" className="space-y-6">
            <Card className="bg-white/10 border-white/20">
              <CardHeader>
                <CardTitle className="text-white">Learning Progress</CardTitle>
                <CardDescription className="text-white/60">
                  Track your learning achievements
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12">
                  <BarChart3 className="h-16 w-16 text-white/40 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-white mb-2">Progress Tracking</h3>
                  <p className="text-white/60">Your learning progress will appear here once you start taking courses</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Achievements Tab */}
          <TabsContent value="achievements" className="space-y-6">
            <Card className="bg-white/10 border-white/20">
              <CardHeader>
                <CardTitle className="text-white">Achievements & Badges</CardTitle>
                <CardDescription className="text-white/60">
                  Celebrate your learning milestones
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12">
                  <Award className="h-16 w-16 text-white/40 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-white mb-2">No achievements yet</h3>
                  <p className="text-white/60">Complete courses and lessons to earn badges and achievements</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}



