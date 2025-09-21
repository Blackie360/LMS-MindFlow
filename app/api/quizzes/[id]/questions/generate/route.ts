import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { generateQuestionsForTopic } from "@/lib/ai";
import { z } from "zod";

const GenerateQuestionsSchema = z.object({
  topic: z.string().min(1),
  questionCount: z.number().min(1).max(20).default(5),
  questionType: z.enum(['MULTIPLE_CHOICE', 'TRUE_FALSE', 'ESSAY', 'SHORT_ANSWER']).default('MULTIPLE_CHOICE'),
});

// POST /api/quizzes/[id]/questions/generate - Generate questions using AI
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
    const validatedData = GenerateQuestionsSchema.parse(body);

    const { id } = await params;
    // Check if user is instructor of the course
    const quiz = await prisma.quiz.findFirst({
      where: {
        id: id,
        course: { createdBy: session.user.id }
      },
      include: { course: true, questions: true }
    });

    if (!quiz) {
      return NextResponse.json({ error: "Quiz not found or access denied" }, { status: 404 });
    }

    try {
      // Generate questions using AI
      const aiQuestions = await generateQuestionsForTopic(
        validatedData.topic,
        quiz.course.title,
        validatedData.questionCount,
        validatedData.questionType
      );

      // Create questions in database
      const questions = await Promise.all(
        aiQuestions.map((q, index) =>
          prisma.question.create({
            data: {
              quizId: id,
              type: q.type as any,
              question: q.question,
              options: q.options ? JSON.stringify(q.options) : undefined,
              correctAnswer: q.correctAnswer,
              explanation: q.explanation,
              points: q.points,
              order: quiz.questions.length + index,
            }
          })
        )
      );

      return NextResponse.json({
        success: true,
        data: questions
      });

    } catch (aiError) {
      console.error("AI generation failed:", aiError);
      return NextResponse.json(
        { error: "Failed to generate questions with AI" },
        { status: 500 }
      );
    }

  } catch (error) {
    console.error("Error generating questions:", error);
    
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
