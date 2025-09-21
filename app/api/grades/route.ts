import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";

// GET /api/grades - Get grades
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const courseId = searchParams.get('courseId');
    const studentId = searchParams.get('studentId');

    // Build where clause based on user role and filters
    let whereClause: any = {};

    if (session.user.role === "STUDENT") {
      // Students can only see their own grades
      whereClause.studentId = session.user.id;
    } else if (session.user.role === "INSTRUCTOR") {
      // Instructors can see grades for their courses
      whereClause.course = {
        createdBy: session.user.id
      };
    }

    // Apply additional filters
    if (courseId) {
      whereClause.courseId = courseId;
    }

    if (studentId && session.user.role !== "STUDENT") {
      whereClause.studentId = studentId;
    }

    const grades = await prisma.grade.findMany({
      where: whereClause,
      include: {
        student: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        course: {
          select: {
            id: true,
            title: true
          }
        },
        quiz: {
          select: {
            id: true,
            title: true
          }
        },
        assignment: {
          select: {
            id: true,
            title: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json({
      success: true,
      data: grades
    });

  } catch (error) {
    console.error("Error fetching grades:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// POST /api/grades - Create a new grade
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Only instructors can create grades
    if (session.user.role !== "INSTRUCTOR") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await request.json();
    const { studentId, courseId, quizId, assignmentId, score, maxScore, category } = body;

    // Validate required fields
    if (!studentId || !courseId || !score || !maxScore) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Check if user is instructor of the course
    const course = await prisma.course.findFirst({
      where: {
        id: courseId,
        createdBy: session.user.id
      }
    });

    if (!course) {
      return NextResponse.json({ error: "Course not found or access denied" }, { status: 404 });
    }

    const percentage = (score / maxScore) * 100;
    const letterGrade = getLetterGrade(percentage);

    const grade = await prisma.grade.create({
      data: {
        studentId,
        courseId,
        quizId,
        assignmentId,
        score,
        maxScore,
        percentage,
        letterGrade,
        category: category || 'assignment'
      },
      include: {
        student: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        course: {
          select: {
            id: true,
            title: true
          }
        },
        quiz: {
          select: {
            id: true,
            title: true
          }
        },
        assignment: {
          select: {
            id: true,
            title: true
          }
        }
      }
    });

    return NextResponse.json({
      success: true,
      data: grade
    });

  } catch (error) {
    console.error("Error creating grade:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// Helper function to calculate letter grade
function getLetterGrade(percentage: number): string {
  if (percentage >= 90) return 'A';
  if (percentage >= 80) return 'B';
  if (percentage >= 70) return 'C';
  if (percentage >= 60) return 'D';
  return 'F';
}
