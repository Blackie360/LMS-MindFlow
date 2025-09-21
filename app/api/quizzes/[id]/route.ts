import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { z } from "zod";

const UpdateQuizSchema = z.object({
  title: z.string().min(1).optional(),
  description: z.string().optional(),
  instructions: z.string().optional(),
  timeLimit: z.number().min(1).optional(),
  maxAttempts: z.number().min(1).optional(),
  isGraded: z.boolean().optional(),
  isPublished: z.boolean().optional(),
  dueDate: z.string().optional(),
});

// GET /api/quizzes/[id] - Get a specific quiz
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const quiz = await prisma.quiz.findFirst({
      where: {
        id: id,
        OR: [
          { 
            course: { 
              createdBy: session.user.id 
            } 
          },
          { 
            course: {
              enrollments: {
                some: { studentId: session.user.id }
              }
            }
          }
        ]
      },
      include: {
        course: {
          select: {
            id: true,
            title: true,
            createdBy: true
          }
        },
        questions: {
          orderBy: { order: 'asc' }
        },
        submissions: {
          where: { studentId: session.user.id },
          select: {
            id: true,
            score: true,
            percentage: true,
            isGraded: true,
            submittedAt: true,
            timeSpent: true,
            maxScore: true,
          }
        },
        _count: {
          select: {
            questions: true,
            submissions: true,
          }
        }
      }
    });

    if (!quiz) {
      return NextResponse.json({ error: "Quiz not found" }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      data: quiz
    });

  } catch (error) {
    console.error("Error fetching quiz:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// PUT /api/quizzes/[id] - Update a quiz
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const validatedData = UpdateQuizSchema.parse(body);

    const { id } = await params;
    // Check if user is instructor of the course
    const quiz = await prisma.quiz.findFirst({
      where: {
        id: id,
        course: { createdBy: session.user.id }
      },
      include: { course: true }
    });

    if (!quiz) {
      return NextResponse.json({ error: "Quiz not found or access denied" }, { status: 404 });
    }

    const updateData: any = { ...validatedData };
    if (validatedData.dueDate) {
      updateData.dueDate = new Date(validatedData.dueDate);
    }

    const updatedQuiz = await prisma.quiz.update({
      where: { id: id },
      data: updateData,
      include: {
        questions: {
          orderBy: { order: 'asc' }
        },
        _count: {
          select: {
            questions: true,
            submissions: true,
          }
        }
      }
    });

    return NextResponse.json({
      success: true,
      data: updatedQuiz
    });

  } catch (error) {
    console.error("Error updating quiz:", error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid input data", details: error.issues },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// DELETE /api/quizzes/[id] - Delete a quiz
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    // Check if user is instructor of the course
    const quiz = await prisma.quiz.findFirst({
      where: {
        id: id,
        course: { createdBy: session.user.id }
      }
    });

    if (!quiz) {
      return NextResponse.json({ error: "Quiz not found or access denied" }, { status: 404 });
    }

    await prisma.quiz.delete({
      where: { id: id }
    });

    return NextResponse.json({
      success: true,
      message: "Quiz deleted successfully"
    });

  } catch (error) {
    console.error("Error deleting quiz:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
