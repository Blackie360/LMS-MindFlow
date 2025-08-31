"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { authClient } from "@/lib/auth-client";
import { CreateCourseForm } from "@/components/courses/CreateCourseForm";
import { InviteStudentForm } from "@/components/organization/InviteStudentForm";
import { BookOpen, Users, BarChart3, Plus, GraduationCap, UserPlus } from "lucide-react";

export default function InstructorDashboard() {
  const router = useRouter();
  const { data: session, isPending, error } = authClient.useSession();
  const [activeTab, setActiveTab] = useState("overview");
  const [showCreateCourse, setShowCreateCourse] = useState(false);
  const [showInviteStudent, setShowInviteStudent] = useState(false);

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
          <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-white font-bold text-2xl">📚</span>
          </div>
          <div className="text-white text-lg">Loading Instructor Dashboard...</div>
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
              <h1 className="text-3xl font-bold text-white">Instructor Dashboard</h1>
              <p className="mt-2 text-white/80">
                Welcome back, {session.user.name || session.user.email}!
              </p>
              <div className="mt-2">
                <Badge variant="secondary" className="bg-green-500/20 text-green-400 border-green-500/30">
                  <GraduationCap className="h-4 w-4 mr-2" />
                  Instructor
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
            <TabsTrigger value="courses" className="text-white data-[state=active]:bg-white/20">Courses</TabsTrigger>
            <TabsTrigger value="students" className="text-white data-[state=active]:bg-white/20">Students</TabsTrigger>
            <TabsTrigger value="analytics" className="text-white data-[state=active]:bg-white/20">Analytics</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="bg-white/10 border-white/20">
                <CardHeader>
                  <CardTitle className="text-white">Quick Actions</CardTitle>
                  <CardDescription className="text-white/60">Common tasks for instructors</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button 
                    onClick={() => setShowCreateCourse(true)}
                    className="w-full bg-green-500 hover:bg-green-600"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Create New Course
                  </Button>
                  <Button 
                    onClick={() => setShowInviteStudent(true)}
                    variant="outline"
                    className="w-full border-white/20 text-white hover:bg-white/10"
                  >
                    <UserPlus className="h-4 w-4 mr-2" />
                    Invite Students
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Courses Tab */}
          <TabsContent value="courses" className="space-y-6">
            <Card className="bg-white/10 border-white/20">
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-white">Course Management</CardTitle>
                  <CardDescription className="text-white/60">
                    Create and manage your courses
                  </CardDescription>
                </div>
                <Button 
                  onClick={() => setShowCreateCourse(true)}
                  className="bg-green-500 hover:bg-green-600"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  New Course
                </Button>
              </CardHeader>
              <CardContent>
                {!showCreateCourse ? (
                  <div className="text-center py-12">
                    <BookOpen className="h-16 w-16 text-white/40 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-white mb-2">No courses yet</h3>
                    <p className="text-white/60 mb-4">Create your first course to start teaching</p>
                    <Button 
                      onClick={() => setShowCreateCourse(true)}
                      className="bg-green-500 hover:bg-green-600"
                    >
                      Create Course
                    </Button>
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
            <Card className="bg-white/10 border-white/20">
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-white">Student Management</CardTitle>
                  <CardDescription className="text-white/60">
                    Manage your enrolled students
                  </CardDescription>
                </div>
                <Button 
                  onClick={() => setShowInviteStudent(true)}
                  className="bg-blue-500 hover:bg-blue-600"
                >
                  <UserPlus className="h-4 w-4 mr-2" />
                  Invite Students
                </Button>
              </CardHeader>
              <CardContent>
                {!showInviteStudent ? (
                  <div className="text-center py-12">
                    <Users className="h-16 w-16 text-white/40 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-white mb-2">No students enrolled</h3>
                    <p className="text-white/60 mb-4">Invite students to your courses to get started</p>
                    <Button 
                      onClick={() => setShowInviteStudent(true)}
                      className="bg-blue-500 hover:bg-blue-600"
                    >
                      Invite Students
                    </Button>
                  </div>
                ) : (
                  <InviteStudentForm 
                    onSuccess={() => {
                      setShowInviteStudent(false);
                      setActiveTab("overview");
                    }}
                    onCancel={() => setShowInviteStudent(false)}
                  />
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="space-y-6">
            <Card className="bg-white/10 border-white/20">
              <CardHeader>
                <CardTitle className="text-white">Learning Analytics</CardTitle>
                <CardDescription className="text-white/60">
                  Track student progress and course performance
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12">
                  <BarChart3 className="h-16 w-16 text-white/40 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-white mb-2">Analytics Coming Soon</h3>
                  <p className="text-white/60">Detailed analytics and insights will be available here</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
