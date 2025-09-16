import { type NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ token: string }> },
) {
  try {
    const { token } = await params;
    const body = await request.json();
    const { reason } = body; // Optional rejection reason

    console.log("Rejecting invitation with data:", {
      token,
      reason,
    });

    // Find invitation by token (using id as token)
    const invitation = await prisma.invitation.findUnique({
      where: { id: token },
      include: {
        organization: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
        inviter: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    if (!invitation) {
      console.log("Invalid invitation token:", token);
      return NextResponse.json(
        { error: "Invalid invitation token" },
        { status: 404 },
      );
    }

    console.log("Found invitation:", invitation);

    // Check if invitation has expired
    if (new Date() > invitation.expiresAt) {
      return NextResponse.json(
        { error: "Invitation has expired" },
        { status: 400 },
      );
    }

    // Check if invitation has already been accepted or rejected
    if (invitation.acceptedAt || invitation.status === "accepted") {
      return NextResponse.json(
        { error: "Invitation has already been accepted" },
        { status: 400 },
      );
    }

    if (invitation.status === "rejected") {
      return NextResponse.json(
        { error: "Invitation has already been rejected" },
        { status: 400 },
      );
    }

    // Mark invitation as rejected
    await prisma.invitation.update({
      where: { id: invitation.id },
      data: { 
        status: "rejected",
        // Store rejection reason in metadata if needed
        ...(reason && { 
          // You could add a rejectionReason field to the schema if needed
        })
      },
    });

    console.log("Invitation rejected successfully for email:", invitation.email);

    // TODO: Send notification to inviter about rejection
    // This could be implemented with email notifications or real-time updates

    return NextResponse.json({
      success: true,
      message: "Invitation rejected successfully.",
      data: {
        invitationId: invitation.id,
        email: invitation.email,
        organization: invitation.organization,
        inviter: invitation.inviter,
        rejectedAt: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error("Error rejecting invitation:", error);
    return NextResponse.json(
      { error: "Failed to reject invitation. Please try again." },
      { status: 500 },
    );
  }
}
