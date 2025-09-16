import { type NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

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
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { name, slug, schoolCode, subscriptionTier } = body;

    if (!slug) {
      return NextResponse.json(
        { error: "Slug is required" },
        { status: 400 }
      );
    }

    // Set default name to "my_org" if not provided
    const organizationName = name || "my_org";
    
    // Generate slug from name if not provided or if it's the default
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
    
    const finalSlug = slug || generateSlug(organizationName);

    // Check if slug already exists
    const existingOrg = await prisma.organization.findUnique({
      where: { slug: finalSlug }
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
        name: organizationName,
        slug: finalSlug,
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
