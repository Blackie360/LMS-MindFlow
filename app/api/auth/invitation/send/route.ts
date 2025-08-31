import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { sendEmail, generateInvitationEmail } from "@/lib/email";
import { auth } from "@/lib/auth";

export async function POST(request: NextRequest) {
  try {
    const session = await auth.api.getSession(request);
    if (!session) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { email, role, organizationId, organizationName, courseId } = body;

    if (!email || !role || !organizationId || !organizationName) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    // Check if user is already a member of this organization
    if (existingUser) {
      const existingMember = await prisma.organizationMember.findUnique({
        where: {
          organizationId_userId: {
            organizationId,
            userId: existingUser.id,
          },
        },
      });

      if (existingMember) {
        return NextResponse.json(
          { error: "User is already a member of this organization" },
          { status: 400 }
        );
      }
    }

    // Generate invitation token
    const token = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

    // Create invitation record
    const invitation = await prisma.organizationInvitation.create({
      data: {
        organizationId,
        email,
        role,
        invitedBy: session.user.id,
        token,
        expiresAt,
        department: body.department,
        teamId: body.teamId,
      },
    });

    // Generate invitation URL
    const baseUrl = process.env.NEXTAUTH_URL || "http://localhost:3000";
    const invitationUrl = `${baseUrl}/auth/accept-invitation?token=${token}`;

    // Send invitation email
    const emailSent = await sendEmail({
      to: email,
      subject: `You're invited to join ${organizationName} on MindFlow`,
      html: generateInvitationEmail(
        session.user.name || session.user.email,
        organizationName,
        role,
        invitationUrl
      ),
    });

    if (!emailSent) {
      // Delete invitation if email failed
      await prisma.organizationInvitation.delete({
        where: { id: invitation.id },
      });
      return NextResponse.json(
        { error: "Failed to send invitation email" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Invitation sent successfully",
      data: {
        id: invitation.id,
        email: invitation.email,
        role: invitation.role,
        expiresAt: invitation.expiresAt,
      },
    });
  } catch (error) {
    console.error("Error sending invitation:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
