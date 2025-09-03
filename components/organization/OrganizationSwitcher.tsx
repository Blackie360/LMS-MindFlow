"use client";

import { Building2, Users } from "lucide-react";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export function OrganizationSwitcher() {
  const [activeOrganization, setActiveOrganization] = useState<string>("");
  const [activeTeam, setActiveTeam] = useState<string>("");

  const organizations = [
    {
      id: "org1",
      name: "MindFlow Academy",
      slug: "mindflow-academy",
      tier: "premium",
    },
    {
      id: "org2",
      name: "Tech Learning Institute",
      slug: "tech-learning",
      tier: "basic",
    },
  ];

  const teams = [
    { id: "team1", name: "Science Department", orgId: "org1" },
    { id: "team2", name: "General Studies", orgId: "org1" },
  ];

  return (
    <div className="space-y-4">
      <Card className="border-orange-200 bg-gradient-to-r from-orange-50 to-orange-100">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Building2 className="h-5 w-5 text-orange-600" />
              <CardTitle className="text-lg">Active School</CardTitle>
            </div>
            <Badge variant="success">Premium</Badge>
          </div>
        </CardHeader>
        <CardContent>
          <Select
            value={activeOrganization}
            onValueChange={setActiveOrganization}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select a school..." />
            </SelectTrigger>
            <SelectContent>
              {organizations.map((org) => (
                <SelectItem key={org.id} value={org.id}>
                  {org.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {activeOrganization && (
        <Card className="border-blue-200 bg-gradient-to-r from-blue-50 to-blue-100">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-blue-600" />
              <CardTitle className="text-lg">Active Team</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <Select value={activeTeam} onValueChange={setActiveTeam}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select a team..." />
              </SelectTrigger>
              <SelectContent>
                {teams
                  .filter((team) => team.orgId === activeOrganization)
                  .map((team) => (
                    <SelectItem key={team.id} value={team.id}>
                      {team.name}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
