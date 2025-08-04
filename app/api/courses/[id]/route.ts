import { NextRequest, NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/session"
import { prisma } from "@/lib/prisma"

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Ensure only instructors can delete courses
    if (user.role !== "INSTRUCTOR") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const { id } = params

    // Verify the course exists and belongs to the user
    const course = await prisma.course.findUnique({
      where: { id },
      include: {
        enrollments: true,
        modules: {
          include: {
            lessons: {
              include: {
                lessonCompletions: true
              }
            }
          }
        }
      }
    })

    if (!course) {
      return NextResponse.json({ error: "Course not found" }, { status: 404 })
    }

    if (course.createdBy !== user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    // Delete in the correct order to handle foreign key constraints
    // 1. Delete lesson completions
    for (const module of course.modules) {
      for (const lesson of module.lessons) {
        await prisma.lessonCompletion.deleteMany({
          where: { lessonId: lesson.id }
        })
      }
    }

    // 2. Delete lessons
    for (const module of course.modules) {
      await prisma.lesson.deleteMany({
        where: { moduleId: module.id }
      })
    }

    // 3. Delete modules
    await prisma.module.deleteMany({
      where: { courseId: id }
    })

    // 4. Delete enrollments
    await prisma.enrollment.deleteMany({
      where: { courseId: id }
    })

    // 5. Finally delete the course
    await prisma.course.delete({
      where: { id }
    })

    return NextResponse.json({ message: "Course deleted successfully" })
  } catch (error) {
    console.error("Delete course API error:", error)
    
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}