"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  UserPlus, 
  Mail, 
  Users, 
  X, 
  CheckCircle, 
  AlertCircle,
  Plus,
  Trash2
} from "lucide-react";

interface Invitee {
  id: string;
  email: string;
  role: string;
  department: string;
  teamId: string;
  metadata?: {
    name?: string;
    grade?: string;
    notes?: string;
  };
}

interface BulkInviteModalProps {
  isOpen: boolean;
  onClose: () => void;
  organizationId: string;
  onSuccess?: () => void;
}

export function BulkInviteModal({
  isOpen,
  onClose,
  organizationId,
  onSuccess,
}: BulkInviteModalProps) {
  const [invitees, setInvitees] = useState<Invitee[]>([]);
  const [bulkEmails, setBulkEmails] = useState("");
  const [defaultRole, setDefaultRole] = useState("student");
  const [defaultDepartment, setDefaultDepartment] = useState("");
  const [defaultTeamId, setDefaultTeamId] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [invitationResults, setInvitationResults] = useState<any[]>([]);

  // Reset state when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      setInvitees([]);
      setBulkEmails("");
      setDefaultRole("student");
      setDefaultDepartment("");
      setDefaultTeamId("");
      setError("");
      setSuccess("");
      setInvitationResults([]);
    }
  }, [isOpen]);

  const addInvitee = () => {
    const newInvitee: Invitee = {
      id: Math.random().toString(36).substr(2, 9),
      email: "",
      role: defaultRole,
      department: defaultDepartment,
      teamId: defaultTeamId,
      metadata: {}
    };
    setInvitees([...invitees, newInvitee]);
  };

  const removeInvitee = (id: string) => {
    setInvitees(invitees.filter(invitee => invitee.id !== id));
  };

  const updateInvitee = (id: string, field: keyof Invitee, value: any) => {
    setInvitees(invitees.map(invitee => 
      invitee.id === id ? { ...invitee, [field]: value } : invitee
    ));
  };

  const updateInviteeMetadata = (id: string, field: string, value: string) => {
    setInvitees(invitees.map(invitee => 
      invitee.id === id 
        ? { 
            ...invitee, 
            metadata: { ...invitee.metadata, [field]: value } 
          } 
        : invitee
    ));
  };

  const parseBulkEmails = () => {
    const emails = bulkEmails
      .split(/[,\n]/)
      .map(email => email.trim())
      .filter(email => email && email.includes('@'));
    
    const newInvitees = emails.map(email => ({
      id: Math.random().toString(36).substr(2, 9),
      email,
      role: defaultRole,
      department: defaultDepartment,
      teamId: defaultTeamId,
      metadata: {}
    }));
    
    setInvitees([...invitees, ...newInvitees]);
    setBulkEmails("");
  };

  const validateInvitees = () => {
    const errors: string[] = [];
    
    if (invitees.length === 0) {
      errors.push("Please add at least one invitee");
    }
    
    invitees.forEach((invitee, index) => {
      if (!invitee.email || !invitee.email.includes('@')) {
        errors.push(`Invalid email at position ${index + 1}`);
      }
      if (!invitee.role) {
        errors.push(`Role required for ${invitee.email}`);
      }
    });
    
    return errors;
  };

  const handleBulkInvite = async () => {
    const errors = validateInvitees();
    if (errors.length > 0) {
      setError(errors.join(', '));
      return;
    }

    setIsLoading(true);
    setError("");
    setSuccess("");

    try {
      const response = await fetch(`/api/organization/${organizationId}/invitation/bulk`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          invitees: invitees.map(invitee => ({
            email: invitee.email,
            role: invitee.role,
            department: invitee.department || undefined,
            teamId: invitee.teamId || undefined,
            metadata: invitee.metadata
          }))
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        setError(result.error || "Failed to send invitations");
      } else {
        setInvitationResults(result.results || []);
        const successCount = result.results?.filter((r: any) => r.success).length || 0;
        const totalCount = result.results?.length || 0;
        setSuccess(`Successfully sent ${successCount} out of ${totalCount} invitations`);
        
        if (successCount > 0) {
          onSuccess?.();
        }
      }
    } catch (err) {
      setError("An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    if (!isLoading) {
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserPlus className="h-5 w-5" />
            Bulk Invite Members
          </DialogTitle>
          <DialogDescription>
            Invite multiple people to join your organization at once
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="individual" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="individual">Individual</TabsTrigger>
            <TabsTrigger value="bulk">Bulk Import</TabsTrigger>
          </TabsList>

          <TabsContent value="individual" className="space-y-4">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium">Invite Individual Members</h3>
                <Button onClick={addInvitee} size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Member
                </Button>
              </div>

              {invitees.length === 0 ? (
                <Card>
                  <CardContent className="flex flex-col items-center justify-center py-8">
                    <Users className="h-12 w-12 text-muted-foreground mb-4" />
                    <p className="text-muted-foreground mb-4">No members added yet</p>
                    <Button onClick={addInvitee}>
                      <Plus className="h-4 w-4 mr-2" />
                      Add First Member
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {invitees.map((invitee) => (
                    <Card key={invitee.id}>
                      <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-base">Member #{invitees.indexOf(invitee) + 1}</CardTitle>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeInvitee(invitee.id)}
                            className="text-destructive hover:text-destructive"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          <div className="space-y-2">
                            <Label htmlFor={`email-${invitee.id}`}>Email *</Label>
                            <Input
                              id={`email-${invitee.id}`}
                              type="email"
                              placeholder="member@example.com"
                              value={invitee.email}
                              onChange={(e) => updateInvitee(invitee.id, 'email', e.target.value)}
                              disabled={isLoading}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor={`role-${invitee.id}`}>Role *</Label>
                            <Select
                              value={invitee.role}
                              onValueChange={(value) => updateInvitee(invitee.id, 'role', value)}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Select role" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="leadInstructor">Lead Instructor</SelectItem>
                                <SelectItem value="instructor">Instructor</SelectItem>
                                <SelectItem value="student">Student</SelectItem>
                                <SelectItem value="admin">Admin</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          <div className="space-y-2">
                            <Label htmlFor={`department-${invitee.id}`}>Department</Label>
                            <Input
                              id={`department-${invitee.id}`}
                              placeholder="e.g., Science, Math"
                              value={invitee.department}
                              onChange={(e) => updateInvitee(invitee.id, 'department', e.target.value)}
                              disabled={isLoading}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor={`team-${invitee.id}`}>Team ID</Label>
                            <Input
                              id={`team-${invitee.id}`}
                              placeholder="Optional team assignment"
                              value={invitee.teamId}
                              onChange={(e) => updateInvitee(invitee.id, 'teamId', e.target.value)}
                              disabled={isLoading}
                            />
                          </div>
                        </div>

                        {invitee.role === 'student' && (
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            <div className="space-y-2">
                              <Label htmlFor={`name-${invitee.id}`}>Student Name</Label>
                              <Input
                                id={`name-${invitee.id}`}
                                placeholder="Full name (optional)"
                                value={invitee.metadata?.name || ''}
                                onChange={(e) => updateInviteeMetadata(invitee.id, 'name', e.target.value)}
                                disabled={isLoading}
                              />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor={`grade-${invitee.id}`}>Grade Level</Label>
                              <Select
                                value={invitee.metadata?.grade || ''}
                                onValueChange={(value) => updateInviteeMetadata(invitee.id, 'grade', value)}
                              >
                                <SelectTrigger>
                                  <SelectValue placeholder="Select grade" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="kindergarten">Kindergarten</SelectItem>
                                  <SelectItem value="1st">1st Grade</SelectItem>
                                  <SelectItem value="2nd">2nd Grade</SelectItem>
                                  <SelectItem value="3rd">3rd Grade</SelectItem>
                                  <SelectItem value="4th">4th Grade</SelectItem>
                                  <SelectItem value="5th">5th Grade</SelectItem>
                                  <SelectItem value="6th">6th Grade</SelectItem>
                                  <SelectItem value="7th">7th Grade</SelectItem>
                                  <SelectItem value="8th">8th Grade</SelectItem>
                                  <SelectItem value="9th">9th Grade</SelectItem>
                                  <SelectItem value="10th">10th Grade</SelectItem>
                                  <SelectItem value="11th">11th Grade</SelectItem>
                                  <SelectItem value="12th">12th Grade</SelectItem>
                                  <SelectItem value="college">College</SelectItem>
                                  <SelectItem value="adult">Adult Learner</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                          </div>
                        )}

                        <div className="space-y-2">
                          <Label htmlFor={`notes-${invitee.id}`}>Notes</Label>
                          <Textarea
                            id={`notes-${invitee.id}`}
                            placeholder="Additional information..."
                            value={invitee.metadata?.notes || ''}
                            onChange={(e) => updateInviteeMetadata(invitee.id, 'notes', e.target.value)}
                            rows={2}
                            disabled={isLoading}
                          />
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="bulk" className="space-y-4">
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-medium mb-2">Bulk Import</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Paste email addresses separated by commas or new lines. Default settings will be applied to all.
                </p>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="bulk-emails">Email Addresses</Label>
                  <Textarea
                    id="bulk-emails"
                    placeholder="member1@example.com, member2@example.com&#10;member3@example.com"
                    value={bulkEmails}
                    onChange={(e) => setBulkEmails(e.target.value)}
                    rows={6}
                    disabled={isLoading}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="default-role">Default Role</Label>
                    <Select value={defaultRole} onValueChange={setDefaultRole}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select role" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="leadInstructor">Lead Instructor</SelectItem>
                        <SelectItem value="instructor">Instructor</SelectItem>
                        <SelectItem value="student">Student</SelectItem>
                        <SelectItem value="admin">Admin</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="default-department">Default Department</Label>
                    <Input
                      id="default-department"
                      placeholder="e.g., Science, Math"
                      value={defaultDepartment}
                      onChange={(e) => setDefaultDepartment(e.target.value)}
                      disabled={isLoading}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="default-team">Default Team ID</Label>
                    <Input
                      id="default-team"
                      placeholder="Optional team assignment"
                      value={defaultTeamId}
                      onChange={(e) => setDefaultTeamId(e.target.value)}
                      disabled={isLoading}
                    />
                  </div>
                </div>

                <Button onClick={parseBulkEmails} disabled={!bulkEmails.trim() || isLoading}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add to List ({bulkEmails.split(/[,\n]/).filter(e => e.trim() && e.includes('@')).length} emails)
                </Button>
              </div>
            </div>
          </TabsContent>
        </Tabs>

        {error && (
          <div className="flex items-center gap-2 text-sm text-destructive bg-destructive/10 p-3 rounded-md">
            <AlertCircle className="h-4 w-4" />
            {error}
          </div>
        )}

        {success && (
          <div className="flex items-center gap-2 text-sm text-green-600 bg-green-50 p-3 rounded-md">
            <CheckCircle className="h-4 w-4" />
            {success}
          </div>
        )}

        {invitationResults.length > 0 && (
          <div className="space-y-2">
            <h4 className="font-medium">Invitation Results:</h4>
            <div className="space-y-1 max-h-32 overflow-y-auto">
              {invitationResults.map((result, index) => (
                <div key={index} className="flex items-center justify-between text-sm p-2 bg-muted rounded">
                  <span>{result.email}</span>
                  <Badge variant={result.success ? "default" : "destructive"}>
                    {result.success ? "Sent" : result.error || "Failed"}
                  </Badge>
                </div>
              ))}
            </div>
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={handleClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button 
            onClick={handleBulkInvite} 
            disabled={invitees.length === 0 || isLoading}
            className="min-w-32"
          >
            {isLoading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                Sending...
              </>
            ) : (
              <>
                <Mail className="h-4 w-4 mr-2" />
                Send {invitees.length} Invitation{invitees.length !== 1 ? 's' : ''}
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
