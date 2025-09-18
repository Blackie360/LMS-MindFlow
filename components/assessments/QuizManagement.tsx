"use client";

import { useState, useEffect } from "react";
import { Plus, Edit, Trash2, Eye, Play, Clock, Users, CheckCircle, Brain, Settings } from "lucide-react";
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
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CreateQuizForm } from "./CreateQuizForm";
import { QuizPreview } from "./QuizPreview";

interface Quiz {
  id: string;
  title: string;
  description?: string;
  timeLimit?: number;
  maxAttempts: number;
  isPublished: boolean;
  isGraded: boolean;
  totalPoints: number;
  dueDate?: string;
  createdAt: string;
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

interface QuizManagementProps {
  courseId: string;
}

export function QuizManagement({ courseId }: QuizManagementProps) {
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingQuiz, setEditingQuiz] = useState<Quiz | null>(null);
  const [previewingQuiz, setPreviewingQuiz] = useState<Quiz | null>(null);
  const [activeTab, setActiveTab] = useState("quizzes");

  useEffect(() => {
    fetchQuizzes();
  }, [courseId]);

  const fetchQuizzes = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/quizzes?courseId=${courseId}&includeQuestions=true`);
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

  const handleCreateQuiz = () => {
    setShowCreateForm(true);
  };

  const handleQuizCreated = () => {
    setShowCreateForm(false);
    fetchQuizzes();
  };

  const handleEditQuiz = (quiz: Quiz) => {
    setEditingQuiz(quiz);
  };

  const handlePreviewQuiz = (quiz: Quiz) => {
    setPreviewingQuiz(quiz);
  };

  const handleDeleteQuiz = async (quizId: string) => {
    if (!confirm("Are you sure you want to delete this quiz?")) {
      return;
    }

    try {
      const response = await fetch(`/api/quizzes/${quizId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete quiz");
      }

      fetchQuizzes();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete quiz");
    }
  };

  const handleTogglePublish = async (quizId: string, isPublished: boolean) => {
    try {
      const response = await fetch(`/api/quizzes/${quizId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ isPublished: !isPublished }),
      });

      if (!response.ok) {
        throw new Error("Failed to update quiz");
      }

      fetchQuizzes();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update quiz");
    }
  };

  const getStatusColor = (isPublished: boolean) => {
    return isPublished 
      ? "bg-green-100 text-green-800" 
      : "bg-yellow-100 text-yellow-800";
  };

  const getStatusText = (isPublished: boolean) => {
    return isPublished ? "Published" : "Draft";
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
          <h2 className="text-2xl font-bold">Quiz Management</h2>
          <p className="text-gray-600">
            Create and manage quizzes for your course
          </p>
        </div>
        <Button onClick={handleCreateQuiz} className="bg-brand hover:bg-brand/90">
          <Plus className="h-4 w-4 mr-2" />
          Create Quiz
        </Button>
      </div>

      {error && (
        <div className="text-sm text-red-600 bg-red-50 p-3 rounded-md">
          {error}
        </div>
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="quizzes">All Quizzes</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="quizzes" className="space-y-6">
          {quizzes.length === 0 ? (
            <Card>
              <CardContent className="text-center py-12">
                <Brain className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Quizzes Yet</h3>
                <p className="text-gray-600 mb-4">
                  Create your first quiz to assess student learning
                </p>
                <Button onClick={handleCreateQuiz} className="bg-brand hover:bg-brand/90">
                  <Plus className="h-4 w-4 mr-2" />
                  Create Quiz
                </Button>
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
                          {quiz.description || "No description"}
                        </CardDescription>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge className={getStatusColor(quiz.isPublished)}>
                          {getStatusText(quiz.isPublished)}
                        </Badge>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <Settings className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handlePreviewQuiz(quiz)}>
                              <Eye className="h-4 w-4 mr-2" />
                              Preview
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleEditQuiz(quiz)}>
                              <Edit className="h-4 w-4 mr-2" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleTogglePublish(quiz.id, quiz.isPublished)}>
                              <Play className="h-4 w-4 mr-2" />
                              {quiz.isPublished ? "Unpublish" : "Publish"}
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={() => handleDeleteQuiz(quiz.id)}
                              className="text-red-600"
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between text-sm text-gray-500">
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center space-x-1">
                          <CheckCircle className="h-4 w-4" />
                          <span>{quiz._count.questions} questions</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Users className="h-4 w-4" />
                          <span>{quiz._count.submissions} submissions</span>
                        </div>
                        {quiz.timeLimit && (
                          <div className="flex items-center space-x-1">
                            <Clock className="h-4 w-4" />
                            <span>{quiz.timeLimit}m</span>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="text-sm">
                        <span className="font-medium">{quiz.totalPoints} points</span>
                        {quiz.dueDate && (
                          <div className="text-gray-500">
                            Due: {new Date(quiz.dueDate).toLocaleDateString()}
                          </div>
                        )}
                      </div>
                      <div className="flex space-x-2">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handlePreviewQuiz(quiz)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleEditQuiz(quiz)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Quiz Analytics</CardTitle>
              <CardDescription>
                Overview of quiz performance and engagement
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-brand">
                    {quizzes.length}
                  </div>
                  <div className="text-sm text-gray-600">Total Quizzes</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {quizzes.filter(q => q.isPublished).length}
                  </div>
                  <div className="text-sm text-gray-600">Published</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">
                    {quizzes.reduce((acc, q) => acc + q._count.submissions, 0)}
                  </div>
                  <div className="text-sm text-gray-600">Total Submissions</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Create Quiz Dialog */}
      <Dialog open={showCreateForm} onOpenChange={setShowCreateForm}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create New Quiz</DialogTitle>
            <DialogDescription>
              Build an engaging quiz to assess student learning
            </DialogDescription>
          </DialogHeader>
          <CreateQuizForm
            courseId={courseId}
            onSuccess={handleQuizCreated}
            onCancel={() => setShowCreateForm(false)}
          />
        </DialogContent>
      </Dialog>

      {/* Edit Quiz Dialog */}
      <Dialog open={!!editingQuiz} onOpenChange={() => setEditingQuiz(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Quiz</DialogTitle>
            <DialogDescription>
              Update your quiz information and settings
            </DialogDescription>
          </DialogHeader>
          {editingQuiz && (
            <CreateQuizForm
              courseId={courseId}
              quiz={editingQuiz}
              onSuccess={() => {
                setEditingQuiz(null);
                fetchQuizzes();
              }}
              onCancel={() => setEditingQuiz(null)}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Quiz Preview Dialog */}
      <Dialog open={!!previewingQuiz} onOpenChange={() => setPreviewingQuiz(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Quiz Preview</DialogTitle>
            <DialogDescription>
              Preview your quiz content and settings
            </DialogDescription>
          </DialogHeader>
          {previewingQuiz && (
            <QuizPreview
              quiz={previewingQuiz}
              onClose={() => setPreviewingQuiz(null)}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
