import { type NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth-helpers";
import { prisma } from "@/lib/db";

export async function GET(request: NextRequest) {
  try {
    const session = await getSession(request);

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get user's organizations
    const organizations = await prisma.organization.findMany({
      where: {
        members: {
          some: {
            userId: session.user.id,
          },
        },
      },
      include: {
        members: {
          where: {
            userId: session.user.id,
          },
          select: {
            role: true,
            department: true,
            status: true,
          },
        },
        _count: {
          select: {
            members: true,
            teams: true,
            courses: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ data: organizations });
  } catch (error) {
    console.error("Error fetching organizations:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
