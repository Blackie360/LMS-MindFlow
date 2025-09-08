import { type NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function POST(request: NextRequest) {
  try {
    const { sessionToken } = await request.json();

    if (!sessionToken) {
      return NextResponse.json(
        { error: "Session token is required" },
        { status: 400 }
      );
    }

    // Decode and validate the session token
    let tokenData;
    try {
      const decoded = Buffer.from(sessionToken, 'base64').toString('utf-8');
      tokenData = JSON.parse(decoded);
    } catch (error) {
      return NextResponse.json(
        { error: "Invalid session token" },
        { status: 400 }
      );
    }

    // Check if token is not too old (5 minutes)
    const tokenAge = Date.now() - tokenData.timestamp;
    if (tokenAge > 5 * 60 * 1000) {
      return NextResponse.json(
        { error: "Session token has expired" },
        { status: 400 }
      );
    }

    // Verify user exists and get updated data
    const user = await prisma.user.findUnique({
      where: { id: tokenData.userId },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        image: true
      }
    });

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    // Return user data for client-side session establishment
    return NextResponse.json({
      success: true,
      data: {
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          image: user.image
        },
        organization: tokenData.organization,
        redirectUrl: tokenData.redirectUrl || `/dashboard?welcome=true&org=${tokenData.organization.slug}`
      }
    });

  } catch (error) {
    console.error("Error processing session token:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
