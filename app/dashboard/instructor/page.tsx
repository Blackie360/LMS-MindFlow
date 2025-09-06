"use client";

import {
  BarChart3,
  BookOpen,
  GraduationCap,
  Plus,
  UserPlus,
  Users,
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
import { authClient } from "@/lib/auth-client";

export default function InstructorDashboard() {
  const router = useRouter();
  const { data: session, isPending, error } = authClient.useSession();
  const [activeTab, setActiveTab] = useState("overview");
  const [showCreateCourse, setShowCreateCourse] = useState(false);
  const [showInviteStudent, setShowInviteStudent] = useState(false);
  const [userOrganization, setUserOrganization] = useState<any>(null);

  console.log("InstructorDashboard - session:", { session, user: session?.user });
  console.log("InstructorDashboard - isPending:", isPending);
  console.log("InstructorDashboard - error:", error);

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
        const response = await fetch("/api/organization/list");
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
            <span className="text-primary-foreground font-bold text-2xl">📚</span>
          </div>
          <div className="text-foreground text-lg">
            Loading Instructor Dashboard...
          </div>
        </div>
      </div>
    );
  }

  if (error || !session) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold text-foreground">
                Instructor Dashboard
              </h1>
              <p className="mt-2 text-muted-foreground">
                Welcome back, {session.user.name || session.user.email}!
              </p>
              <div className="mt-2">
                <Badge
                  variant="secondary"
                  className="bg-primary/20 text-primary border-primary/30"
                >
                  <GraduationCap className="h-4 w-4 mr-2" />
                  Instructor
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
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="bg-card/50 border-border/50">
                <CardHeader>
                  <CardTitle className="text-foreground">Quick Actions</CardTitle>
                  <CardDescription className="text-muted-foreground">
                    Common tasks for instructors
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button
                    onClick={() => setShowCreateCourse(true)}
                    className="w-full bg-primary hover:bg-primary/90"
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
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Courses Tab */}
          <TabsContent value="courses" className="space-y-6">
            <Card className="bg-card/50 border-border/50">
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-foreground">
                    Course Management
                  </CardTitle>
                  <CardDescription className="text-muted-foreground">
                    Create and manage your courses
                  </CardDescription>
                </div>
                <Button
                  onClick={() => setShowCreateCourse(true)}
                  className="bg-primary hover:bg-primary/90"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  New Course
                </Button>
              </CardHeader>
              <CardContent>
                {!showCreateCourse ? (
                  <div className="text-center py-12">
                    <BookOpen className="h-16 w-16 text-muted-foreground/40 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-foreground mb-2">
                      No courses yet
                    </h3>
                    <p className="text-muted-foreground mb-4">
                      Create your first course to start teaching
                    </p>
                    <Button
                      onClick={() => setShowCreateCourse(true)}
                      className="bg-primary hover:bg-primary/90"
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
            <Card className="bg-card/50 border-border/50">
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-foreground">
                    Student Management
                  </CardTitle>
                  <CardDescription className="text-muted-foreground">
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
                    <Users className="h-16 w-16 text-muted-foreground/40 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-foreground mb-2">
                      No students enrolled
                    </h3>
                    <p className="text-muted-foreground mb-4">
                      Invite students to your courses to get started
                    </p>
                    <Button
                      onClick={() => setShowInviteStudent(true)}
                      className="bg-blue-500 hover:bg-blue-600"
                    >
                      Invite Students
                    </Button>
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
            <Card className="bg-card/50 border-border/50">
              <CardHeader>
                <CardTitle className="text-foreground">Learning Analytics</CardTitle>
                <CardDescription className="text-muted-foreground">
                  Track student progress and course performance
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12">
                  <BarChart3 className="h-16 w-16 text-muted-foreground/40 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-foreground mb-2">
                    Analytics Coming Soon
                  </h3>
                  <p className="text-muted-foreground">
                    Detailed analytics and insights will be available here
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
