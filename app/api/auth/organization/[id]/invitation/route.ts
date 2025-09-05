import { type NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { sendInvitationEmail } from "@/lib/email";
import { randomBytes } from "crypto";

function generateToken(): string {
  return randomBytes(32).toString("base64url");
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;

    // Get the current user from the session
    const session = await auth.api.getSession(request);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Ensure the current user is the owner (creator) of the organization
    const organization = await prisma.organization.findUnique({
      where: { id },
      select: { id: true, name: true, slug: true, createdBy: true },
    });

    if (!organization) {
      return NextResponse.json(
        { error: "Organization not found" },
        { status: 404 },
      );
    }

    if (organization.createdBy !== session.user.id) {
      return NextResponse.json(
        { error: "Forbidden - Only the organization owner can invite members" },
        { status: 403 },
      );
    }

    const body = await request.json();
    const { email, role, department, teamId, expiresIn } = body as {
      email: string;
      role: string;
      department?: string;
      teamId?: string;
      expiresIn?: number;
    };

    // Validate required fields
    if (!email || !role) {
      return NextResponse.json(
        { error: "Email and role are required" },
        { status: 400 },
      );
    }

    // Check if user is already a member
    const existingMember = await prisma.organizationMember.findFirst({
      where: {
        organizationId: id,
        user: { email },
      },
    });

    if (existingMember) {
      return NextResponse.json(
        { error: "User is already a member of this organization" },
        { status: 400 },
      );
    }

    // Check if invitation already exists
    const existingInvitation = await prisma.organizationInvitation.findFirst({
      where: {
        organizationId: id,
        email,
      },
    });

    if (existingInvitation) {
      return NextResponse.json(
        { error: "Invitation already exists for this email" },
        { status: 400 },
      );
    }

    // Validate team if provided
    if (teamId) {
      const team = await prisma.team.findFirst({
        where: {
          id: teamId,
          organizationId: id,
        },
      });

      if (!team) {
        return NextResponse.json({ error: "Invalid team ID" }, { status: 400 });
      }
    }

    const expiryDays = Number.isFinite(expiresIn) && (expiresIn as number) > 0 ? (expiresIn as number) : 7;
    const invitation = await prisma.organizationInvitation.create({
      data: {
        organizationId: id,
        email,
        role,
        department,
        teamId,
        invitedBy: session.user.id,
        token: generateToken(),
        expiresAt: new Date(Date.now() + expiryDays * 24 * 60 * 60 * 1000),
        expiresIn: expiryDays,
      },
    });

    // Send invitation email
    let emailSent = false;
    let emailError = null;

    try {
      console.log("🔄 Attempting to send invitation email to:", email);
      console.log("📧 SMTP Configuration:", {
        host: process.env.SMTP_HOST,
        port: process.env.SMTP_PORT,
        user: process.env.SMTP_USER,
        hasPassword: !!process.env.SMTP_PASSWORD,
      });

      const invitationUrl = `${request.nextUrl.origin}/invitation/${invitation.token}`;

      const emailResult = await sendInvitationEmail({
        to: email,
        organizationName: organization.name,
        inviterName: session.user.name || session.user.email,
        role,
        department,
        invitationUrl,
        expiresIn: expiryDays,
      });

      emailSent = true;
      console.log("✅ Invitation email sent successfully to:", email);
      console.log("📨 Email result:", emailResult);
    } catch (error) {
      emailError = error;
      console.error("❌ Failed to send invitation email:", error);
      console.error("🔍 Error details:", {
        message: error instanceof Error ? error.message : String(error),
        code: (error as any)?.code,
        stack: error instanceof Error ? error.stack : undefined,
      });
      // Don't fail the entire request if email fails, but log it
    }

    return NextResponse.json({
      data: invitation,
      message: emailSent
        ? "Invitation created and email sent successfully"
        : "Invitation created but email failed to send",
      emailSent,
      emailError: emailError instanceof Error ? emailError.message : null,
    });
  } catch (error) {
    console.error("Organization invitation creation error:", error);

    // Handle specific Prisma errors
    if ((error as any)?.code === "P2003") {
      return NextResponse.json(
        { error: "Invalid organization ID or team ID" },
        { status: 400 },
      );
    }

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
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

    // Get all invitations for the organization
    const invitations = await prisma.organizationInvitation.findMany({
      where: {
        organizationId: id,
      },
      include: {
        organization: true,
        inviter: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json({ data: invitations });
  } catch (error) {
    console.error("Organization invitation list error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
