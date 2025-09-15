import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (session.user.role !== "INSTRUCTOR") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const userId = session.user.id;

    // Get all students enrolled in instructor's courses
    const enrollments = await prisma.enrollment.findMany({
      where: {
        course: {
          createdBy: userId
        }
      },
      include: {
        student: {
          select: {
            id: true,
            name: true,
            email: true,
            createdAt: true
          }
        },
        course: {
          select: {
            id: true,
            title: true,
            category: true,
            level: true,
            modules: {
              include: {
                lessons: true
              }
            }
          }
        }
      },
      orderBy: {
        enrolledAt: "desc"
      }
    });

    // Calculate progress for each student
    const studentsWithProgress = await Promise.all(enrollments.map(async (enrollment) => {
      const course = enrollment.course;
      const totalLessons = course.modules.reduce((acc: number, module: any) => acc + module.lessons.length, 0);
      
      // Calculate completed lessons for this student
      const completedLessons = await prisma.lessonCompletion.count({
        where: {
          studentId: enrollment.studentId,
          lesson: {
            module: {
              courseId: course.id
            }
          }
        }
      });

      const progressPercentage = totalLessons > 0 ? (completedLessons / totalLessons) * 100 : 0;
      const status = progressPercentage === 100 ? "completed" : "active";

      return {
        id: enrollment.id,
        studentId: enrollment.student.id,
        name: enrollment.student.name || "Unknown",
        email: enrollment.student.email,
        courseTitle: course.title,
        courseCategory: course.category,
        courseLevel: course.level,
        enrolledAt: enrollment.enrolledAt,
        progress: Math.round(progressPercentage * 10) / 10,
        status,
        totalLessons,
        completedLessons
      };
    }));

    // Calculate summary statistics
    const totalStudents = studentsWithProgress.length;
    const activeStudents = studentsWithProgress.filter(s => s.status === "active").length;
    const completedStudents = studentsWithProgress.filter(s => s.status === "completed").length;
    const averageCompletionRate = totalStudents > 0 ? 
      Math.round(studentsWithProgress.reduce((acc, s) => acc + s.progress, 0) / totalStudents * 10) / 10 : 0;

    const summary = {
      totalStudents,
      activeStudents,
      completedStudents,
      averageCompletionRate
    };

    return NextResponse.json({
      success: true,
      data: studentsWithProgress,
      summary
    });

  } catch (error) {
    console.error("Error fetching students:", error);
    return NextResponse.json(
      { error: "Failed to fetch students" },
      { status: 500 }
    );
  }
}
