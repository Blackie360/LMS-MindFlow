import { type NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: organizationId } = await params;
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get organization with members
    const organization = await prisma.organization.findUnique({
      where: { id: organizationId },
      include: {
        members: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                image: true,
              },
            },
          },
        },
        teams: true,
        _count: {
          select: {
            members: true,
            teams: true,
            courses: true,
          },
        },
      },
    });

    if (!organization) {
      return NextResponse.json({ error: "Organization not found" }, { status: 404 });
    }

    // Check if user is a member of this organization
    const userMembership = organization.members.find(
      (member) => member.userId === session.user.id
    );

    if (!userMembership) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    return NextResponse.json({ data: organization });
  } catch (error) {
    console.error("Error fetching organization:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: organizationId } = await params;
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { name, slug, schoolCode, subscriptionTier, metadata } = body;

    // Check if user is the owner of this organization
    const organization = await prisma.organization.findUnique({
      where: { id: organizationId },
      select: { createdBy: true },
    });

    if (!organization) {
      return NextResponse.json({ error: "Organization not found" }, { status: 404 });
    }

    if (organization.createdBy !== session.user.id) {
      return NextResponse.json({ error: "Only the organization owner can edit" }, { status: 403 });
    }

    // Update organization
    const updatedOrganization = await prisma.organization.update({
      where: { id: organizationId },
      data: {
        ...(name && { name }),
        ...(slug && { slug }),
        ...(schoolCode !== undefined && { schoolCode }),
        ...(subscriptionTier && { subscriptionTier }),
        ...(metadata && { metadata }),
        updatedAt: new Date(),
      },
    });

    return NextResponse.json({ data: updatedOrganization });
  } catch (error) {
    console.error("Error updating organization:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: organizationId } = await params;
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if user is the owner of this organization
    const organization = await prisma.organization.findUnique({
      where: { id: organizationId },
      select: { createdBy: true, name: true },
    });

    if (!organization) {
      return NextResponse.json({ error: "Organization not found" }, { status: 404 });
    }

    if (organization.createdBy !== session.user.id) {
      return NextResponse.json({ error: "Only the organization owner can delete" }, { status: 403 });
    }

    // Delete organization (cascade will handle related records)
    await prisma.organization.delete({
      where: { id: organizationId },
    });

    return NextResponse.json({ 
      success: true, 
      message: `Organization "${organization.name}" has been deleted successfully` 
    });
  } catch (error) {
    console.error("Error deleting organization:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
