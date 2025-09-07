import { type NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth-helpers";
import { prisma } from "@/lib/db";

export async function GET(request: NextRequest) {
  try {
    const session = await getSession(request);

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get user's organizations
    const organizations = await prisma.organization.findMany({
      where: {
        members: {
          some: {
            userId: session.user.id,
          },
        },
      },
      include: {
        members: {
          where: {
            userId: session.user.id,
          },
          select: {
            role: true,
            department: true,
            status: true,
          },
        },
        _count: {
          select: {
            members: true,
            teams: true,
            courses: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ data: organizations });
  } catch (error) {
    console.error("Error fetching organizations:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getSession(request);

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { name, slug, schoolCode, subscriptionTier } = body;

    if (!name || !slug) {
      return NextResponse.json(
        { error: "Name and slug are required" },
        { status: 400 }
      );
    }

    // Check if slug already exists
    const existingOrg = await prisma.organization.findUnique({
      where: { slug }
    });

    if (existingOrg) {
      return NextResponse.json(
        { error: "Organization with this slug already exists" },
        { status: 400 }
      );
    }

    // Create organization
    const organization = await prisma.organization.create({
      data: {
        name,
        slug,
        schoolCode,
        subscriptionTier: subscriptionTier || "basic",
        createdBy: session.user.id,
        metadata: {
          type: "school",
          maxTeams: subscriptionTier === "premium" ? 20 : subscriptionTier === "enterprise" ? 999 : 5,
          maxMembersPerTeam: subscriptionTier === "premium" ? 200 : subscriptionTier === "enterprise" ? 999 : 50,
          branding: {
            primaryColor: "#3b82f6",
            secondaryColor: "#1e40af",
          },
          createdAt: new Date().toISOString(),
        },
      },
    });

    // Add the creator as the first member with admin role
    await prisma.member.create({
      data: {
        organizationId: organization.id,
        userId: session.user.id,
        role: "admin",
        status: "active",
      },
    });

    return NextResponse.json({ 
      data: organization,
      message: "Organization created successfully" 
    });
  } catch (error) {
    console.error("Error creating organization:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
