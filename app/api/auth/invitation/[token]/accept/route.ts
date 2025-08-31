import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await params;
    
    // Get the current user from the session
    const session = await auth.api.getSession(request);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Find the invitation by token
    const invitation = await prisma.organizationInvitation.findUnique({
      where: { token },
      include: {
        organization: true,
      },
    });

    if (!invitation) {
      return NextResponse.json(
        { error: "Invitation not found" },
        { status: 404 }
      );
    }

    // Check if invitation is expired
    if (new Date() > invitation.expiresAt) {
      return NextResponse.json(
        { error: "Invitation has expired" },
        { status: 400 }
      );
    }

    // Check if invitation has already been accepted
    if (invitation.acceptedAt) {
      return NextResponse.json(
        { error: "Invitation has already been accepted" },
        { status: 400 }
      );
    }

    // Check if the user's email matches the invitation email
    if (session.user.email !== invitation.email) {
      return NextResponse.json(
        { error: "This invitation was sent to a different email address" },
        { status: 400 }
      );
    }

    // Check if user is already a member
    const existingMember = await prisma.organizationMember.findFirst({
      where: {
        organizationId: invitation.organizationId,
        userId: session.user.id,
      },
    });

    if (existingMember) {
      return NextResponse.json(
        { error: "You are already a member of this organization" },
        { status: 400 }
      );
    }

    // Use a transaction to ensure data consistency
    const result = await prisma.$transaction(async (tx) => {
      // Create organization membership
      const membership = await tx.organizationMember.create({
        data: {
          organizationId: invitation.organizationId,
          userId: session.user.id,
          role: invitation.role,
          department: invitation.department,
        },
      });

      // Mark invitation as accepted
      await tx.organizationInvitation.update({
        where: { id: invitation.id },
        data: { acceptedAt: new Date() },
      });

      // If teamId is provided, add user to team
      if (invitation.teamId) {
        await tx.teamMember.create({
          data: {
            teamId: invitation.teamId,
            organizationMemberId: membership.id,
            role: invitation.role,
          },
        });
      }

      return membership;
    });

    return NextResponse.json({ 
      data: result,
      message: "Invitation accepted successfully"
    });
  } catch (error) {
    console.error("Invitation acceptance error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
