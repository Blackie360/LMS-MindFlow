"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Search,
  Filter,
  MoreHorizontal,
  RefreshCw,
  Mail,
  Trash2,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  UserPlus,
  Calendar
} from "lucide-react";

interface Invitation {
  id: string;
  email: string;
  role: string;
  department?: string;
  teamId?: string;
  status: 'pending' | 'accepted' | 'rejected' | 'expired';
  createdAt: string;
  acceptedAt?: string;
  expiresAt: string;
  inviter: {
    name?: string;
    email: string;
  };
  metadata?: {
    name?: string;
    grade?: string;
    notes?: string;
  };
}

interface InvitationStatusTableProps {
  organizationId: string;
  onRefresh?: () => void;
}

export function InvitationStatusTable({
  organizationId,
  onRefresh,
}: InvitationStatusTableProps) {
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [roleFilter, setRoleFilter] = useState("all");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [invitationToDelete, setInvitationToDelete] = useState<string | null>(null);

  const fetchInvitations = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/organization/${organizationId}/invitations`);
      if (response.ok) {
        const data = await response.json();
        setInvitations(data.data || []);
      } else {
        console.error("Failed to fetch invitations");
      }
    } catch (error) {
      console.error("Error fetching invitations:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchInvitations();
  }, [organizationId]);

  const handleDeleteInvitation = async (invitationId: string) => {
    try {
      const response = await fetch(`/api/organization/${organizationId}/invitation/${invitationId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        setInvitations(invitations.filter(inv => inv.id !== invitationId));
        onRefresh?.();
      } else {
        console.error("Failed to delete invitation");
      }
    } catch (error) {
      console.error("Error deleting invitation:", error);
    } finally {
      setDeleteDialogOpen(false);
      setInvitationToDelete(null);
    }
  };

  const handleResendInvitation = async (invitationId: string) => {
    try {
      const response = await fetch(`/api/organization/${organizationId}/invitation/${invitationId}/resend`, {
        method: "POST",
      });

      if (response.ok) {
        // Refresh the invitations list
        fetchInvitations();
        onRefresh?.();
      } else {
        console.error("Failed to resend invitation");
      }
    } catch (error) {
      console.error("Error resending invitation:", error);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800"><Clock className="h-3 w-3 mr-1" />Pending</Badge>;
      case 'accepted':
        return <Badge variant="default" className="bg-green-100 text-green-800"><CheckCircle className="h-3 w-3 mr-1" />Accepted</Badge>;
      case 'rejected':
        return <Badge variant="destructive" className="bg-red-100 text-red-800"><XCircle className="h-3 w-3 mr-1" />Rejected</Badge>;
      case 'expired':
        return <Badge variant="outline" className="bg-gray-100 text-gray-800"><AlertCircle className="h-3 w-3 mr-1" />Expired</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getRoleBadge = (role: string) => {
    const roleColors = {
      'leadInstructor': 'bg-purple-100 text-purple-800',
      'instructor': 'bg-blue-100 text-blue-800',
      'student': 'bg-green-100 text-green-800',
      'admin': 'bg-red-100 text-red-800',
    };
    
    return (
      <Badge variant="secondary" className={roleColors[role as keyof typeof roleColors] || 'bg-gray-100 text-gray-800'}>
        {role.charAt(0).toUpperCase() + role.slice(1).replace(/([A-Z])/g, ' $1')}
      </Badge>
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const isExpired = (expiresAt: string) => {
    return new Date(expiresAt) < new Date();
  };

  const filteredInvitations = invitations.filter(invitation => {
    const matchesSearch = invitation.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         invitation.metadata?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         invitation.inviter.name?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || invitation.status === statusFilter;
    const matchesRole = roleFilter === "all" || invitation.role === roleFilter;
    
    return matchesSearch && matchesStatus && matchesRole;
  });

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Invitation Status</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <RefreshCw className="h-6 w-6 animate-spin mr-2" />
            Loading invitations...
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Mail className="h-5 w-5" />
              Invitation Status
            </CardTitle>
            <Button onClick={fetchInvitations} variant="outline" size="sm">
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search by email, name, or inviter..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-32">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="accepted">Accepted</SelectItem>
                    <SelectItem value="rejected">Rejected</SelectItem>
                    <SelectItem value="expired">Expired</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={roleFilter} onValueChange={setRoleFilter}>
                  <SelectTrigger className="w-32">
                    <SelectValue placeholder="Role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Roles</SelectItem>
                    <SelectItem value="leadInstructor">Lead Instructor</SelectItem>
                    <SelectItem value="instructor">Instructor</SelectItem>
                    <SelectItem value="student">Student</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Table */}
            {filteredInvitations.length === 0 ? (
              <div className="text-center py-8">
                <Mail className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium text-foreground mb-2">No invitations found</h3>
                <p className="text-muted-foreground">
                  {invitations.length === 0 
                    ? "No invitations have been sent yet" 
                    : "No invitations match your current filters"
                  }
                </p>
              </div>
            ) : (
              <div className="border rounded-lg">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Email</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Department</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Invited By</TableHead>
                      <TableHead>Created</TableHead>
                      <TableHead>Expires</TableHead>
                      <TableHead className="w-12"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredInvitations.map((invitation) => (
                      <TableRow key={invitation.id}>
                        <TableCell className="font-medium">{invitation.email}</TableCell>
                        <TableCell>
                          {invitation.metadata?.name || '-'}
                          {invitation.metadata?.grade && (
                            <span className="text-sm text-muted-foreground ml-2">
                              ({invitation.metadata.grade})
                            </span>
                          )}
                        </TableCell>
                        <TableCell>{getRoleBadge(invitation.role)}</TableCell>
                        <TableCell>{invitation.department || '-'}</TableCell>
                        <TableCell>
                          {getStatusBadge(invitation.status)}
                          {isExpired(invitation.expiresAt) && invitation.status === 'pending' && (
                            <Badge variant="outline" className="ml-2 bg-orange-100 text-orange-800">
                              <AlertCircle className="h-3 w-3 mr-1" />
                              Expired
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            <div className="font-medium">{invitation.inviter.name || invitation.inviter.email}</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm text-muted-foreground">
                            {formatDate(invitation.createdAt)}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm text-muted-foreground">
                            {formatDate(invitation.expiresAt)}
                          </div>
                        </TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              {invitation.status === 'pending' && !isExpired(invitation.expiresAt) && (
                                <DropdownMenuItem onClick={() => handleResendInvitation(invitation.id)}>
                                  <Mail className="h-4 w-4 mr-2" />
                                  Resend
                                </DropdownMenuItem>
                              )}
                              {invitation.status === 'pending' && (
                                <DropdownMenuItem 
                                  onClick={() => {
                                    setInvitationToDelete(invitation.id);
                                    setDeleteDialogOpen(true);
                                  }}
                                  className="text-destructive"
                                >
                                  <Trash2 className="h-4 w-4 mr-2" />
                                  Delete
                                </DropdownMenuItem>
                              )}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}

            {/* Summary */}
            {invitations.length > 0 && (
              <div className="flex items-center justify-between text-sm text-muted-foreground pt-4 border-t">
                <div>
                  Showing {filteredInvitations.length} of {invitations.length} invitations
                </div>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-yellow-100 rounded-full"></div>
                    <span>Pending: {invitations.filter(i => i.status === 'pending').length}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-green-100 rounded-full"></div>
                    <span>Accepted: {invitations.filter(i => i.status === 'accepted').length}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-red-100 rounded-full"></div>
                    <span>Rejected: {invitations.filter(i => i.status === 'rejected').length}</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Invitation</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this invitation? This action cannot be undone.
              The person will no longer be able to accept this invitation.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => invitationToDelete && handleDeleteInvitation(invitationToDelete)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
