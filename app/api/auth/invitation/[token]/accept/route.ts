import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await params;
    const body = await request.json();
    const { name, password } = body;

    console.log("Accepting invitation with data:", { token, name, email: body.email });

    if (!name || !password) {
      return NextResponse.json(
        { error: "Name and password are required" },
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
            slug: true,
          },
        },
      },
    });

    if (!invitation) {
      console.log("Invalid invitation token:", token);
      return NextResponse.json(
        { error: "Invalid invitation token" },
        { status: 404 }
      );
    }

    console.log("Found invitation:", invitation);

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
      // Create new user using Better Auth
      console.log("Creating new user with Better Auth");
      
      try {
        const signUpResult = await auth.api.signUpEmail({
          body: {
            email: invitation.email,
            name,
            password,
          },
        });

        if (!signUpResult || !signUpResult.user) {
          throw new Error("Failed to create user account");
        }

        user = signUpResult.user;
        console.log("Created user:", user.id);
        
        // Update user role based on invitation
        let userRole = "STUDENT"; // default
        if (invitation.role === "instructor" || invitation.role === "lead_instructor") {
          userRole = "INSTRUCTOR";
        } else if (invitation.role === "admin" || invitation.role === "super_admin") {
          userRole = "ADMIN";
        }
        
        // Update the user's role in the database
        await prisma.user.update({
          where: { id: user.id },
          data: { role: userRole as any },
        });
        
        console.log("Updated user role to:", userRole);
      } catch (error) {
        console.error("Error creating user with Better Auth:", error);
        return NextResponse.json(
          { error: "Failed to create user account" },
          { status: 500 }
        );
      }
    } else {
      console.log("User already exists:", user.id);
    }

    // Add user to organization
    console.log("Adding user to organization:", invitation.organization.id);
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

    console.log("Invitation accepted successfully for user:", user.email);

    // Return success response with redirect URL
    return NextResponse.json({
      success: true,
      message: "Invitation accepted successfully! Welcome to the organization.",
      data: {
        userId: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        organization: invitation.organization,
        redirectUrl: `/dashboard?welcome=true&org=${invitation.organization.slug}`,
      },
    });

  } catch (error) {
    console.error("Error accepting invitation:", error);
    return NextResponse.json(
      { error: "Failed to accept invitation. Please try again." },
      { status: 500 }
    );
  }
}
