import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    // Get the current user from the session
    const session = await auth.api.getSession(request);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { userId, role, department, grade, status } = body;

    // Validate required fields
    if (!userId || !role) {
      return NextResponse.json({ error: "User ID and role are required" }, { status: 400 });
    }

    // Check if user is already a member
    const existingMember = await prisma.organizationMember.findFirst({
      where: {
        organizationId: id,
        userId,
      },
    });

    if (existingMember) {
      return NextResponse.json({ error: "User is already a member of this organization" }, { status: 400 });
    }

    // Create the member
    const member = await prisma.organizationMember.create({
      data: {
        organizationId: id,
        userId,
        role,
        department,
        grade,
        status: status || "active",
        enrollmentDate: new Date(),
      },
    });

    return NextResponse.json({ data: member });
  } catch (error) {
    console.error("Organization member creation error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    // Get the current user from the session
    const session = await auth.api.getSession(request);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if user is a member of the organization
    const member = await prisma.organizationMember.findFirst({
      where: {
        organizationId: id,
        userId: session.user.id,
      },
    });

    if (!member) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get all members of the organization
    const members = await prisma.organizationMember.findMany({
      where: {
        organizationId: id,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
          },
        },
        teamMemberships: {
          include: {
            team: {
              select: {
                id: true,
                name: true,
                slug: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: "asc",
      },
    });

    return NextResponse.json({ data: members });
  } catch (error) {
    console.error("Organization member list error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

