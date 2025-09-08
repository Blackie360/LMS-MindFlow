import { type NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth-helpers";
import { prisma } from "@/lib/db";

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; invitationId: string }> }
) {
  try {
    const { id: organizationId, invitationId } = await params;
    const session = await getSession(request);

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if user is the owner of this organization
    const organization = await prisma.organization.findUnique({
      where: { id: organizationId },
      select: { createdBy: true },
    });

    if (!organization) {
      return NextResponse.json({ error: "Organization not found" }, { status: 404 });
    }

    if (organization.createdBy !== session.user.id) {
      return NextResponse.json({ error: "Only the organization owner can delete invitations" }, { status: 403 });
    }

    // Check if invitation exists and belongs to this organization
    const invitation = await prisma.invitation.findFirst({
      where: {
        id: invitationId,
        organizationId,
      },
    });

    if (!invitation) {
      return NextResponse.json({ error: "Invitation not found" }, { status: 404 });
    }

    // Delete the invitation
    await prisma.invitation.delete({
      where: { id: invitationId },
    });

    return NextResponse.json({
      success: true,
      message: "Invitation deleted successfully",
    });

  } catch (error) {
    console.error("Error deleting invitation:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
