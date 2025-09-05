"use client";

import { useState, useEffect } from "react";
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
import { InviteInstructorForm } from "./InviteInstructorForm";
import { InviteStudentForm } from "./InviteStudentForm";
import { 
  MoreHorizontal, 
  Edit, 
  Trash2, 
  UserPlus,
  Users,
  AlertCircle
} from "lucide-react";

interface Member {
  id: string;
  role: string;
  department?: string;
  status: string;
  createdAt: string;
  user: {
    id: string;
    name?: string;
    email: string;
    image?: string;
  };
}

interface MemberManagementProps {
  organizationId: string;
  onSuccess?: () => void;
}

export function MemberManagement({
  organizationId,
  onSuccess,
}: MemberManagementProps) {
  const [activeTab, setActiveTab] = useState("overview");
  const [showInstructorForm, setShowInstructorForm] = useState(false);
  const [showStudentForm, setShowStudentForm] = useState(false);
  const [members, setMembers] = useState<Member[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchMembers();
  }, [organizationId]);

  const fetchMembers = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/organization/${organizationId}/members`);
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to fetch members");
      }

      setMembers(result.data);
    } catch (err) {
      console.error("Error fetching members:", err);
      setError(err instanceof Error ? err.message : "Failed to fetch members");
    } finally {
      setIsLoading(false);
    }
  };

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case "admin":
        return "default";
      case "leadInstructor":
        return "secondary";
      case "instructor":
        return "outline";
      case "student":
        return "destructive";
      default:
        return "secondary";
    }
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case "active":
        return "default";
      case "pending":
        return "secondary";
      case "inactive":
        return "destructive";
      default:
        return "secondary";
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const handleRemoveMember = async (memberId: string) => {
    if (!confirm("Are you sure you want to remove this member?")) {
      return;
    }

    try {
      const response = await fetch(`/api/organization/${organizationId}/members/${memberId}`, {
        method: "DELETE",
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to remove member");
      }

      // Refresh members list
      await fetchMembers();
      onSuccess?.();
    } catch (err) {
      console.error("Error removing member:", err);
      setError(err instanceof Error ? err.message : "Failed to remove member");
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            <span className="ml-2">Loading members...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center text-destructive">
            <AlertCircle className="h-12 w-12 mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">Error Loading Members</h3>
            <p className="text-sm text-muted-foreground mb-4">{error}</p>
            <Button onClick={fetchMembers}>Try Again</Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="space-y-6"
      >
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">Member Overview</TabsTrigger>
          <TabsTrigger value="invite">Invite Members</TabsTrigger>
          <TabsTrigger value="manage">Manage Members</TabsTrigger>
        </TabsList>

        {/* Member Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">
                  Total Members
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{members.length}</div>
                <p className="text-xs text-muted-foreground">
                  Organization members
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">
                  Instructors
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {
                    members.filter(
                      (m) =>
                        m.role.includes("instructor") || m.role === "admin",
                    ).length
                  }
                </div>
                <p className="text-xs text-muted-foreground">Teaching staff</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Students</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {members.filter((m) => m.role === "student").length}
                </div>
                <p className="text-xs text-muted-foreground">
                  Enrolled students
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Active</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {members.filter((m) => m.status === "active").length}
                </div>
                <p className="text-xs text-muted-foreground">
                  Active members
                </p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Recent Members</CardTitle>
              <CardDescription>
                Latest additions to your organization
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {members.slice(0, 5).map((member) => (
                  <div
                    key={member.id}
                    className="flex items-center justify-between p-4 border rounded-lg"
                  >
                    <div className="flex items-center space-x-4">
                      <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                        <span className="text-sm font-medium text-gray-600">
                          {member.user.name
                            ?.split(" ")
                            .map((n) => n[0])
                            .join("") || member.user.email[0].toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <p className="font-medium">{member.user.name || member.user.email}</p>
                        <p className="text-sm text-gray-600">{member.user.email}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge variant={getRoleBadgeVariant(member.role)}>
                        {member.role}
                      </Badge>
                      <Badge variant={getStatusBadgeVariant(member.status)}>
                        {member.status}
                      </Badge>
                      <span className="text-sm text-gray-500">
                        {formatDate(member.createdAt)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Invite Members Tab */}
        <TabsContent value="invite" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Instructor Invitation */}
            <Card>
              <CardHeader>
                <CardTitle>Invite Instructor</CardTitle>
                <CardDescription>
                  Send invitations to teachers and staff members
                </CardDescription>
              </CardHeader>
              <CardContent>
                {!showInstructorForm ? (
                  <div className="text-center py-8">
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      Invite Teaching Staff
                    </h3>
                    <p className="text-gray-600 mb-4">
                      Send invitations to instructors, lead instructors, and
                      administrators
                    </p>
                    <Button onClick={() => setShowInstructorForm(true)}>
                      Invite Instructor
                    </Button>
                  </div>
                ) : (
                  <InviteInstructorForm
                    organizationId={organizationId}
                    onSuccess={() => {
                      setShowInstructorForm(false);
                      onSuccess?.();
                    }}
                  />
                )}
              </CardContent>
            </Card>

            {/* Student Invitation */}
            <Card>
              <CardHeader>
                <CardTitle>Invite Student</CardTitle>
                <CardDescription>
                  Send invitations to students for enrollment
                </CardDescription>
              </CardHeader>
              <CardContent>
                {!showStudentForm ? (
                  <div className="text-center py-8">
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      Invite Students
                    </h3>
                    <p className="text-gray-600 mb-4">
                      Send invitations to students with grade level and
                      department info
                    </p>
                    <Button onClick={() => setShowStudentForm(true)}>
                      Invite Student
                    </Button>
                  </div>
                ) : (
                  <InviteStudentForm
                    organizationId={organizationId}
                    onSuccess={() => {
                      setShowStudentForm(false);
                      onSuccess?.();
                    }}
                  />
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Manage Members Tab */}
        <TabsContent value="manage" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>All Members</CardTitle>
              <CardDescription>
                View and manage organization members
              </CardDescription>
            </CardHeader>
            <CardContent>
              {members.length === 0 ? (
                <div className="text-center py-8">
                  <Users className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="text-lg font-medium mb-2">No Members Yet</h3>
                  <p className="text-muted-foreground mb-4">
                    Start by inviting members to your organization
                  </p>
                  <Button onClick={() => setActiveTab("invite")}>
                    <UserPlus className="h-4 w-4 mr-2" />
                    Invite Members
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {members.map((member) => (
                    <div
                      key={member.id}
                      className="flex items-center justify-between p-4 border rounded-lg"
                    >
                      <div className="flex items-center space-x-4">
                        <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                          <span className="text-sm font-medium text-gray-600">
                            {member.user.name
                              ?.split(" ")
                              .map((n) => n[0])
                              .join("") || member.user.email[0].toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <p className="font-medium">{member.user.name || member.user.email}</p>
                          <p className="text-sm text-gray-600">{member.user.email}</p>
                          {member.department && (
                            <p className="text-xs text-gray-500">
                              {member.department}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge variant={getRoleBadgeVariant(member.role)}>
                          {member.role}
                        </Badge>
                        <Badge variant={getStatusBadgeVariant(member.status)}>
                          {member.status}
                        </Badge>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleRemoveMember(member.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
