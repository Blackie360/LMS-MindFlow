import { type NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth-helpers";
import { prisma } from "@/lib/db";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: organizationId } = await params;
    const session = await getSession(request);

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if user is a member of this organization
    const userMembership = await prisma.member.findFirst({
      where: {
        organizationId,
        userId: session.user.id,
      },
    });

    if (!userMembership) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    // Get recent invitation updates (last 24 hours)
    const recentUpdates = await prisma.invitation.findMany({
      where: {
        organizationId,
        status: {
          in: ["accepted", "rejected"]
        },
        acceptedAt: {
          gte: new Date(Date.now() - 24 * 60 * 60 * 1000) // Last 24 hours
        }
      },
      include: {
        inviter: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: {
        acceptedAt: "desc"
      },
      take: 50 // Limit to 50 recent updates
    });

    return NextResponse.json({
      success: true,
      data: recentUpdates,
      count: recentUpdates.length
    });

  } catch (error) {
    console.error("Error fetching invitation updates:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
