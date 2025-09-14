import { type NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import bcrypt from "bcryptjs";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ token: string }> },
) {
  try {
    const { token } = await params;
    const body = await request.json();
    const { name, password } = body;

    console.log("Accepting invitation with data:", {
      token,
      name,
      email: body.email,
    });

    if (!name || !password) {
      return NextResponse.json(
        { error: "Name and password are required" },
        { status: 400 },
      );
    }

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

    // Check if invitation has already been accepted
    if (invitation.acceptedAt) {
      return NextResponse.json(
        { error: "Invitation has already been accepted" },
        { status: 400 },
      );
    }

    // Check if user already exists
    let user: any = await prisma.user.findUnique({
      where: { email: invitation.email },
    });

    if (!user) {
      // Create new user
      console.log("Creating new user");

      try {
        // Hash password
        const hashedPassword = await bcrypt.hash(password, 12);

        // Determine user role based on invitation
        let userRole = "STUDENT"; // default
        if (
          invitation.role === "instructor" ||
          invitation.role === "lead_instructor" ||
          invitation.role === "leadInstructor"
        ) {
          userRole = "INSTRUCTOR";
        } else if (
          invitation.role === "admin" ||
          invitation.role === "super_admin" ||
          invitation.role === "superAdmin"
        ) {
          userRole = "ADMIN";
        }

        // Create user
        user = await prisma.user.create({
          data: {
            email: invitation.email,
            name,
            password: hashedPassword,
            role: userRole as "STUDENT" | "INSTRUCTOR" | "ADMIN" | "SUPER_ADMIN",
          },
        });

        console.log("Created user:", user.id);
      } catch (error) {
        console.error("Error creating user:", error);
        return NextResponse.json(
          { error: "Failed to create user account" },
          { status: 500 },
        );
      }
    } else {
      console.log("User already exists:", user.id);
    }

    // Add user to organization
    if (!user?.id) {
      throw new Error("User ID is required");
    }
    
    console.log("Adding user to organization:", invitation.organization.id);
    await prisma.member.create({
      data: {
        organizationId: invitation.organization.id,
        userId: user.id,
        role: invitation.role,
        department: invitation.department,
        status: "active",
      },
    });

    // Mark invitation as accepted
    await prisma.invitation.update({
      where: { id: invitation.id },
      data: { 
        acceptedAt: new Date(),
        status: "accepted"
      },
    });

    console.log("Invitation accepted successfully for user:", user.email);

    // Determine redirect URL based on user role
    let redirectUrl = `/dashboard?welcome=true&org=${invitation.organization.slug}`;

    // Get the updated user with the correct role
    const updatedUser = await prisma.user.findUnique({
      where: { id: user.id },
      select: { role: true },
    });

    if (updatedUser) {
      switch (updatedUser.role) {
        case "INSTRUCTOR":
          redirectUrl = `/dashboard/instructor?welcome=true&org=${invitation.organization.slug}`;
          break;
        case "STUDENT":
          redirectUrl = `/dashboard/student?welcome=true&org=${invitation.organization.slug}`;
          break;
        case "ADMIN":
        case "SUPER_ADMIN":
          redirectUrl = `/dashboard?welcome=true&org=${invitation.organization.slug}`;
          break;
        default:
          redirectUrl = `/dashboard?welcome=true&org=${invitation.organization.slug}`;
      }
    }

    console.log("Redirecting user to:", redirectUrl);

    // Create a temporary session token for automatic sign-in
    const sessionToken = Buffer.from(JSON.stringify({
      userId: user.id,
      email: user.email,
      name: user.name,
      role: updatedUser?.role || user.role,
      organization: invitation.organization,
      timestamp: Date.now()
    })).toString('base64');

    // Return success response with role-specific redirect URL and session data
    return NextResponse.json({
      success: true,
      message: "Invitation accepted successfully! Welcome to the organization.",
      data: {
        userId: user.id,
        email: user.email,
        name: user.name,
        role: updatedUser?.role || user.role,
        organization: invitation.organization,
        redirectUrl,
        sessionToken, // Temporary token for automatic sign-in
        autoSignIn: true
      },
    });
  } catch (error) {
    console.error("Error accepting invitation:", error);
    return NextResponse.json(
      { error: "Failed to accept invitation. Please try again." },
      { status: 500 },
    );
  }
}
