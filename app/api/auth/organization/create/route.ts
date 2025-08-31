import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function POST(request: NextRequest) {
  try {
    // Get the current user from the session
    const session = await auth.api.getSession(request);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { name, slug, schoolCode, subscriptionTier } = body;

    // Validate required fields
    if (!name || !slug) {
      return NextResponse.json({ error: "Name and slug are required" }, { status: 400 });
    }

    // Check if organization with this slug already exists
    const existingOrg = await prisma.organization.findUnique({
      where: { slug },
    });

    if (existingOrg) {
      return NextResponse.json({ error: "Organization with this slug already exists" }, { status: 400 });
    }

    // Create the organization
    const organization = await prisma.organization.create({
      data: {
        name,
        slug,
        schoolCode,
        subscriptionTier: subscriptionTier || "basic",
        maxTeams: subscriptionTier === "premium" ? 20 : 5,
        maxMembersPerTeam: subscriptionTier === "premium" ? 200 : 50,
        branding: {
          primaryColor: "#3b82f6",
          secondaryColor: "#1e40af",
        },
        metadata: {
          type: "school",
          createdBy: session.user.id,
          createdAt: new Date().toISOString(),
        },
        createdBy: session.user.id,
      },
    });

    // Create default "General" team
    await prisma.team.create({
      data: {
        name: "General",
        slug: "general",
        organizationId: organization.id,
        description: "Default team for general courses and activities",
        createdBy: session.user.id,
        category: "default",
      },
    });

    // Add the creator as an admin member
    await prisma.organizationMember.create({
      data: {
        organizationId: organization.id,
        userId: session.user.id,
        role: "admin",
        department: "Administration",
        status: "active",
      },
    });

    return NextResponse.json({ 
      data: organization,
      message: "Organization created successfully" 
    });
  } catch (error) {
    console.error("Organization creation error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
