"use client";

import { useState, useRef, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Check, Edit3, X, Loader2, Plus } from "lucide-react";
import { cn } from "@/lib/utils";

interface OrganizationNameFieldProps {
  organizationId?: string;
  organizationName?: string;
  onUpdate?: (newName: string) => void;
  onCreate?: (organization: any) => void;
  className?: string;
  placeholder?: string;
}

export function OrganizationNameField({
  organizationId,
  organizationName,
  onUpdate,
  onCreate,
  className,
  placeholder = "Organization name"
}: OrganizationNameFieldProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(organizationName || "");
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const isCreating = !organizationId;

  // Update local state when organizationName prop changes
  useEffect(() => {
    setName(organizationName || "");
  }, [organizationName]);

  // Focus input when entering edit mode
  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  // Generate slug from organization name
  const generateSlug = (orgName: string) => {
    return orgName
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '') // Remove special characters except spaces and hyphens
      .replace(/\s+/g, '-') // Replace spaces with hyphens
      .replace(/-+/g, '-') // Replace multiple hyphens with single hyphen
      .replace(/(^-|-$)/g, '') // Remove leading/trailing hyphens
      .substring(0, 50); // Limit length
  };

  const handleSave = async () => {
    if (!name.trim()) {
      setError("Organization name cannot be empty");
      return;
    }

    if (name.trim().length < 3) {
      setError("Organization name must be at least 3 characters long");
      return;
    }

    if (name.trim() === organizationName) {
      setIsEditing(false);
      return;
    }

    setIsSaving(true);
    setError(null);

    const trimmedName = name.trim();
    const generatedSlug = generateSlug(trimmedName);

    try {
      if (isCreating) {
        // Create new organization
        const response = await fetch("/api/organization", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ 
            name: trimmedName,
            slug: generatedSlug
          }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "Failed to create organization");
        }

        const { data } = await response.json();
        
        // Call the onCreate callback if provided
        if (onCreate) {
          onCreate(data);
        }
      } else {
        // Update existing organization
        const response = await fetch(`/api/organization/${organizationId}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ 
            name: trimmedName,
            slug: generatedSlug
          }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "Failed to update organization name");
        }

        const { data } = await response.json();
        
        // Call the onUpdate callback if provided
        if (onUpdate) {
          onUpdate(data.name);
        }
      }

      setIsEditing(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : `Failed to ${isCreating ? 'create' : 'update'} organization`);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setName(organizationName || "");
    setError(null);
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleSave();
    } else if (e.key === "Escape") {
      e.preventDefault();
      handleCancel();
    }
  };

  const handleClick = () => {
    if (!isEditing) {
      setIsEditing(true);
    }
  };

  if (isEditing) {
    return (
      <div className={cn("flex items-center gap-2", className)}>
        <Input
          ref={inputRef}
          value={name}
          onChange={(e) => setName(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className={cn(
            "text-lg font-semibold",
            error && "border-red-500 focus:border-red-500"
          )}
          disabled={isSaving}
        />
        <div className="flex items-center gap-1">
          <Button
            size="sm"
            variant="ghost"
            onClick={handleSave}
            disabled={isSaving || !name.trim()}
            className="h-8 w-8 p-0"
          >
            {isSaving ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Check className="h-4 w-4" />
            )}
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={handleCancel}
            disabled={isSaving}
            className="h-8 w-8 p-0"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
        {error && (
          <p className="text-sm text-red-500 mt-1">{error}</p>
        )}
      </div>
    );
  }

  return (
    <div className={cn("flex items-center gap-2 group", className)}>
      <div className="flex flex-col">
        <p className={cn(
          "text-lg font-semibold cursor-pointer hover:text-orange-600 transition-colors",
          (organizationName === "my_org" || !organizationName || organizationName.length < 3) ? "text-orange-600" : "text-foreground"
        )}>
          {organizationName || "Click to create organization"}
        </p>
        {(!organizationName || organizationName === "my_org" || organizationName.length < 3) && (
          <p className="text-xs text-orange-500 mt-1">
            {!organizationName 
              ? "Click to create your organization" 
              : "Click to change organization name (must be at least 3 characters for sending invites)"
            }
          </p>
        )}
      </div>
      <Button
        size="sm"
        variant="ghost"
        onClick={handleClick}
        className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
      >
        {!organizationName ? <Plus className="h-4 w-4" /> : <Edit3 className="h-4 w-4" />}
      </Button>
    </div>
  );
}
