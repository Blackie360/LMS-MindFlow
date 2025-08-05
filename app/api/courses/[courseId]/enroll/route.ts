import { type NextRequest, NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/session"
import { prisma } from "@/lib/prisma"

export async function POST(request: NextRequest, { params }: { params: { courseId: string } }) {
  try {
    const user = await getCurrentUser()
    if (!user || user.role !== "STUDENT") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { courseId } = params

    // Check if already enrolled
    const existingEnrollment = await prisma.enrollment.findUnique({
      where: {
        courseId_studentId: {
          courseId,
          studentId: user.id
        }
      }
    })

    if (existingEnrollment) {
      return NextResponse.json({ error: "Already enrolled in this course" }, { status: 409 })
    }

    // Create enrollment
    const enrollment = await prisma.enrollment.create({
      data: {
        courseId,
        studentId: user.id
      }
    })

    return NextResponse.json(enrollment)
  } catch (error) {
    console.error("Error enrolling in course:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}