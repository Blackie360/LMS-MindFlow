import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { generateQuizWithAI } from "@/lib/ai";
import { z } from "zod";

const CreateQuizSchema = z.object({
  courseId: z.string(),
  title: z.string().min(1),
  description: z.string().optional(),
  instructions: z.string().optional(),
  timeLimit: z.number().min(1).optional(),
  maxAttempts: z.number().min(1).default(1),
  isGraded: z.boolean().default(true),
  dueDate: z.string().optional(),
  useAI: z.boolean().default(false),
  aiPrompt: z.string().optional(),
  questionCount: z.number().min(1).max(50).default(10),
  difficulty: z.enum(['beginner', 'intermediate', 'advanced']).default('intermediate'),
  questionTypes: z.array(z.string()).default(['MULTIPLE_CHOICE', 'TRUE_FALSE']),
});

// GET /api/quizzes - Get quizzes for a course
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const courseId = searchParams.get('courseId');
    const includeQuestions = searchParams.get('includeQuestions') === 'true';

    if (!courseId) {
      return NextResponse.json({ error: "Course ID is required" }, { status: 400 });
    }

    // Check if user has access to this course
    const course = await prisma.course.findFirst({
      where: {
        id: courseId,
        OR: [
          { createdBy: session.user.id },
          { 
            enrollments: {
              some: { studentId: session.user.id }
            }
          }
        ]
      }
    });

    if (!course) {
      return NextResponse.json({ error: "Course not found or access denied" }, { status: 404 });
    }

    const quizzes = await prisma.quiz.findMany({
      where: { courseId },
      include: {
        questions: includeQuestions ? {
          orderBy: { order: 'asc' }
        } : false,
        submissions: {
          where: { studentId: session.user.id },
          select: {
            id: true,
            score: true,
            percentage: true,
            isGraded: true,
            submittedAt: true,
            timeSpent: true,
          }
        },
        _count: {
          select: {
            questions: true,
            submissions: true,
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json({
      success: true,
      data: quizzes
    });

  } catch (error) {
    console.error("Error fetching quizzes:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// POST /api/quizzes - Create a new quiz
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const validatedData = CreateQuizSchema.parse(body);

    // Check if user is instructor of the course
    const course = await prisma.course.findFirst({
      where: {
        id: validatedData.courseId,
        createdBy: session.user.id
      }
    });

    if (!course) {
      return NextResponse.json({ error: "Course not found or access denied" }, { status: 404 });
    }

    let quizData: any = {
      courseId: validatedData.courseId,
      title: validatedData.title,
      description: validatedData.description,
      instructions: validatedData.instructions,
      timeLimit: validatedData.timeLimit,
      maxAttempts: validatedData.maxAttempts,
      isGraded: validatedData.isGraded,
      dueDate: validatedData.dueDate ? new Date(validatedData.dueDate) : null,
    };

    // If using AI, generate quiz content
    if (validatedData.useAI && validatedData.aiPrompt) {
      try {
        const aiResult = await generateQuizWithAI(
          course.title,
          validatedData.aiPrompt,
          validatedData.difficulty,
          validatedData.questionCount,
          validatedData.questionTypes
        );

        quizData.title = aiResult.title;
        quizData.description = aiResult.description;
        quizData.timeLimit = aiResult.timeLimit;
        quizData.totalPoints = aiResult.totalPoints;

        // Create quiz first
        const quiz = await prisma.quiz.create({
          data: quizData
        });

        // Create questions
        const questions = await Promise.all(
          aiResult.questions.map((q, index) =>
            prisma.question.create({
              data: {
                quizId: quiz.id,
                type: q.type as any,
                question: q.question,
                options: q.options,
                correctAnswer: q.correctAnswer,
                explanation: q.explanation,
                points: q.points,
                order: index,
              }
            })
          )
        );

        return NextResponse.json({
          success: true,
          data: {
            ...quiz,
            questions
          }
        });

      } catch (aiError) {
        console.error("AI generation failed:", aiError);
        return NextResponse.json(
          { error: "Failed to generate quiz with AI" },
          { status: 500 }
        );
      }
    } else {
      // Create quiz without AI
      const quiz = await prisma.quiz.create({
        data: quizData
      });

      return NextResponse.json({
        success: true,
        data: quiz
      });
    }

  } catch (error) {
    console.error("Error creating quiz:", error);
    
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
