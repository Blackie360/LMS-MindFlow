import { google } from '@ai-sdk/google';
import { generateObject, generateText } from 'ai';
import { z } from 'zod';

// Initialize Google AI with Gemini
export const gemini = google(process.env.GOOGLE_AI_API_KEY!);

// Schema for quiz generation
export const QuizGenerationSchema = z.object({
  title: z.string(),
  description: z.string(),
  questions: z.array(z.object({
    question: z.string(),
    type: z.enum(['MULTIPLE_CHOICE', 'TRUE_FALSE', 'ESSAY', 'SHORT_ANSWER']),
    options: z.array(z.string()).optional(),
    correctAnswer: z.string().optional(),
    explanation: z.string().optional(),
    points: z.number().min(1).max(10),
  })),
  timeLimit: z.number().min(5).max(180), // 5 minutes to 3 hours
  totalPoints: z.number(),
});

export type QuizGenerationResult = z.infer<typeof QuizGenerationSchema>;

// Schema for quiz grading
export const QuizGradingSchema = z.object({
  score: z.number(),
  maxScore: z.number(),
  percentage: z.number(),
  feedback: z.string(),
  questionGrades: z.array(z.object({
    questionId: z.string(),
    isCorrect: z.boolean(),
    points: z.number(),
    feedback: z.string(),
  })),
});

export type QuizGradingResult = z.infer<typeof QuizGradingSchema>;

// Generate quiz using AI
export async function generateQuizWithAI(
  courseTitle: string,
  topic: string,
  difficulty: 'beginner' | 'intermediate' | 'advanced',
  questionCount: number = 10,
  questionTypes: string[] = ['MULTIPLE_CHOICE', 'TRUE_FALSE']
): Promise<QuizGenerationResult> {
  const prompt = `
You are an expert educational content creator. Create a comprehensive quiz for the following specifications:

Course: ${courseTitle}
Topic: ${topic}
Difficulty: ${difficulty}
Number of questions: ${questionCount}
Question types: ${questionTypes.join(', ')}

Requirements:
1. Create engaging, educational questions that test understanding
2. For multiple choice questions, provide 4 options with only one correct answer
3. Include clear explanations for each answer
4. Ensure questions are appropriate for the difficulty level
5. Make questions relevant to the topic and course
6. Vary the point values (1-10 points per question)
7. Set an appropriate time limit based on question count and difficulty

Generate a quiz that will effectively assess student learning and provide valuable feedback.
`;

  try {
    const result = await generateObject({
      model: gemini,
      schema: QuizGenerationSchema,
      prompt,
    });

    return result.object;
  } catch (error) {
    console.error('Error generating quiz with AI:', error);
    throw new Error('Failed to generate quiz with AI');
  }
}

// Grade quiz using AI
export async function gradeQuizWithAI(
  quizTitle: string,
  questions: Array<{
    id: string;
    question: string;
    type: string;
    correctAnswer?: string;
    points: number;
  }>,
  studentAnswers: Array<{
    questionId: string;
    answer: string;
  }>
): Promise<QuizGradingResult> {
  const prompt = `
You are an expert educator grading a quiz. Please grade the following quiz submission:

Quiz: ${quizTitle}

Questions and Student Answers:
${questions.map((q, index) => `
Question ${index + 1}: ${q.question}
Type: ${q.type}
Correct Answer: ${q.correctAnswer || 'N/A'}
Points: ${q.points}
Student Answer: ${studentAnswers.find(a => a.questionId === q.id)?.answer || 'No answer provided'}
`).join('\n')}

Grading Instructions:
1. For multiple choice and true/false: Award full points for correct answers, 0 for incorrect
2. For essay and short answer: Evaluate based on content quality, accuracy, and completeness
3. Provide constructive feedback for each question
4. Calculate total score and percentage
5. Give overall feedback on the student's performance

Be fair but thorough in your grading. Provide helpful feedback that will help the student learn.
`;

  try {
    const result = await generateObject({
      model: gemini,
      schema: QuizGradingSchema,
      prompt,
    });

    return result.object;
  } catch (error) {
    console.error('Error grading quiz with AI:', error);
    throw new Error('Failed to grade quiz with AI');
  }
}

// Generate quiz questions for a specific topic
export async function generateQuestionsForTopic(
  topic: string,
  courseContext: string,
  questionCount: number = 5,
  questionType: 'MULTIPLE_CHOICE' | 'TRUE_FALSE' | 'ESSAY' | 'SHORT_ANSWER' = 'MULTIPLE_CHOICE'
): Promise<Array<{
  question: string;
  type: string;
  options?: string[];
  correctAnswer?: string;
  explanation?: string;
  points: number;
}>> {
  const prompt = `
Create ${questionCount} ${questionType.toLowerCase().replace('_', ' ')} questions about "${topic}" in the context of "${courseContext}".

Requirements:
- Questions should be clear and educational
- Test understanding, not just memorization
- For multiple choice: provide 4 options with only one correct answer
- Include explanations for answers
- Vary point values (1-5 points per question)
- Make questions relevant and engaging

Format as a JSON array of question objects.
`;

  try {
    const result = await generateText({
      model: gemini,
      prompt,
    });

    // Parse the JSON response
    const questions = JSON.parse(result.text);
    return questions;
  } catch (error) {
    console.error('Error generating questions with AI:', error);
    throw new Error('Failed to generate questions with AI');
  }
}

// Generate feedback for student performance
export async function generatePerformanceFeedback(
  studentName: string,
  quizTitle: string,
  score: number,
  maxScore: number,
  percentage: number,
  strengths: string[],
  areasForImprovement: string[]
): Promise<string> {
  const prompt = `
Generate encouraging and constructive feedback for a student's quiz performance:

Student: ${studentName}
Quiz: ${quizTitle}
Score: ${score}/${maxScore} (${percentage}%)

Strengths: ${strengths.join(', ')}
Areas for Improvement: ${areasForImprovement.join(', ')}

Write feedback that:
1. Acknowledges their effort and strengths
2. Provides specific guidance for improvement
3. Encourages continued learning
4. Is supportive and motivating
5. Offers concrete next steps

Keep it concise but meaningful (2-3 paragraphs).
`;

  try {
    const result = await generateText({
      model: gemini,
      prompt,
    });

    return result.text;
  } catch (error) {
    console.error('Error generating feedback with AI:', error);
    return 'Great job on completing the quiz! Keep up the good work and continue learning.';
  }
}

