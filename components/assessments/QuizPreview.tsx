"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Clock, Users, CheckCircle, Brain, Calendar } from "lucide-react";

interface Question {
  id: string;
  question: string;
  type: 'MULTIPLE_CHOICE' | 'TRUE_FALSE' | 'ESSAY' | 'SHORT_ANSWER';
  options?: string[];
  correctAnswer?: string;
  explanation?: string;
  points: number;
  order: number;
}

interface Quiz {
  id: string;
  title: string;
  description?: string;
  instructions?: string;
  timeLimit?: number;
  maxAttempts: number;
  isPublished: boolean;
  isGraded: boolean;
  totalPoints: number;
  dueDate?: string;
  createdAt: string;
  questions: Question[];
  _count: {
    questions: number;
    submissions: number;
  };
}

interface QuizPreviewProps {
  quiz: Quiz;
  onClose: () => void;
}

export function QuizPreview({ quiz, onClose }: QuizPreviewProps) {
  const getQuestionTypeLabel = (type: string) => {
    switch (type) {
      case 'MULTIPLE_CHOICE':
        return 'Multiple Choice';
      case 'TRUE_FALSE':
        return 'True/False';
      case 'ESSAY':
        return 'Essay';
      case 'SHORT_ANSWER':
        return 'Short Answer';
      default:
        return type;
    }
  };

  const getStatusColor = (isPublished: boolean) => {
    return isPublished 
      ? "bg-green-100 text-green-800" 
      : "bg-yellow-100 text-yellow-800";
  };

  return (
    <div className="space-y-6">
      {/* Quiz Header */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <CardTitle className="text-2xl">{quiz.title}</CardTitle>
              {quiz.description && (
                <p className="text-gray-600 mt-2">{quiz.description}</p>
              )}
            </div>
            <Badge className={getStatusColor(quiz.isPublished)}>
              {quiz.isPublished ? "Published" : "Draft"}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-5 w-5 text-blue-600" />
              <div>
                <div className="text-sm text-gray-600">Questions</div>
                <div className="font-semibold">{quiz._count.questions}</div>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Brain className="h-5 w-5 text-green-600" />
              <div>
                <div className="text-sm text-gray-600">Total Points</div>
                <div className="font-semibold">{quiz.totalPoints}</div>
              </div>
            </div>
            {quiz.timeLimit && (
              <div className="flex items-center space-x-2">
                <Clock className="h-5 w-5 text-orange-600" />
                <div>
                  <div className="text-sm text-gray-600">Time Limit</div>
                  <div className="font-semibold">{quiz.timeLimit} min</div>
                </div>
              </div>
            )}
            <div className="flex items-center space-x-2">
              <Users className="h-5 w-5 text-purple-600" />
              <div>
                <div className="text-sm text-gray-600">Submissions</div>
                <div className="font-semibold">{quiz._count.submissions}</div>
              </div>
            </div>
          </div>

          {quiz.dueDate && (
            <div className="mt-4 flex items-center space-x-2 text-gray-600">
              <Calendar className="h-4 w-4" />
              <span>Due: {new Date(quiz.dueDate).toLocaleString()}</span>
            </div>
          )}

          {quiz.instructions && (
            <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
              <h4 className="font-medium text-blue-900 mb-2">Instructions</h4>
              <p className="text-blue-800 text-sm">{quiz.instructions}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quiz Settings */}
      <Card>
        <CardHeader>
          <CardTitle>Quiz Settings</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <div>
              <div className="text-sm text-gray-600">Max Attempts</div>
              <div className="font-semibold">{quiz.maxAttempts}</div>
            </div>
            <div>
              <div className="text-sm text-gray-600">Grading</div>
              <div className="font-semibold">
                {quiz.isGraded ? "Automatic" : "Manual"}
              </div>
            </div>
            <div>
              <div className="text-sm text-gray-600">Status</div>
              <div className="font-semibold">
                {quiz.isPublished ? "Published" : "Draft"}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Questions Preview */}
      <Card>
        <CardHeader>
          <CardTitle>Questions Preview</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {quiz.questions.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No questions added yet
            </div>
          ) : (
            quiz.questions.map((question, index) => (
              <div key={question.id} className="border rounded-lg p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center space-x-2">
                    <span className="font-medium">Q{index + 1}</span>
                    <Badge variant="outline">
                      {getQuestionTypeLabel(question.type)}
                    </Badge>
                    <Badge variant="secondary">
                      {question.points} pts
                    </Badge>
                  </div>
                </div>

                <div className="mb-3">
                  <p className="font-medium">{question.question}</p>
                </div>

                {question.type === 'MULTIPLE_CHOICE' && question.options && (
                  <div className="space-y-2">
                    {question.options.map((option, optionIndex) => (
                      <div
                        key={optionIndex}
                        className={`p-2 rounded border ${
                          option === question.correctAnswer
                            ? 'bg-green-50 border-green-200'
                            : 'bg-gray-50 border-gray-200'
                        }`}
                      >
                        <div className="flex items-center space-x-2">
                          <span className="font-medium">
                            {String.fromCharCode(65 + optionIndex)}.
                          </span>
                          <span>{option}</span>
                          {option === question.correctAnswer && (
                            <Badge className="bg-green-100 text-green-800">
                              Correct
                            </Badge>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {(question.type === 'TRUE_FALSE' || question.type === 'SHORT_ANSWER') && question.correctAnswer && (
                  <div className="p-2 bg-green-50 border border-green-200 rounded">
                    <div className="text-sm text-green-800">
                      <strong>Correct Answer:</strong> {question.correctAnswer}
                    </div>
                  </div>
                )}

                {question.explanation && (
                  <div className="mt-3 p-2 bg-blue-50 border border-blue-200 rounded">
                    <div className="text-sm text-blue-800">
                      <strong>Explanation:</strong> {question.explanation}
                    </div>
                  </div>
                )}
              </div>
            ))
          )}
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button onClick={onClose} className="bg-brand hover:bg-brand/90">
          Close Preview
        </Button>
      </div>
    </div>
  );
}
