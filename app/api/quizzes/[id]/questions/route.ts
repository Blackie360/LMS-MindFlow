import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { z } from "zod";

const CreateQuestionSchema = z.object({
  type: z.enum(['MULTIPLE_CHOICE', 'TRUE_FALSE', 'ESSAY', 'SHORT_ANSWER', 'FILL_IN_BLANK']),
  question: z.string().min(1),
  options: z.array(z.string()).optional(),
  correctAnswer: z.string().optional(),
  explanation: z.string().optional(),
  points: z.number().min(1).max(10).default(1),
  order: z.number().default(0),
});

// GET /api/quizzes/[id]/questions - Get questions for a quiz
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
      }
    });

    if (!quiz) {
      return NextResponse.json({ error: "Quiz not found or access denied" }, { status: 404 });
    }

    const questions = await prisma.question.findMany({
      where: { quizId: id },
      orderBy: { order: 'asc' }
    });

    return NextResponse.json({
      success: true,
      data: questions
    });

  } catch (error) {
    console.error("Error fetching questions:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// POST /api/quizzes/[id]/questions - Create a new question
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const validatedData = CreateQuestionSchema.parse(body);

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

    const question = await prisma.question.create({
      data: {
        quizId: id,
        type: validatedData.type,
        question: validatedData.question,
        options: validatedData.options ? JSON.stringify(validatedData.options) : undefined,
        correctAnswer: validatedData.correctAnswer,
        explanation: validatedData.explanation,
        points: validatedData.points,
        order: validatedData.order,
      }
    });

    return NextResponse.json({
      success: true,
      data: question
    });

  } catch (error) {
    console.error("Error creating question:", error);
    
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
