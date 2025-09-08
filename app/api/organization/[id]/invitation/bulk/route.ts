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
    const { invitees } = body;

    if (!invitees || !Array.isArray(invitees) || invitees.length === 0) {
      return NextResponse.json({ error: "Invitees array is required" }, { status: 400 });
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

    const results = [];
    const errors = [];

    // Process each invitation
    for (const invitee of invitees) {
      try {
        const { email, role, department, teamId, metadata } = invitee;

        if (!email || !role) {
          results.push({
            email,
            success: false,
            error: "Email and role are required"
          });
          continue;
        }

        // Check if user is already a member
        const existingMember = await prisma.member.findFirst({
          where: {
            organizationId,
            user: { email },
          },
        });

        if (existingMember) {
          results.push({
            email,
            success: false,
            error: "User is already a member of this organization"
          });
          continue;
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
          results.push({
            email,
            success: false,
            error: "Invitation already sent to this email"
          });
          continue;
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
          console.error(`Failed to send invitation email to ${email}:`, error);
          emailError = error instanceof Error ? error.message : "Unknown error";
        }

        results.push({
          email,
          success: true,
          invitationId: invitation.id,
          emailSent,
          emailError
        });

      } catch (error) {
        console.error(`Error processing invitation for ${invitee.email}:`, error);
        results.push({
          email: invitee.email,
          success: false,
          error: error instanceof Error ? error.message : "Unknown error"
        });
      }
    }

    const successCount = results.filter(r => r.success).length;
    const totalCount = results.length;

    return NextResponse.json({
      success: true,
      message: `Successfully processed ${successCount} out of ${totalCount} invitations`,
      results,
      summary: {
        total: totalCount,
        successful: successCount,
        failed: totalCount - successCount
      }
    });

  } catch (error) {
    console.error("Error processing bulk invitations:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
