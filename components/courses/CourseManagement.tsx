"use client";

import { BookOpen, Plus, Edit, Trash2, Users, Clock, FileText, MoreHorizontal, Eye, Copy } from "lucide-react";
import { useState, useEffect } from "react";
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
import { CreateCourseForm } from "./CreateCourseForm";
import { CourseTemplateManager } from "./CourseTemplateManager";

interface Course {
  id: string;
  title: string;
  description: string;
  category: string;
  level: string;
  estimatedHours: number;
  status: "DRAFT" | "PUBLISHED" | "ARCHIVED";
  isTemplate: boolean;
  createdAt: string;
  instructor: {
    id: string;
    name: string;
    email: string;
  };
  organization?: {
    id: string;
    name: string;
  };
  topics: Array<{
    id: string;
    title: string;
    description: string;
    readingMaterials: Array<{
      id: string;
      title: string;
      fileName: string;
      fileSize: number;
      fileType: string;
    }>;
  }>;
  _count: {
    enrollments: number;
    topics: number;
    modules: number;
  };
}

interface CourseManagementProps {
  organizationId?: string;
}

export function CourseManagement({ organizationId }: CourseManagementProps) {
  const [courses, setCourses] = useState<Course[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  const [previewingCourse, setPreviewingCourse] = useState<Course | null>(null);
  const [activeTab, setActiveTab] = useState("courses");

  useEffect(() => {
    fetchCourses();
  }, [organizationId]);

  const fetchCourses = async () => {
    try {
      setIsLoading(true);
      const params = new URLSearchParams();
      if (organizationId) params.append("organizationId", organizationId);
      params.append("isTemplate", "false");

      const response = await fetch(`/api/courses?${params.toString()}`);
      if (!response.ok) {
        throw new Error("Failed to fetch courses");
      }

      const data = await response.json();
      setCourses(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch courses");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateCourse = () => {
    setShowCreateForm(true);
  };

  const handleCourseCreated = () => {
    setShowCreateForm(false);
    fetchCourses();
  };

  const handleEditCourse = (course: Course) => {
    setEditingCourse(course);
  };

  const handlePreviewCourse = (course: Course) => {
    setPreviewingCourse(course);
  };

  const handleDuplicateCourse = async (course: Course) => {
    try {
      const courseData = {
        title: `${course.title} (Copy)`,
        description: course.description,
        category: course.category,
        level: course.level,
        estimatedHours: course.estimatedHours,
        prerequisites: course.prerequisites,
        learningObjectives: course.learningObjectives,
        isTemplate: false,
        organizationId,
        topics: course.topics.map(topic => ({
          title: topic.title,
          description: topic.description,
          readingMaterials: topic.readingMaterials.map(material => ({
            title: material.title,
            description: material.description,
            fileName: material.fileName,
            fileUrl: "", // Will need to be re-uploaded
            fileSize: material.fileSize,
            fileType: material.fileType,
          })),
        })),
      };

      const response = await fetch("/api/courses", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(courseData),
      });

      if (!response.ok) {
        throw new Error("Failed to duplicate course");
      }

      fetchCourses();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to duplicate course");
    }
  };

  const handleCourseUpdated = () => {
    setEditingCourse(null);
    fetchCourses();
  };

  const handleUpdateCourseStatus = async (courseId: string, newStatus: "DRAFT" | "PUBLISHED" | "ARCHIVED") => {
    try {
      const response = await fetch(`/api/courses/${courseId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!response.ok) {
        throw new Error("Failed to update course status");
      }

      fetchCourses();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update course status");
    }
  };

  const handleDeleteCourse = async (courseId: string) => {
    if (!confirm("Are you sure you want to delete this course?")) {
      return;
    }

    try {
      const response = await fetch(`/api/courses/${courseId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete course");
      }

      fetchCourses();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete course");
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "PUBLISHED":
        return "bg-green-100 text-green-800";
      case "DRAFT":
        return "bg-yellow-100 text-yellow-800";
      case "ARCHIVED":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading courses...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Course Management</h2>
          <p className="text-gray-600">
            Manage your courses and templates
          </p>
        </div>
        <Button onClick={handleCreateCourse}>
          <Plus className="h-4 w-4 mr-2" />
          Create Course
        </Button>
      </div>

      {error && (
        <div className="text-sm text-red-600 bg-red-50 p-3 rounded-md">
          {error}
        </div>
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="courses">My Courses</TabsTrigger>
          <TabsTrigger value="templates">Templates</TabsTrigger>
        </TabsList>

        <TabsContent value="courses" className="space-y-6">
          {courses.length === 0 ? (
            <Card>
              <CardContent className="text-center py-12">
                <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Courses Yet</h3>
                <p className="text-gray-600 mb-4">
                  Create your first course to get started
                </p>
                <Button onClick={handleCreateCourse}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Course
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {courses.map((course) => (
                <Card key={course.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-lg">{course.title}</CardTitle>
                        <CardDescription className="mt-1">
                          {course.category} • {course.level}
                        </CardDescription>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge className={getStatusColor(course.status)}>
                          {course.status}
                        </Badge>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleUpdateCourseStatus(course.id, "DRAFT")}>
                              Set to Draft
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleUpdateCourseStatus(course.id, "PUBLISHED")}>
                              Publish
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleUpdateCourseStatus(course.id, "ARCHIVED")}>
                              Archive
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="text-sm text-gray-600">
                      <p className="line-clamp-2">{course.description}</p>
                    </div>

                    <div className="flex items-center justify-between text-sm text-gray-500">
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center space-x-1">
                          <Users className="h-4 w-4" />
                          <span>{course._count.enrollments}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <FileText className="h-4 w-4" />
                          <span>{course._count.topics}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Clock className="h-4 w-4" />
                          <span>{course.estimatedHours}h</span>
                        </div>
                      </div>
                    </div>

                    {course.topics.length > 0 && (
                      <div className="space-y-2">
                        <h6 className="text-sm font-medium">Topics:</h6>
                        <div className="space-y-1">
                          {course.topics.slice(0, 3).map((topic) => (
                            <div key={topic.id} className="text-xs text-gray-600 flex items-center space-x-2">
                              <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                              <span>{topic.title}</span>
                              {topic.readingMaterials.length > 0 && (
                                <span className="text-orange-600">
                                  ({topic.readingMaterials.length} materials)
                                </span>
                              )}
                            </div>
                          ))}
                          {course.topics.length > 3 && (
                            <div className="text-xs text-gray-500">
                              +{course.topics.length - 3} more topics
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    <div className="flex items-center justify-between">
                      <div className="text-xs text-gray-500">
                        Created {new Date(course.createdAt).toLocaleDateString()}
                      </div>
                      <div className="flex space-x-2">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handlePreviewCourse(course)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleEditCourse(course)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDuplicateCourse(course)}
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeleteCourse(course.id)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="templates">
          <CourseTemplateManager organizationId={organizationId} />
        </TabsContent>
      </Tabs>

      {/* Create Course Dialog */}
      <Dialog open={showCreateForm} onOpenChange={setShowCreateForm}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create New Course</DialogTitle>
            <DialogDescription>
              Build an engaging learning experience for your students
            </DialogDescription>
          </DialogHeader>
          <CreateCourseForm
            onSuccess={handleCourseCreated}
            onCancel={() => setShowCreateForm(false)}
            organizationId={organizationId}
          />
        </DialogContent>
      </Dialog>

      {/* Edit Course Dialog */}
      <Dialog open={!!editingCourse} onOpenChange={() => setEditingCourse(null)}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Course</DialogTitle>
            <DialogDescription>
              Update your course information and content
            </DialogDescription>
          </DialogHeader>
          {editingCourse && (
            <CreateCourseForm
              course={editingCourse}
              onSuccess={handleCourseUpdated}
              onCancel={() => setEditingCourse(null)}
              organizationId={organizationId}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Course Preview Dialog */}
      <Dialog open={!!previewingCourse} onOpenChange={() => setPreviewingCourse(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Course Preview</DialogTitle>
            <DialogDescription>
              Preview your course content and structure
            </DialogDescription>
          </DialogHeader>
          {previewingCourse && (
            <div className="space-y-6">
              <div className="space-y-2">
                <h3 className="text-2xl font-bold">{previewingCourse.title}</h3>
                <p className="text-gray-600">{previewingCourse.description}</p>
                <div className="flex items-center space-x-4 text-sm text-gray-500">
                  <span>Category: {previewingCourse.category}</span>
                  <span>Level: {previewingCourse.level}</span>
                  <span>Duration: {previewingCourse.estimatedHours}h</span>
                  <Badge className={getStatusColor(previewingCourse.status)}>
                    {previewingCourse.status}
                  </Badge>
                </div>
              </div>

              {previewingCourse.prerequisites && (
                <div className="space-y-2">
                  <h4 className="font-semibold">Prerequisites</h4>
                  <p className="text-sm text-gray-600">{previewingCourse.prerequisites}</p>
                </div>
              )}

              {previewingCourse.learningObjectives && Array.isArray(previewingCourse.learningObjectives) && previewingCourse.learningObjectives.length > 0 && (
                <div className="space-y-2">
                  <h4 className="font-semibold">Learning Objectives</h4>
                  <ul className="list-disc list-inside space-y-1">
                    {previewingCourse.learningObjectives.map((objective: string, index: number) => (
                      <li key={index} className="text-sm text-gray-600">{objective}</li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="space-y-4">
                <h4 className="font-semibold">Course Topics</h4>
                {previewingCourse.topics.map((topic, index) => (
                  <div key={topic.id} className="border rounded-lg p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <h5 className="font-medium">{topic.title}</h5>
                      <Badge variant="outline">Topic {index + 1}</Badge>
                    </div>
                    <p className="text-sm text-gray-600">{topic.description}</p>
                    
                    {topic.readingMaterials.length > 0 && (
                      <div className="space-y-2">
                        <h6 className="text-sm font-medium">Reading Materials:</h6>
                        <div className="space-y-1">
                          {topic.readingMaterials.map((material) => (
                            <div key={material.id} className="flex items-center space-x-2 text-sm text-gray-600">
                              <FileText className="h-4 w-4" />
                              <span>{material.title}</span>
                              <span className="text-xs">({formatFileSize(material.fileSize)})</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setPreviewingCourse(null)}>
                  Close
                </Button>
                <Button onClick={() => {
                  setPreviewingCourse(null);
                  handleEditCourse(previewingCourse);
                }}>
                  Edit Course
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
