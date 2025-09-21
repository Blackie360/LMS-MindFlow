"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Clock, CheckCircle, AlertCircle, Brain, ArrowLeft, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";

interface Question {
  id: string;
  question: string;
  type: 'MULTIPLE_CHOICE' | 'TRUE_FALSE' | 'ESSAY' | 'SHORT_ANSWER';
  options?: string[];
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
  isGraded: boolean;
  totalPoints: number;
  dueDate?: string;
  questions: Question[];
}

interface QuizTakingProps {
  quiz: Quiz;
  onComplete: (answers: Array<{ questionId: string; answer: string }>) => void;
}

export function QuizTaking({ quiz, onComplete }: QuizTakingProps) {
  const router = useRouter();
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [timeRemaining, setTimeRemaining] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showConfirmSubmit, setShowConfirmSubmit] = useState(false);

  // Timer effect
  useEffect(() => {
    if (!quiz.timeLimit) return;

    setTimeRemaining(quiz.timeLimit * 60); // Convert to seconds

    const timer = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev === null || prev <= 1) {
          // Time's up, auto-submit
          handleSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [quiz.timeLimit, handleSubmit]);

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  const handleAnswerChange = (questionId: string, answer: string) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: answer
    }));
  };

  const handleNext = () => {
    if (currentQuestionIndex < quiz.questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const handleSubmit = useCallback(async () => {
    setIsSubmitting(true);

    const answerArray = Object.entries(answers).map(([questionId, answer]) => ({
      questionId,
      answer
    }));

    try {
      await onComplete(answerArray);
    } catch (error) {
      console.error('Error submitting quiz:', error);
    } finally {
      setIsSubmitting(false);
    }
  }, [answers, onComplete]);

  const currentQuestion = quiz.questions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / quiz.questions.length) * 100;
  const answeredQuestions = Object.keys(answers).length;
  const totalQuestions = quiz.questions.length;

  if (showConfirmSubmit) {
    return (
      <div className="max-w-2xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <AlertCircle className="h-5 w-5 mr-2 text-orange-500" />
              Confirm Submission
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p>You are about to submit your quiz. Please review your answers:</p>
            
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Questions answered:</span>
                <span className="font-medium">{answeredQuestions}/{totalQuestions}</span>
              </div>
              <div className="flex justify-between">
                <span>Time remaining:</span>
                <span className="font-medium">
                  {timeRemaining ? formatTime(timeRemaining) : 'No time limit'}
                </span>
              </div>
            </div>

            {answeredQuestions < totalQuestions && (
              <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-md">
                <p className="text-yellow-800 text-sm">
                  You have {totalQuestions - answeredQuestions} unanswered questions. 
                  You can still go back and answer them.
                </p>
              </div>
            )}

            <div className="flex space-x-2">
              <Button
                variant="outline"
                onClick={() => setShowConfirmSubmit(false)}
                className="flex-1"
              >
                Go Back
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="flex-1 bg-brand hover:bg-brand/90"
              >
                {isSubmitting ? "Submitting..." : "Submit Quiz"}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Quiz Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl">{quiz.title}</CardTitle>
              {quiz.description && (
                <p className="text-gray-600 mt-1">{quiz.description}</p>
              )}
            </div>
            <div className="flex items-center space-x-4">
              {timeRemaining !== null && (
                <div className={`flex items-center space-x-2 px-3 py-1 rounded-full ${
                  timeRemaining < 300 ? 'bg-red-100 text-red-800' : 'bg-blue-100 text-blue-800'
                }`}>
                  <Clock className="h-4 w-4" />
                  <span className="font-medium">{formatTime(timeRemaining)}</span>
                </div>
              )}
              <Badge variant="outline">
                {currentQuestionIndex + 1} of {totalQuestions}
              </Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Progress</span>
              <span className="text-sm font-medium">{answeredQuestions}/{totalQuestions} answered</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>

          {quiz.instructions && (
            <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
              <h4 className="font-medium text-blue-900 mb-2">Instructions</h4>
              <p className="text-blue-800 text-sm">{quiz.instructions}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Current Question */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">
              Question {currentQuestionIndex + 1}
            </CardTitle>
            <Badge variant="secondary">
              {currentQuestion.points} points
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <p className="text-lg font-medium">{currentQuestion.question}</p>
          </div>

          {/* Question Type Rendering */}
          {currentQuestion.type === 'MULTIPLE_CHOICE' && currentQuestion.options && (
            <RadioGroup
              value={answers[currentQuestion.id] || ''}
              onValueChange={(value) => handleAnswerChange(currentQuestion.id, value)}
            >
              {currentQuestion.options.map((option, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <RadioGroupItem value={option} id={`${currentQuestion.id}-${index}`} />
                  <Label htmlFor={`${currentQuestion.id}-${index}`} className="flex-1 cursor-pointer">
                    {option}
                  </Label>
                </div>
              ))}
            </RadioGroup>
          )}

          {currentQuestion.type === 'TRUE_FALSE' && (
            <RadioGroup
              value={answers[currentQuestion.id] || ''}
              onValueChange={(value) => handleAnswerChange(currentQuestion.id, value)}
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="true" id={`${currentQuestion.id}-true`} />
                <Label htmlFor={`${currentQuestion.id}-true`} className="cursor-pointer">
                  True
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="false" id={`${currentQuestion.id}-false`} />
                <Label htmlFor={`${currentQuestion.id}-false`} className="cursor-pointer">
                  False
                </Label>
              </div>
            </RadioGroup>
          )}

          {(currentQuestion.type === 'ESSAY' || currentQuestion.type === 'SHORT_ANSWER') && (
            <div>
              <Textarea
                value={answers[currentQuestion.id] || ''}
                onChange={(e) => handleAnswerChange(currentQuestion.id, e.target.value)}
                placeholder={
                  currentQuestion.type === 'ESSAY' 
                    ? "Write your essay answer here..." 
                    : "Write your answer here..."
                }
                rows={currentQuestion.type === 'ESSAY' ? 8 : 3}
                className="w-full"
              />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Navigation */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <Button
              variant="outline"
              onClick={handlePrevious}
              disabled={currentQuestionIndex === 0}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Previous
            </Button>

            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-600">
                {answeredQuestions}/{totalQuestions} answered
              </span>
            </div>

            {currentQuestionIndex === quiz.questions.length - 1 ? (
              <Button
                onClick={() => setShowConfirmSubmit(true)}
                className="bg-brand hover:bg-brand/90"
              >
                <CheckCircle className="h-4 w-4 mr-2" />
                Submit Quiz
              </Button>
            ) : (
              <Button
                onClick={handleNext}
                disabled={currentQuestionIndex === quiz.questions.length - 1}
              >
                Next
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
