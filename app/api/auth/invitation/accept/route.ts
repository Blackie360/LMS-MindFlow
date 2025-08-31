import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";
import bcrypt from "bcryptjs";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { token, name, password } = body;

    if (!token || !name || !password) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Find invitation by token
    const invitation = await prisma.organizationInvitation.findUnique({
      where: { token },
      include: {
        organization: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    if (!invitation) {
      return NextResponse.json(
        { error: "Invalid invitation token" },
        { status: 404 }
      );
    }

    // Check if invitation has expired
    if (new Date() > invitation.expiresAt) {
      return NextResponse.json(
        { error: "Invitation has expired" },
        { status: 400 }
      );
    }

    // Check if invitation has already been accepted
    if (invitation.acceptedAt) {
      return NextResponse.json(
        { error: "Invitation has already been accepted" },
        { status: 400 }
      );
    }

    // Check if user already exists
    let user = await prisma.user.findUnique({
      where: { email: invitation.email },
    });

    if (!user) {
      // Create new user
      const hashedPassword = await bcrypt.hash(password, 12);
      
      user = await prisma.user.create({
        data: {
          email: invitation.email,
          name,
          password: hashedPassword,
          role: invitation.role.toUpperCase() as any, // Convert to Role enum
        },
      });
    }

    // Add user to organization
    await prisma.organizationMember.create({
      data: {
        organizationId: invitation.organization.id,
        userId: user.id,
        role: invitation.role,
        department: invitation.department,
        status: "active",
      },
    });

    // Mark invitation as accepted
    await prisma.organizationInvitation.update({
      where: { id: invitation.id },
      data: { acceptedAt: new Date() },
    });

    // Create session for the new user
    const session = await auth.api.createSession({
      userId: user.id,
      expiresIn: 60 * 60 * 24 * 7, // 7 days
    });

    // Set session cookie
    const response = NextResponse.json({
      success: true,
      message: "Invitation accepted successfully",
      data: {
        userId: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        organization: invitation.organization,
      },
    });

    // Set the session cookie
    response.cookies.set("auth-session", session.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });

    return response;
  } catch (error) {
    console.error("Error accepting invitation:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
