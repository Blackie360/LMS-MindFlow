"use client";

import { useState } from "react";
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

  // Mock data - replace with actual Better Auth data
  const mockMembers = [
    {
      id: "1",
      name: "Dr. Sarah Johnson",
      email: "sarah@mindflowacademy.com",
      role: "admin",
      department: "Administration",
      status: "active",
      joinedAt: "2024-01-15",
    },
    {
      id: "2",
      name: "Dr. Michael Chen",
      email: "michael@mindflowacademy.com",
      role: "leadInstructor",
      department: "Science",
      status: "active",
      joinedAt: "2024-01-20",
    },
    {
      id: "3",
      name: "Prof. Emily Davis",
      email: "emily@mindflowacademy.com",
      role: "instructor",
      department: "Mathematics",
      status: "active",
      joinedAt: "2024-01-25",
    },
    {
      id: "4",
      name: "John Smith",
      email: "john@mindflowacademy.com",
      role: "student",
      department: "Science",
      status: "pending",
      joinedAt: "2024-02-01",
    },
  ];

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
    return status === "active" ? "default" : "secondary";
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

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
                <div className="text-2xl font-bold">{mockMembers.length}</div>
                <p className="text-xs text-muted-foreground">
                  Active organization members
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
                    mockMembers.filter(
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
                  {mockMembers.filter((m) => m.role === "student").length}
                </div>
                <p className="text-xs text-muted-foreground">
                  Enrolled students
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Pending</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {mockMembers.filter((m) => m.status === "pending").length}
                </div>
                <p className="text-xs text-muted-foreground">
                  Awaiting acceptance
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
                {mockMembers.slice(0, 5).map((member) => (
                  <div
                    key={member.id}
                    className="flex items-center justify-between p-4 border rounded-lg"
                  >
                    <div className="flex items-center space-x-4">
                      <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                        <span className="text-sm font-medium text-gray-600">
                          {member.name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")}
                        </span>
                      </div>
                      <div>
                        <p className="font-medium">{member.name}</p>
                        <p className="text-sm text-gray-600">{member.email}</p>
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
                        {formatDate(member.joinedAt)}
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
              <div className="space-y-4">
                {mockMembers.map((member) => (
                  <div
                    key={member.id}
                    className="flex items-center justify-between p-4 border rounded-lg"
                  >
                    <div className="flex items-center space-x-4">
                      <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                        <span className="text-sm font-medium text-gray-600">
                          {member.name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")}
                        </span>
                      </div>
                      <div>
                        <p className="font-medium">{member.name}</p>
                        <p className="text-sm text-gray-600">{member.email}</p>
                        <p className="text-xs text-gray-500">
                          {member.department}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge variant={getRoleBadgeVariant(member.role)}>
                        {member.role}
                      </Badge>
                      <Badge variant={getStatusBadgeVariant(member.status)}>
                        {member.status}
                      </Badge>
                      <Button variant="outline" size="sm">
                        Edit
                      </Button>
                      <Button variant="outline" size="sm">
                        Remove
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
