"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { 
  Building2, 
  Edit, 
  Trash2, 
  Users, 
  Settings, 
  AlertTriangle,
  CheckCircle,
  XCircle,
  MoreHorizontal
} from "lucide-react";
import { MemberManagement } from "./MemberManagement";

interface Organization {
  id: string;
  name: string;
  slug: string;
  schoolCode?: string;
  subscriptionTier: string;
  createdAt: string;
  updatedAt: string;
  members: Array<{
    id: string;
    role: string;
    department?: string;
    status: string;
    user: {
      id: string;
      name?: string;
      email: string;
      image?: string;
    };
  }>;
  _count: {
    members: number;
    teams: number;
    courses: number;
  };
}

interface OrganizationManagementProps {
  organizationId: string;
  onSuccess?: () => void;
}

export function OrganizationManagement({ organizationId, onSuccess }: OrganizationManagementProps) {
  const [organization, setOrganization] = useState<Organization | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("overview");
  
  // Edit organization state
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    name: "",
    slug: "",
    schoolCode: "",
    subscriptionTier: "basic",
  });
  const [isSaving, setIsSaving] = useState(false);
  
  // Delete confirmation state
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState("");

  useEffect(() => {
    fetchOrganization();
  }, [organizationId]);

  const fetchOrganization = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/organization/${organizationId}`);
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to fetch organization");
      }

      setOrganization(result.data);
      setEditForm({
        name: result.data.name,
        slug: result.data.slug,
        schoolCode: result.data.schoolCode || "",
        subscriptionTier: result.data.subscriptionTier || "basic",
      });
    } catch (err) {
      console.error("Error fetching organization:", err);
      setError(err instanceof Error ? err.message : "Failed to fetch organization");
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);
      const response = await fetch(`/api/organization/${organizationId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(editForm),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to update organization");
      }

      setOrganization(result.data);
      setIsEditing(false);
      onSuccess?.();
    } catch (err) {
      console.error("Error updating organization:", err);
      setError(err instanceof Error ? err.message : "Failed to update organization");
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditForm({
      name: organization?.name || "",
      slug: organization?.slug || "",
      schoolCode: organization?.schoolCode || "",
      subscriptionTier: organization?.subscriptionTier || "basic",
    });
  };

  const handleDelete = async () => {
    if (deleteConfirmText !== organization?.name) {
      setError("Organization name does not match");
      return;
    }

    try {
      setIsDeleting(true);
      const response = await fetch(`/api/organization/${organizationId}`, {
        method: "DELETE",
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to delete organization");
      }

      // Redirect to dashboard or show success message
      window.location.href = "/dashboard";
    } catch (err) {
      console.error("Error deleting organization:", err);
      setError(err instanceof Error ? err.message : "Failed to delete organization");
    } finally {
      setIsDeleting(false);
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

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            <span className="ml-2">Loading organization...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error && !organization) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center text-destructive">
            <XCircle className="h-12 w-12 mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">Error Loading Organization</h3>
            <p className="text-sm text-muted-foreground mb-4">{error}</p>
            <Button onClick={fetchOrganization}>Try Again</Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!organization) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">
            <Building2 className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-medium mb-2">Organization Not Found</h3>
            <p className="text-sm text-muted-foreground">The requested organization could not be found.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
          <TabsTrigger value="members">Members</TabsTrigger>
          <TabsTrigger value="danger">Danger Zone</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Total Members</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{organization._count.members}</div>
                <p className="text-xs text-muted-foreground">Active members</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Teams</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{organization._count.teams}</div>
                <p className="text-xs text-muted-foreground">Active teams</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Courses</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{organization._count.courses}</div>
                <p className="text-xs text-muted-foreground">Published courses</p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Recent Members</CardTitle>
              <CardDescription>Latest additions to your organization</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {organization.members.slice(0, 5).map((member) => (
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
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Settings Tab */}
        <TabsContent value="settings" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Organization Settings</CardTitle>
                  <CardDescription>Manage your organization details</CardDescription>
                </div>
                {!isEditing && (
                  <Button onClick={handleEdit} variant="outline">
                    <Edit className="h-4 w-4 mr-2" />
                    Edit
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {isEditing ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Organization Name *</Label>
                      <Input
                        id="name"
                        value={editForm.name}
                        onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                        disabled={isSaving}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="slug">URL Slug *</Label>
                      <Input
                        id="slug"
                        value={editForm.slug}
                        onChange={(e) => setEditForm({ ...editForm, slug: e.target.value })}
                        disabled={isSaving}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="schoolCode">School Code</Label>
                      <Input
                        id="schoolCode"
                        value={editForm.schoolCode}
                        onChange={(e) => setEditForm({ ...editForm, schoolCode: e.target.value })}
                        disabled={isSaving}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="subscriptionTier">Subscription Tier</Label>
                      <Select
                        value={editForm.subscriptionTier}
                        onValueChange={(value) => setEditForm({ ...editForm, subscriptionTier: value })}
                        disabled={isSaving}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="basic">Basic</SelectItem>
                          <SelectItem value="premium">Premium</SelectItem>
                          <SelectItem value="enterprise">Enterprise</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {error && (
                    <div className="text-sm text-destructive bg-destructive/10 p-3 rounded-md">
                      {error}
                    </div>
                  )}

                  <div className="flex justify-end space-x-2">
                    <Button variant="outline" onClick={handleCancel} disabled={isSaving}>
                      Cancel
                    </Button>
                    <Button onClick={handleSave} disabled={isSaving}>
                      {isSaving ? "Saving..." : "Save Changes"}
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div>
                        <Label className="text-sm font-medium text-gray-700">Organization Name</Label>
                        <p className="text-lg font-semibold text-gray-900">{organization.name}</p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-gray-700">URL Slug</Label>
                        <p className="text-sm text-gray-600 font-mono">{organization.slug}</p>
                      </div>
                    </div>
                    <div className="space-y-4">
                      <div>
                        <Label className="text-sm font-medium text-gray-700">School Code</Label>
                        <p className="text-sm text-gray-600">{organization.schoolCode || "Not set"}</p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-gray-700">Subscription Tier</Label>
                        <Badge variant="outline">{organization.subscriptionTier}</Badge>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Members Tab */}
        <TabsContent value="members" className="space-y-6">
          <MemberManagement
            organizationId={organizationId}
            onSuccess={() => {
              fetchOrganization();
              onSuccess?.();
            }}
          />
        </TabsContent>

        {/* Danger Zone Tab */}
        <TabsContent value="danger" className="space-y-6">
          <Card className="border-destructive/20">
            <CardHeader>
              <CardTitle className="text-destructive">Danger Zone</CardTitle>
              <CardDescription>
                Irreversible and destructive actions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 border border-destructive/20 rounded-lg">
                  <div>
                    <h4 className="font-medium text-destructive">Delete Organization</h4>
                    <p className="text-sm text-muted-foreground">
                      Permanently delete this organization and all its data. This action cannot be undone.
                    </p>
                  </div>
                  <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
                    <DialogTrigger asChild>
                      <Button variant="destructive">
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete Organization
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle className="text-destructive">Delete Organization</DialogTitle>
                        <DialogDescription>
                          This action cannot be undone. This will permanently delete the organization
                          "{organization.name}" and remove all associated data including members, teams, and courses.
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div>
                          <Label htmlFor="confirmText">
                            Type the organization name to confirm deletion:
                          </Label>
                          <Input
                            id="confirmText"
                            value={deleteConfirmText}
                            onChange={(e) => setDeleteConfirmText(e.target.value)}
                            placeholder={organization.name}
                            className="mt-2"
                          />
                        </div>
                        {error && (
                          <div className="text-sm text-destructive bg-destructive/10 p-3 rounded-md">
                            {error}
                          </div>
                        )}
                      </div>
                      <DialogFooter>
                        <Button
                          variant="outline"
                          onClick={() => {
                            setShowDeleteDialog(false);
                            setDeleteConfirmText("");
                            setError("");
                          }}
                        >
                          Cancel
                        </Button>
                        <Button
                          variant="destructive"
                          onClick={handleDelete}
                          disabled={isDeleting || deleteConfirmText !== organization.name}
                        >
                          {isDeleting ? "Deleting..." : "Delete Organization"}
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
