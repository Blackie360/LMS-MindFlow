import { type NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth-helpers";
import { prisma } from "@/lib/db";
import { sendOrganizationInvitation } from "@/lib/email";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: organizationId } = await params;
    const session = await getSession(request);

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { email, role, department, teamId, metadata } = body;

    if (!email || !role) {
      return NextResponse.json({ error: "Email and role are required" }, { status: 400 });
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
      return NextResponse.json({ error: "Only the organization owner can invite members" }, { status: 403 });
    }

    // Check if organization name is still the default "my_org" or too short
    if (organization.name === "my_org" || organization.name.length < 3) {
      return NextResponse.json({ 
        error: "Please change your organization name to a real organization name (at least 3 characters) before sending invitations. Click on the organization name in the top-left corner to edit it." 
      }, { status: 400 });
    }

    // Check if user is already a member
    const existingMember = await prisma.member.findFirst({
      where: {
        organizationId,
        user: { email },
      },
    });

    if (existingMember) {
      return NextResponse.json({ error: "User is already a member of this organization" }, { status: 400 });
    }

    // Check if there's already a pending invitation
    const existingInvitation = await prisma.invitation.findFirst({
      where: {
        organizationId,
        email,
        status: "pending",
      },
    });

    if (existingInvitation) {
      return NextResponse.json({ error: "Invitation already sent to this email" }, { status: 400 });
    }

    // Create invitation
    const invitation = await prisma.invitation.create({
      data: {
        organizationId,
        email,
        role,
        inviterId: session.user.id,
        department,
        teamId,
        expiresAt: new Date(Date.now() + 48 * 60 * 60 * 1000), // 48 hours
        status: "pending",
      },
    });

    // Send invitation email
    let emailSent = false;
    let emailError = null;

    try {
      const inviteLink = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/auth/accept-invitation/${invitation.id}`;
      
      await sendOrganizationInvitation({
        email,
        invitedByUsername: session.user.name || 'Unknown',
        invitedByEmail: session.user.email || 'Unknown',
        organizationName: organization.name,
        inviteLink,
      });
      
      emailSent = true;
    } catch (error) {
      console.error("Failed to send invitation email:", error);
      emailError = error instanceof Error ? error.message : "Unknown error";
    }

    return NextResponse.json({
      data: invitation,
      emailSent,
      emailError,
    });
  } catch (error) {
    console.error("Error creating invitation:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
