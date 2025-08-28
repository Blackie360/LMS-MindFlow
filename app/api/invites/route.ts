import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth-server"
import { prisma } from "@/lib/prisma"
import { sendEmail, emailTemplates } from "@/lib/email-service"

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    // Verify the current user is authenticated and has permission to send invites
    const session = await auth.api.getSession({ request })
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { email, role, courseId, invitedBy } = await request.json()

    // Check permissions based on current user's role
    const currentUser = await prisma.user.findUnique({
      where: { id: session.user.id }
    })

    if (!currentUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // Only admins can invite to admin/instructor roles
    if (role === "ADMIN" && currentUser.role !== "ADMIN") {
      return NextResponse.json({ error: "Insufficient permissions" }, { status: 403 })
    }

    // Only admins and instructors can invite to instructor role
    if (role === "INSTRUCTOR" && !["ADMIN", "INSTRUCTOR"].includes(currentUser.role)) {
      return NextResponse.json({ error: "Insufficient permissions" }, { status: 403 })
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: email.toLowerCase() }
    })

    if (existingUser) {
      // User exists, check if they can be invited to the course
      if (courseId) {
        const existingEnrollment = await prisma.enrollment.findUnique({
          where: {
            courseId_studentId: {
              courseId,
              studentId: existingUser.id
            }
          }
        })

        if (existingEnrollment) {
          return NextResponse.json({ error: "User is already enrolled in this course" }, { status: 400 })
        }
      }

      // Send course invitation email
      if (courseId) {
        const course = await prisma.course.findUnique({
          where: { id: courseId }
        })

        if (course) {
          const invitationEmail = emailTemplates.courseInvitation(
            existingUser.name || existingUser.email,
            course.title,
            `${process.env.BETTER_AUTH_URL}/courses/${courseId}`,
            invitedBy || currentUser.name || "MindFlow"
          )

          await sendEmail({
            to: existingUser.email,
            subject: invitationEmail.subject,
            html: invitationEmail.html,
            text: invitationEmail.text,
          })

          // Create enrollment
          await prisma.enrollment.create({
            data: {
              courseId,
              studentId: existingUser.id
            }
          })

          return NextResponse.json({ 
            message: "User invited to course successfully",
            type: "course_invitation"
          })
        }
      }

      return NextResponse.json({ error: "Course not found" }, { status: 404 })
    } else {
      // User doesn't exist, create invitation record and send email
      const invitationToken = crypto.randomUUID()
      const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days

      // Create invitation record
      const invitation = await prisma.invitation.create({
        data: {
          email: email.toLowerCase(),
          role: role || "STUDENT",
          courseId,
          invitedBy: currentUser.id,
          token: invitationToken,
          expiresAt
        }
      })

      // Send invitation email
      let invitationEmail
      if (courseId) {
        const course = await prisma.course.findUnique({
          where: { id: courseId }
        })

        invitationEmail = emailTemplates.courseInvitation(
          email,
          course?.title || "Course",
          `${process.env.BETTER_AUTH_URL}/invite/accept?token=${invitationToken}`,
          invitedBy || currentUser.name || "MindFlow"
        )
      } else if (role && role !== "STUDENT") {
        invitationEmail = emailTemplates.roleInvitation(
          email,
          role,
          `${process.env.BETTER_AUTH_URL}/invite/accept?token=${invitationToken}`,
          invitedBy || currentUser.name || "MindFlow"
        )
      }

      if (invitationEmail) {
        await sendEmail({
          to: email,
          subject: invitationEmail.subject,
          html: invitationEmail.html,
          text: invitationEmail.text,
        })
      }

      return NextResponse.json({ 
        message: "Invitation sent successfully",
        type: "new_user_invitation",
        invitationId: invitation.id
      })
    }
  } catch (error) {
    console.error("Error sending invitation:", error)
    return NextResponse.json({ error: "Failed to send invitation" }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await auth.api.getSession({ request })
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const currentUser = await prisma.user.findUnique({
      where: { id: session.user.id }
    })

    if (!currentUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // Get invitations based on user permissions
    let invitations
    if (currentUser.role === "ADMIN") {
      invitations = await prisma.invitation.findMany({
        include: {
          course: true,
          invitedByUser: {
            select: { name: true, email: true }
          }
        },
        orderBy: { createdAt: "desc" }
      })
    } else if (currentUser.role === "INSTRUCTOR") {
      invitations = await prisma.invitation.findMany({
        where: {
          OR: [
            { invitedBy: currentUser.id },
            { courseId: { in: await prisma.course.findMany({
              where: { createdBy: currentUser.id },
              select: { id: true }
            }).then(courses => courses.map(c => c.id)) } }
          ]
        },
        include: {
          course: true,
          invitedByUser: {
            select: { name: true, email: true }
          }
        },
        orderBy: { createdAt: "desc" }
      })
    } else {
      return NextResponse.json({ error: "Insufficient permissions" }, { status: 403 })
    }

    return NextResponse.json({ invitations })
  } catch (error) {
    console.error("Error fetching invitations:", error)
    return NextResponse.json({ error: "Failed to fetch invitations" }, { status: 500 })
  }
}
