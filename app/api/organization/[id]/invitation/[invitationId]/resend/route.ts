import { type NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth-helpers";
import { prisma } from "@/lib/db";
import { sendOrganizationInvitation } from "@/lib/email";

export async function POST(
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
      select: { createdBy: true, name: true },
    });

    if (!organization) {
      return NextResponse.json({ error: "Organization not found" }, { status: 404 });
    }

    if (organization.createdBy !== session.user.id) {
      return NextResponse.json({ error: "Only the organization owner can resend invitations" }, { status: 403 });
    }

    // Get the invitation
    const invitation = await prisma.invitation.findFirst({
      where: {
        id: invitationId,
        organizationId,
      },
    });

    if (!invitation) {
      return NextResponse.json({ error: "Invitation not found" }, { status: 404 });
    }

    if (invitation.status !== "pending") {
      return NextResponse.json({ error: "Can only resend pending invitations" }, { status: 400 });
    }

    // Check if invitation is expired
    if (new Date(invitation.expiresAt) < new Date()) {
      return NextResponse.json({ error: "Cannot resend expired invitations" }, { status: 400 });
    }

    // Send invitation email
    let emailSent = false;
    let emailError = null;

    try {
      const inviteLink = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/auth/accept-invitation/${invitation.id}`;
      
      await sendOrganizationInvitation({
        email: invitation.email,
        invitedByUsername: session.user.name || 'Unknown',
        invitedByEmail: session.user.email || 'Unknown',
        organizationName: organization.name,
        inviteLink,
      });
      
      emailSent = true;
    } catch (error) {
      console.error("Failed to resend invitation email:", error);
      emailError = error instanceof Error ? error.message : "Unknown error";
    }

    return NextResponse.json({
      success: true,
      message: "Invitation resent successfully",
      emailSent,
      emailError,
    });

  } catch (error) {
    console.error("Error resending invitation:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
