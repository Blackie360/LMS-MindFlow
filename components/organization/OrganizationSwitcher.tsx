"use client";

import { useState } from "react";
import { Building2, ChevronDown, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

interface Organization {
  id: string;
  name: string;
  slug: string;
  subscriptionTier?: string;
  schoolCode?: string;
  createdAt: string;
  logo?: string;
  metadata?: any;
  createdBy: string;
}

interface OrganizationSwitcherProps {
  organizations: Organization[];
  currentOrganization: Organization | null;
  onOrganizationChange: (organization: Organization) => void;
  onCreateOrganization: () => void;
  className?: string;
}

export function OrganizationSwitcher({
  organizations,
  currentOrganization,
  onOrganizationChange,
  onCreateOrganization,
  className
}: OrganizationSwitcherProps) {
  const [isOpen, setIsOpen] = useState(false);

  const handleOrganizationSelect = (organization: Organization) => {
    onOrganizationChange(organization);
    setIsOpen(false);
  };

  if (organizations.length === 0) {
    return (
      <div className={cn("flex items-center gap-2", className)}>
        <div className="flex flex-col">
          <p className="text-sm text-muted-foreground mb-2">Organization</p>
          <Button
            onClick={onCreateOrganization}
            variant="outline"
            className="justify-start text-left h-auto p-3"
          >
            <Plus className="h-4 w-4 mr-2" />
            Create Organization
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <div className="flex flex-col">
        <p className="text-sm text-muted-foreground mb-2">Organization</p>
        <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              className="justify-start text-left h-auto p-3 min-w-[200px]"
            >
              <div className="flex items-center gap-2 flex-1">
                <Building2 className="h-4 w-4 text-muted-foreground" />
                <div className="flex flex-col items-start">
                  <span className="font-medium">
                    {currentOrganization?.name || "Select Organization"}
                  </span>
                  {currentOrganization && (
                    <span className="text-xs text-muted-foreground">
                      {organizations.length} organization{organizations.length !== 1 ? 's' : ''}
                    </span>
                  )}
                </div>
              </div>
              <ChevronDown className="h-4 w-4 text-muted-foreground" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-64" align="start">
            {organizations.map((organization) => (
              <DropdownMenuItem
                key={organization.id}
                onClick={() => handleOrganizationSelect(organization)}
                className="flex items-center gap-2 p-3"
              >
                <Building2 className="h-4 w-4 text-muted-foreground" />
                <div className="flex flex-col items-start">
                  <span className="font-medium">{organization.name}</span>
                  <span className="text-xs text-muted-foreground">
                    {organization.subscriptionTier || "basic"}
                  </span>
                </div>
                {currentOrganization?.id === organization.id && (
                  <div className="ml-auto w-2 h-2 bg-green-500 rounded-full" />
                )}
              </DropdownMenuItem>
            ))}
            <DropdownMenuItem
              onClick={onCreateOrganization}
              className="flex items-center gap-2 p-3 text-muted-foreground"
            >
              <Plus className="h-4 w-4" />
              <span>Create New Organization</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}