import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

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
    const { name, slug, description, departmentCode, maxMembers, category } = body;

    // Validate required fields
    if (!name || !slug) {
      return NextResponse.json({ error: "Name and slug are required" }, { status: 400 });
    }

    // Check if team with this slug already exists in the organization
    const existingTeam = await prisma.team.findFirst({
      where: {
        organizationId: id,
        slug,
      },
    });

    if (existingTeam) {
      return NextResponse.json({ error: "Team with this slug already exists in this organization" }, { status: 400 });
    }

    // Create the team
    const team = await prisma.team.create({
      data: {
        name,
        slug,
        description,
        departmentCode,
        maxMembers: maxMembers || 50,
        category,
        organizationId: id,
        createdBy: session.user.id,
      },
    });

    return NextResponse.json({ data: team });
  } catch (error) {
    console.error("Organization team creation error:", error);
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

    // Get all teams in the organization
    const teams = await prisma.team.findMany({
      where: {
        organizationId: id,
      },
      include: {
        members: {
          include: {
            organizationMember: {
              include: {
                user: {
                  select: {
                    id: true,
                    name: true,
                    email: true,
                  },
                },
              },
            },
          },
        },
        creator: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: {
        createdAt: "asc",
      },
    });

    return NextResponse.json({ data: teams });
  } catch (error) {
    console.error("Organization team list error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

