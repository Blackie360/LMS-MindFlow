import { NextRequest, NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/session"
import { prisma } from "@/lib/prisma"
import { generateCourseCertificatePDF } from "@/lib/pdf-generator"

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    
    if (!user || user.role !== "STUDENT") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const courseId = searchParams.get('courseId')

    if (!courseId) {
      return NextResponse.json({ error: "Course ID is required" }, { status: 400 })
    }

    // Check if student is enrolled and has completed the course
    const enrollment = await prisma.enrollment.findUnique({
      where: {
        courseId_studentId: {
          courseId,
          studentId: user.id
        }
      },
      include: {
        course: {
          include: {
            instructor: true,
            modules: {
              include: {
                lessons: {
                  include: {
                    lessonCompletions: {
                      where: {
                        studentId: user.id
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    })

    if (!enrollment) {
      return NextResponse.json({ error: "Not enrolled in this course" }, { status: 404 })
    }

    // Check if course is completed (all lessons completed)
    let totalLessons = 0
    let completedLessons = 0

    for (const module of enrollment.course.modules) {
      for (const lesson of module.lessons) {
        totalLessons++
        if (lesson.lessonCompletions.length > 0) {
          completedLessons++
        }
      }
    }

    if (totalLessons === 0 || completedLessons < totalLessons) {
      return NextResponse.json({ 
        error: "Course not completed. Complete all lessons to receive certificate." 
      }, { status: 400 })
    }

    // Get the completion date (latest lesson completion)
    let completionDate = enrollment.enrolledAt
    for (const module of enrollment.course.modules) {
      for (const lesson of module.lessons) {
        for (const completion of lesson.lessonCompletions) {
          if (completion.completedAt > completionDate) {
            completionDate = completion.completedAt
          }
        }
      }
    }

    // Generate certificate PDF
    const pdfBuffer = generateCourseCertificatePDF(
      user.name || user.email,
      enrollment.course.title,
      completionDate,
      enrollment.course.instructor.name || enrollment.course.instructor.email
    )

    const filename = `certificate_${enrollment.course.title.replace(/\s+/g, '_')}_${user.name?.replace(/\s+/g, '_') || 'student'}.pdf`

    return new NextResponse(pdfBuffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${filename}"`
      }
    })
  } catch (error) {
    console.error("Certificate generation error:", error)
    return NextResponse.json({ 
      error: "Failed to generate certificate" 
    }, { status: 500 })
  }
}