import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { gradeQuizWithAI } from "@/lib/ai";
import { z } from "zod";

const SubmitQuizSchema = z.object({
  answers: z.array(z.object({
    questionId: z.string(),
    answer: z.string(),
  })),
  timeSpent: z.number().optional(),
});

// GET /api/quizzes/[id]/submissions - Get quiz submissions
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

    // If user is instructor, get all submissions
    // If user is student, get only their submissions
    const whereClause = quiz.course.createdBy === session.user.id 
      ? { quizId: id }
      : { quizId: id, studentId: session.user.id };

    const submissions = await prisma.quizSubmission.findMany({
      where: whereClause,
      include: {
        student: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        answers: {
          include: {
            question: true
          }
        }
      },
      orderBy: { submittedAt: 'desc' }
    });

    return NextResponse.json({
      success: true,
      data: submissions
    });

  } catch (error) {
    console.error("Error fetching submissions:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// POST /api/quizzes/[id]/submissions - Submit a quiz
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
    const validatedData = SubmitQuizSchema.parse(body);

    const { id } = await params;
    // Check if user is enrolled in the course
    const quiz = await prisma.quiz.findFirst({
      where: {
        id: id,
        course: {
          enrollments: {
            some: { studentId: session.user.id }
          }
        }
      },
      include: {
        course: true,
        questions: true
      }
    });

    if (!quiz) {
      return NextResponse.json({ error: "Quiz not found or access denied" }, { status: 404 });
    }

    // Check if quiz is published
    if (!quiz.isPublished) {
      return NextResponse.json({ error: "Quiz is not available" }, { status: 400 });
    }

    // Check if due date has passed
    if (quiz.dueDate && new Date() > quiz.dueDate) {
      return NextResponse.json({ error: "Quiz submission deadline has passed" }, { status: 400 });
    }

    // Check if user has exceeded max attempts
    const existingSubmissions = await prisma.quizSubmission.count({
      where: {
        quizId: id,
        studentId: session.user.id
      }
    });

    if (existingSubmissions >= quiz.maxAttempts) {
      return NextResponse.json({ 
        error: `Maximum attempts (${quiz.maxAttempts}) exceeded` 
      }, { status: 400 });
    }

    // Create submission
    const submission = await prisma.quizSubmission.create({
      data: {
        quizId: id,
        studentId: session.user.id,
        timeSpent: validatedData.timeSpent,
      }
    });

    // Create answers
    const answers = await Promise.all(
      validatedData.answers.map(answer =>
        prisma.answer.create({
          data: {
            questionId: answer.questionId,
            submissionId: submission.id,
            answer: answer.answer,
          }
        })
      )
    );

    // Auto-grade if enabled
    if (quiz.isGraded) {
      try {
        const aiGrading = await gradeQuizWithAI(
          quiz.title,
          quiz.questions.map(q => ({
            id: q.id,
            question: q.question,
            type: q.type,
            correctAnswer: q.correctAnswer,
            points: q.points,
          })),
          validatedData.answers
        );

        // Update submission with grade
        await prisma.quizSubmission.update({
          where: { id: submission.id },
          data: {
            score: aiGrading.score,
            maxScore: aiGrading.maxScore,
            percentage: aiGrading.percentage,
            isGraded: true,
            gradedAt: new Date(),
            feedback: aiGrading.feedback,
          }
        });

        // Update answers with individual grades
        await Promise.all(
          aiGrading.questionGrades.map(async (grade) => {
            const answer = answers.find(a => a.questionId === grade.questionId);
            if (answer) {
              await prisma.answer.update({
                where: { id: answer.id },
                data: {
                  isCorrect: grade.isCorrect,
                  points: grade.points,
                }
              });
            }
          })
        );

        // Create grade record
        await prisma.grade.create({
          data: {
            studentId: session.user.id,
            courseId: quiz.courseId,
            quizId: quiz.id,
            score: aiGrading.score,
            maxScore: aiGrading.maxScore,
            percentage: aiGrading.percentage,
            letterGrade: getLetterGrade(aiGrading.percentage),
            category: 'quiz',
          }
        });

      } catch (gradingError) {
        console.error("Auto-grading failed:", gradingError);
        // Continue without auto-grading
      }
    }

    // Return submission with updated data
    const updatedSubmission = await prisma.quizSubmission.findUnique({
      where: { id: submission.id },
      include: {
        answers: {
          include: {
            question: true
          }
        }
      }
    });

    return NextResponse.json({
      success: true,
      data: updatedSubmission
    });

  } catch (error) {
    console.error("Error submitting quiz:", error);
    
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

// Helper function to calculate letter grade
function getLetterGrade(percentage: number): string {
  if (percentage >= 90) return 'A';
  if (percentage >= 80) return 'B';
  if (percentage >= 70) return 'C';
  if (percentage >= 60) return 'D';
  return 'F';
}
