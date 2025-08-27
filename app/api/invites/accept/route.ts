import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth-server"
import { sendEmail, emailTemplates } from "@/lib/email-service"

export async function POST(request: NextRequest) {
  try {
    const { token, password, name } = await request.json()

    if (!token || !password || !name) {
      return NextResponse.json({ 
        error: "Missing required fields: token, password, name" 
      }, { status: 400 })
    }

    // Find and validate invitation
    const invitation = await prisma.invitation.findUnique({
      where: { token },
      include: { course: true }
    })

    if (!invitation) {
      return NextResponse.json({ error: "Invalid invitation token" }, { status: 400 })
    }

    if (invitation.expiresAt < new Date()) {
      return NextResponse.json({ error: "Invitation has expired" }, { status: 400 })
    }

    if (invitation.acceptedAt) {
      return NextResponse.json({ error: "Invitation has already been accepted" }, { status: 400 })
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: invitation.email }
    })

    if (existingUser) {
      return NextResponse.json({ 
        error: "An account with this email already exists" 
      }, { status: 400 })
    }

    // Create new user with the invited role
    const newUser = await prisma.user.create({
      data: {
        email: invitation.email,
        name,
        role: invitation.role,
        emailVerified: true, // Email is verified through invitation
      }
    })

    // Mark invitation as accepted
    await prisma.invitation.update({
      where: { id: invitation.id },
      data: { acceptedAt: new Date() }
    })

    // If course invitation, create enrollment
    if (invitation.courseId) {
      await prisma.enrollment.create({
        data: {
          courseId: invitation.courseId,
          studentId: newUser.id
        }
      })
    }

    // Send welcome email
    const welcomeEmail = emailTemplates.welcomeEmail(
      name,
      `${process.env.BETTER_AUTH_URL}/dashboard`
    )

    await sendEmail({
      to: newUser.email,
      subject: welcomeEmail.subject,
      html: welcomeEmail.html,
      text: welcomeEmail.text,
    })

    return NextResponse.json({ 
      message: "Account created successfully",
      userId: newUser.id,
      role: newUser.role,
      courseId: invitation.courseId
    })

  } catch (error) {
    console.error("Error accepting invitation:", error)
    return NextResponse.json({ error: "Failed to accept invitation" }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const token = searchParams.get("token")

    if (!token) {
      return NextResponse.json({ error: "Token is required" }, { status: 400 })
    }

    // Find and validate invitation
    const invitation = await prisma.invitation.findUnique({
      where: { token },
      include: { 
        course: true,
        invitedByUser: {
          select: { name: true, email: true }
        }
      }
    })

    if (!invitation) {
      return NextResponse.json({ error: "Invalid invitation token" }, { status: 400 })
    }

    if (invitation.expiresAt < new Date()) {
      return NextResponse.json({ error: "Invitation has expired" }, { status: 400 })
    }

    if (invitation.acceptedAt) {
      return NextResponse.json({ error: "Invitation has already been accepted" }, { status: 400 })
    }

    return NextResponse.json({ 
      invitation: {
        email: invitation.email,
        role: invitation.role,
        course: invitation.course,
        invitedBy: invitation.invitedByUser,
        expiresAt: invitation.expiresAt
      }
    })

  } catch (error) {
    console.error("Error fetching invitation:", error)
    return NextResponse.json({ error: "Failed to fetch invitation" }, { status: 500 })
  }
}
