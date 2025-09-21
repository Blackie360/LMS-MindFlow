"use client";

import { useState, useEffect } from "react";
import { Clock, CheckCircle, Brain, Play, Eye, AlertCircle, Calendar } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { QuizTaking } from "./QuizTaking";

interface Quiz {
  id: string;
  title: string;
  description?: string;
  timeLimit?: number;
  maxAttempts: number;
  isGraded: boolean;
  totalPoints: number;
  dueDate?: string;
  createdAt: string;
  questions: Array<{
    id: string;
    question: string;
    type: 'MULTIPLE_CHOICE' | 'TRUE_FALSE' | 'ESSAY' | 'SHORT_ANSWER';
    options?: string[];
    correctAnswer?: string;
    explanation?: string;
    points: number;
    order: number;
  }>;
  course: {
    id: string;
    title: string;
  };
  _count: {
    questions: number;
    submissions: number;
  };
  submissions: Array<{
    id: string;
    score?: number;
    percentage?: number;
    isGraded: boolean;
    submittedAt: string;
    timeSpent?: number;
  }>;
}

interface StudentQuizListProps {
  courseId?: string;
}

export function StudentQuizList({ courseId }: StudentQuizListProps) {
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedQuiz, setSelectedQuiz] = useState<Quiz | null>(null);
  const [showQuizTaking, setShowQuizTaking] = useState(false);

  useEffect(() => {
    fetchQuizzes();
  }, [courseId]);

  const fetchQuizzes = async () => {
    try {
      setIsLoading(true);
      const url = courseId 
        ? `/api/quizzes?courseId=${courseId}&includeQuestions=true`
        : '/api/quizzes?includeQuestions=true';
      
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error("Failed to fetch quizzes");
      }

      const data = await response.json();
      setQuizzes(data.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch quizzes");
    } finally {
      setIsLoading(false);
    }
  };

  const handleTakeQuiz = (quiz: Quiz) => {
    setSelectedQuiz(quiz);
    setShowQuizTaking(true);
  };

  const handleQuizComplete = async (answers: Array<{ questionId: string; answer: string }>) => {
    if (!selectedQuiz) return;

    try {
      const response = await fetch(`/api/quizzes/${selectedQuiz.id}/submissions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ answers }),
      });

      if (!response.ok) {
        throw new Error('Failed to submit quiz');
      }

      const result = await response.json();
      
      // Close quiz taking interface
      setShowQuizTaking(false);
      setSelectedQuiz(null);
      
      // Refresh quizzes to show updated submission
      fetchQuizzes();
      
      // Show success message or redirect to results
      alert('Quiz submitted successfully!');
      
    } catch (error) {
      console.error('Error submitting quiz:', error);
      alert('Failed to submit quiz. Please try again.');
    }
  };

  const getStatusBadge = (quiz: Quiz) => {
    const now = new Date();
    const dueDate = quiz.dueDate ? new Date(quiz.dueDate) : null;
    const hasSubmission = quiz.submissions.length > 0;
    const canRetake = quiz.submissions.length < quiz.maxAttempts;

    if (dueDate && now > dueDate) {
      return <Badge className="bg-red-100 text-red-800">Expired</Badge>;
    }

    if (hasSubmission) {
      if (quiz.submissions[0].isGraded) {
        return <Badge className="bg-green-100 text-green-800">Completed</Badge>;
      } else {
        return <Badge className="bg-yellow-100 text-yellow-800">Submitted</Badge>;
      }
    }

    if (canRetake) {
      return <Badge className="bg-blue-100 text-blue-800">Available</Badge>;
    }

    return <Badge className="bg-gray-100 text-gray-800">Unavailable</Badge>;
  };

  const canTakeQuiz = (quiz: Quiz) => {
    const now = new Date();
    const dueDate = quiz.dueDate ? new Date(quiz.dueDate) : null;
    const hasSubmission = quiz.submissions.length > 0;
    const canRetake = quiz.submissions.length < quiz.maxAttempts;

    if (dueDate && now > dueDate) return false;
    if (hasSubmission && !canRetake) return false;
    
    return true;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading quizzes...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Available Quizzes</h2>
          <p className="text-gray-600">
            Take quizzes to test your knowledge and track your progress
          </p>
        </div>
      </div>

      {error && (
        <div className="text-sm text-red-600 bg-red-50 p-3 rounded-md">
          {error}
        </div>
      )}

      {quizzes.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <Brain className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Quizzes Available</h3>
            <p className="text-gray-600">
              There are no quizzes available for you to take at the moment.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {quizzes.map((quiz) => (
            <Card key={quiz.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg">{quiz.title}</CardTitle>
                    <CardDescription className="mt-1">
                      {quiz.course.title}
                    </CardDescription>
                  </div>
                  {getStatusBadge(quiz)}
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {quiz.description && (
                  <div className="text-sm text-gray-600">
                    <p className="line-clamp-2">{quiz.description}</p>
                  </div>
                )}

                <div className="flex items-center justify-between text-sm text-gray-500">
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-1">
                      <CheckCircle className="h-4 w-4" />
                      <span>{quiz._count.questions} questions</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Brain className="h-4 w-4" />
                      <span>{quiz.totalPoints} points</span>
                    </div>
                    {quiz.timeLimit && (
                      <div className="flex items-center space-x-1">
                        <Clock className="h-4 w-4" />
                        <span>{quiz.timeLimit}m</span>
                      </div>
                    )}
                  </div>
                </div>

                {quiz.dueDate && (
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <Calendar className="h-4 w-4" />
                    <span>Due: {new Date(quiz.dueDate).toLocaleDateString()}</span>
                  </div>
                )}

                {quiz.submissions.length > 0 && (
                  <div className="p-3 bg-blue-50 border border-blue-200 rounded-md">
                    <div className="text-sm">
                      <div className="font-medium text-blue-900">Latest Submission</div>
                      <div className="text-blue-800">
                        {quiz.submissions[0].isGraded ? (
                          <>
                            Score: {quiz.submissions[0].score}/{quiz.totalPoints} 
                            ({quiz.submissions[0].percentage}%)
                          </>
                        ) : (
                          "Submitted - Pending Grade"
                        )}
                      </div>
                      <div className="text-xs text-blue-600">
                        Submitted: {new Date(quiz.submissions[0].submittedAt).toLocaleString()}
                      </div>
                    </div>
                  </div>
                )}

                <div className="flex items-center justify-between">
                  <div className="text-sm text-gray-500">
                    <span>
                      {quiz.submissions.length}/{quiz.maxAttempts} attempts used
                    </span>
                  </div>
                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSelectedQuiz(quiz)}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    {canTakeQuiz(quiz) && (
                      <Button
                        size="sm"
                        onClick={() => handleTakeQuiz(quiz)}
                        className="bg-brand hover:bg-brand/90"
                      >
                        <Play className="h-4 w-4 mr-2" />
                        {quiz.submissions.length > 0 ? "Retake" : "Take Quiz"}
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Quiz Taking Dialog */}
      <Dialog open={showQuizTaking} onOpenChange={setShowQuizTaking}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Taking Quiz: {selectedQuiz?.title}</DialogTitle>
            <DialogDescription>
              Complete all questions and submit when ready
            </DialogDescription>
          </DialogHeader>
          {selectedQuiz && (
            <QuizTaking
              quiz={selectedQuiz}
              onComplete={handleQuizComplete}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Quiz Preview Dialog */}
      <Dialog open={!!selectedQuiz && !showQuizTaking} onOpenChange={() => setSelectedQuiz(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Quiz Preview: {selectedQuiz?.title}</DialogTitle>
            <DialogDescription>
              Review quiz details before taking it
            </DialogDescription>
          </DialogHeader>
          {selectedQuiz && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-brand">
                    {selectedQuiz._count.questions}
                  </div>
                  <div className="text-sm text-gray-600">Questions</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {selectedQuiz.totalPoints}
                  </div>
                  <div className="text-sm text-gray-600">Total Points</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">
                    {selectedQuiz.timeLimit || '∞'}
                  </div>
                  <div className="text-sm text-gray-600">Time Limit (min)</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">
                    {selectedQuiz.maxAttempts}
                  </div>
                  <div className="text-sm text-gray-600">Max Attempts</div>
                </div>
              </div>

              {selectedQuiz.description && (
                <div className="p-3 bg-gray-50 border rounded-md">
                  <h4 className="font-medium mb-2">Description</h4>
                  <p className="text-sm text-gray-600">{selectedQuiz.description}</p>
                </div>
              )}

              {selectedQuiz.dueDate && (
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <Calendar className="h-4 w-4" />
                  <span>Due: {new Date(selectedQuiz.dueDate).toLocaleString()}</span>
                </div>
              )}

              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setSelectedQuiz(null)}>
                  Close
                </Button>
                {canTakeQuiz(selectedQuiz) && (
                  <Button
                    onClick={() => handleTakeQuiz(selectedQuiz)}
                    className="bg-brand hover:bg-brand/90"
                  >
                    <Play className="h-4 w-4 mr-2" />
                    {selectedQuiz.submissions.length > 0 ? "Retake Quiz" : "Take Quiz"}
                  </Button>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

