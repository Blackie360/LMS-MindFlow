"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Brain, Plus, Trash2, Edit, Eye } from "lucide-react";
import { generateQuizWithAI, generateQuestionsForTopic } from "@/lib/ai";

const QuizFormSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  instructions: z.string().optional(),
  timeLimit: z.number().min(1).optional(),
  maxAttempts: z.number().min(1).default(1),
  isGraded: z.boolean().default(true),
  dueDate: z.string().optional(),
});

const AIQuizSchema = z.object({
  topic: z.string().min(1, "Topic is required"),
  difficulty: z.enum(['beginner', 'intermediate', 'advanced']).default('intermediate'),
  questionCount: z.number().min(1).max(50).default(10),
  questionTypes: z.array(z.string()).default(['MULTIPLE_CHOICE', 'TRUE_FALSE']),
});

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
  isGraded: boolean;
  dueDate?: string;
  totalPoints: number;
  questions: Question[];
}

interface CreateQuizFormProps {
  courseId: string;
  quiz?: Quiz;
  onSuccess: () => void;
  onCancel: () => void;
}

export function CreateQuizForm({ courseId, quiz, onSuccess, onCancel }: CreateQuizFormProps) {
  const [activeTab, setActiveTab] = useState("basic");
  const [questions, setQuestions] = useState<Question[]>(quiz?.questions || []);
  const [isGenerating, setIsGenerating] = useState(false);
  const [aiPrompt, setAiPrompt] = useState("");
  const [isUsingAI, setIsUsingAI] = useState(false);

  const form = useForm<z.infer<typeof QuizFormSchema>>({
    resolver: zodResolver(QuizFormSchema),
    defaultValues: {
      title: quiz?.title || "",
      description: quiz?.description || "",
      instructions: quiz?.instructions || "",
      timeLimit: quiz?.timeLimit || 30,
      maxAttempts: quiz?.maxAttempts || 1,
      isGraded: quiz?.isGraded ?? true,
      dueDate: quiz?.dueDate || "",
    },
  });

  const aiForm = useForm<z.infer<typeof AIQuizSchema>>({
    resolver: zodResolver(AIQuizSchema),
    defaultValues: {
      topic: "",
      difficulty: 'intermediate',
      questionCount: 10,
      questionTypes: ['MULTIPLE_CHOICE', 'TRUE_FALSE'],
    },
  });

  const addQuestion = () => {
    const newQuestion: Question = {
      id: `temp-${Date.now()}`,
      question: "",
      type: 'MULTIPLE_CHOICE',
      options: ['', '', '', ''],
      correctAnswer: '',
      explanation: '',
      points: 1,
      order: questions.length,
    };
    setQuestions([...questions, newQuestion]);
  };

  const updateQuestion = (index: number, updatedQuestion: Partial<Question>) => {
    const newQuestions = [...questions];
    newQuestions[index] = { ...newQuestions[index], ...updatedQuestion };
    setQuestions(newQuestions);
  };

  const removeQuestion = (index: number) => {
    const newQuestions = questions.filter((_, i) => i !== index);
    setQuestions(newQuestions);
  };

  const generateQuizWithAI = async () => {
    try {
      setIsGenerating(true);
      const aiData = aiForm.getValues();
      
      const response = await fetch(`/api/quizzes`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          courseId,
          title: form.getValues().title,
          description: form.getValues().description,
          useAI: true,
          aiPrompt: aiData.topic,
          questionCount: aiData.questionCount,
          difficulty: aiData.difficulty,
          questionTypes: aiData.questionTypes,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate quiz with AI');
      }

      const result = await response.json();
      setQuestions(result.data.questions || []);
      setIsUsingAI(true);
    } catch (error) {
      console.error('Error generating quiz with AI:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const generateQuestions = async () => {
    try {
      setIsGenerating(true);
      const aiData = aiForm.getValues();
      
      const response = await fetch(`/api/quizzes/${quiz?.id || 'temp'}/questions/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          topic: aiData.topic,
          questionCount: aiData.questionCount,
          questionType: aiData.questionTypes[0],
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate questions');
      }

      const result = await response.json();
      setQuestions([...questions, ...result.data]);
    } catch (error) {
      console.error('Error generating questions:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const onSubmit = async (data: z.infer<typeof QuizFormSchema>) => {
    try {
      const quizData = {
        ...data,
        courseId,
        questions,
        totalPoints: questions.reduce((sum, q) => sum + q.points, 0),
      };

      const url = quiz ? `/api/quizzes/${quiz.id}` : '/api/quizzes';
      const method = quiz ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(quizData),
      });

      if (!response.ok) {
        throw new Error('Failed to save quiz');
      }

      onSuccess();
    } catch (error) {
      console.error('Error saving quiz:', error);
    }
  };

  return (
    <div className="space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="basic">Basic Info</TabsTrigger>
          <TabsTrigger value="questions">Questions</TabsTrigger>
          <TabsTrigger value="ai">AI Assistant</TabsTrigger>
        </TabsList>

        <TabsContent value="basic" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Quiz Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="title">Title *</Label>
                <Input
                  id="title"
                  {...form.register("title")}
                  placeholder="Enter quiz title"
                />
                {form.formState.errors.title && (
                  <p className="text-sm text-red-600">{form.formState.errors.title.message}</p>
                )}
              </div>

              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  {...form.register("description")}
                  placeholder="Enter quiz description"
                  rows={3}
                />
              </div>

              <div>
                <Label htmlFor="instructions">Instructions</Label>
                <Textarea
                  id="instructions"
                  {...form.register("instructions")}
                  placeholder="Enter instructions for students"
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="timeLimit">Time Limit (minutes)</Label>
                  <Input
                    id="timeLimit"
                    type="number"
                    {...form.register("timeLimit", { valueAsNumber: true })}
                    placeholder="30"
                  />
                </div>

                <div>
                  <Label htmlFor="maxAttempts">Max Attempts</Label>
                  <Input
                    id="maxAttempts"
                    type="number"
                    {...form.register("maxAttempts", { valueAsNumber: true })}
                    placeholder="1"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="dueDate">Due Date</Label>
                <Input
                  id="dueDate"
                  type="datetime-local"
                  {...form.register("dueDate")}
                />
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="isGraded"
                  {...form.register("isGraded")}
                  className="rounded"
                />
                <Label htmlFor="isGraded">Automatically grade this quiz</Label>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="questions" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Questions ({questions.length})</CardTitle>
                <Button onClick={addQuestion} size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Question
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {questions.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  No questions yet. Add questions manually or use AI to generate them.
                </div>
              ) : (
                questions.map((question, index) => (
                  <QuestionEditor
                    key={question.id}
                    question={question}
                    index={index}
                    onUpdate={(updated) => updateQuestion(index, updated)}
                    onRemove={() => removeQuestion(index)}
                  />
                ))
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="ai" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Brain className="h-5 w-5 mr-2 text-brand" />
                AI Quiz Generator
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="topic">Topic or Subject</Label>
                <Input
                  id="topic"
                  {...aiForm.register("topic")}
                  placeholder="e.g., JavaScript Fundamentals, World War II, Photosynthesis"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="difficulty">Difficulty</Label>
                  <select
                    {...aiForm.register("difficulty")}
                    className="w-full p-2 border rounded-md"
                  >
                    <option value="beginner">Beginner</option>
                    <option value="intermediate">Intermediate</option>
                    <option value="advanced">Advanced</option>
                  </select>
                </div>

                <div>
                  <Label htmlFor="questionCount">Number of Questions</Label>
                  <Input
                    id="questionCount"
                    type="number"
                    {...aiForm.register("questionCount", { valueAsNumber: true })}
                    min="1"
                    max="50"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Question Types</Label>
                <div className="flex flex-wrap gap-2">
                  {['MULTIPLE_CHOICE', 'TRUE_FALSE', 'ESSAY', 'SHORT_ANSWER'].map((type) => (
                    <label key={type} className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        value={type}
                        {...aiForm.register("questionTypes")}
                        className="rounded"
                      />
                      <span className="text-sm">{type.replace('_', ' ')}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="flex space-x-2">
                <Button
                  onClick={generateQuizWithAI}
                  disabled={isGenerating}
                  className="bg-brand hover:bg-brand/90"
                >
                  <Brain className="h-4 w-4 mr-2" />
                  {isGenerating ? "Generating..." : "Generate Full Quiz"}
                </Button>
                <Button
                  onClick={generateQuestions}
                  disabled={isGenerating}
                  variant="outline"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Questions
                </Button>
              </div>

              {isUsingAI && (
                <div className="p-3 bg-green-50 border border-green-200 rounded-md">
                  <p className="text-sm text-green-800">
                    ✓ Quiz generated with AI assistance
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="flex justify-end space-x-2">
        <Button variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button onClick={form.handleSubmit(onSubmit)} className="bg-brand hover:bg-brand/90">
          {quiz ? "Update Quiz" : "Create Quiz"}
        </Button>
      </div>
    </div>
  );
}

// Question Editor Component
function QuestionEditor({
  question,
  index,
  onUpdate,
  onRemove,
}: {
  question: Question;
  index: number;
  onUpdate: (updated: Partial<Question>) => void;
  onRemove: () => void;
}) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Question {index + 1}</CardTitle>
          <div className="flex items-center space-x-2">
            <Badge variant="outline">{question.type.replace('_', ' ')}</Badge>
            <Button
              variant="ghost"
              size="sm"
              onClick={onRemove}
              className="text-red-600 hover:text-red-700"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label>Question</Label>
          <Textarea
            value={question.question}
            onChange={(e) => onUpdate({ question: e.target.value })}
            placeholder="Enter your question here"
            rows={2}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label>Type</Label>
            <select
              value={question.type}
              onChange={(e) => onUpdate({ type: e.target.value as any })}
              className="w-full p-2 border rounded-md"
            >
              <option value="MULTIPLE_CHOICE">Multiple Choice</option>
              <option value="TRUE_FALSE">True/False</option>
              <option value="ESSAY">Essay</option>
              <option value="SHORT_ANSWER">Short Answer</option>
            </select>
          </div>

          <div>
            <Label>Points</Label>
            <Input
              type="number"
              value={question.points}
              onChange={(e) => onUpdate({ points: parseInt(e.target.value) || 1 })}
              min="1"
              max="10"
            />
          </div>
        </div>

        {question.type === 'MULTIPLE_CHOICE' && (
          <div>
            <Label>Options</Label>
            <div className="space-y-2">
              {question.options?.map((option, optionIndex) => (
                <div key={optionIndex} className="flex items-center space-x-2">
                  <Input
                    value={option}
                    onChange={(e) => {
                      const newOptions = [...(question.options || [])];
                      newOptions[optionIndex] = e.target.value;
                      onUpdate({ options: newOptions });
                    }}
                    placeholder={`Option ${optionIndex + 1}`}
                  />
                  <input
                    type="radio"
                    name={`correct-${question.id}`}
                    checked={question.correctAnswer === option}
                    onChange={() => onUpdate({ correctAnswer: option })}
                  />
                  <span className="text-sm text-gray-600">Correct</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {(question.type === 'TRUE_FALSE' || question.type === 'SHORT_ANSWER') && (
          <div>
            <Label>Correct Answer</Label>
            <Input
              value={question.correctAnswer || ''}
              onChange={(e) => onUpdate({ correctAnswer: e.target.value })}
              placeholder="Enter correct answer"
            />
          </div>
        )}

        <div>
          <Label>Explanation (Optional)</Label>
          <Textarea
            value={question.explanation || ''}
            onChange={(e) => onUpdate({ explanation: e.target.value })}
            placeholder="Explain why this is the correct answer"
            rows={2}
          />
        </div>
      </CardContent>
    </Card>
  );
}
