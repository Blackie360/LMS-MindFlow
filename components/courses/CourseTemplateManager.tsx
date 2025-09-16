"use client";

import { BookOpen, Plus, Edit, Trash2, Copy, Eye } from "lucide-react";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { CreateCourseForm } from "./CreateCourseForm";

interface CourseTemplate {
  id: string;
  title: string;
  description: string;
  category: string;
  level: string;
  estimatedHours: number;
  templateName: string;
  createdAt: string;
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
    topics: number;
  };
}

interface CourseTemplateManagerProps {
  organizationId?: string;
}

export function CourseTemplateManager({ organizationId }: CourseTemplateManagerProps) {
  const [templates, setTemplates] = useState<CourseTemplate[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<CourseTemplate | null>(null);
  const [previewTemplate, setPreviewTemplate] = useState<CourseTemplate | null>(null);

  useEffect(() => {
    fetchTemplates();
  }, [organizationId]);

  const fetchTemplates = async () => {
    try {
      setIsLoading(true);
      const params = new URLSearchParams();
      if (organizationId) params.append("organizationId", organizationId);
      params.append("isTemplate", "true");

      const response = await fetch(`/api/courses?${params.toString()}`);
      if (!response.ok) {
        throw new Error("Failed to fetch templates");
      }

      const data = await response.json();
      setTemplates(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch templates");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateTemplate = () => {
    setShowCreateForm(true);
  };

  const handleTemplateCreated = () => {
    setShowCreateForm(false);
    fetchTemplates();
  };

  const handleTemplateUpdated = () => {
    setEditingTemplate(null);
    fetchTemplates();
  };

  const handleEditTemplate = (template: CourseTemplate) => {
    setEditingTemplate(template);
  };

  const handlePreviewTemplate = (template: CourseTemplate) => {
    setPreviewTemplate(template);
  };

  const handleDuplicateTemplate = async (template: CourseTemplate) => {
    try {
      const courseData = {
        title: `${template.title} (Copy)`,
        description: template.description,
        category: template.category,
        level: template.level,
        estimatedHours: template.estimatedHours,
        isTemplate: true,
        templateName: `${template.templateName} (Copy)`,
        organizationId,
        topics: template.topics.map(topic => ({
          title: topic.title,
          description: topic.description,
          readingMaterials: topic.readingMaterials.map(material => ({
            title: material.title,
            description: "",
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
        throw new Error("Failed to duplicate template");
      }

      fetchTemplates();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to duplicate template");
    }
  };

  const handleDeleteTemplate = async (templateId: string) => {
    if (!confirm("Are you sure you want to delete this template?")) {
      return;
    }

    try {
      const response = await fetch(`/api/courses/${templateId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete template");
      }

      fetchTemplates();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete template");
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
          <p className="mt-2 text-gray-600">Loading templates...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Course Templates</h2>
          <p className="text-gray-600">
            Create and manage reusable course templates
          </p>
        </div>
        <Button onClick={handleCreateTemplate}>
          <Plus className="h-4 w-4 mr-2" />
          Create Template
        </Button>
      </div>

      {error && (
        <div className="text-sm text-red-600 bg-red-50 p-3 rounded-md">
          {error}
        </div>
      )}

      {templates.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Templates Yet</h3>
            <p className="text-gray-600 mb-4">
              Create your first course template to get started
            </p>
            <Button onClick={handleCreateTemplate}>
              <Plus className="h-4 w-4 mr-2" />
              Create Template
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {templates.map((template) => (
            <Card key={template.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg">{template.title}</CardTitle>
                    <CardDescription className="mt-1">
                      {template.templateName}
                    </CardDescription>
                  </div>
                  <Badge variant="outline">{template.level}</Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-sm text-gray-600">
                  <p>{template.description}</p>
                </div>

                <div className="flex items-center justify-between text-sm text-gray-500">
                  <span>{template._count.topics} topics</span>
                  <span>{template.estimatedHours}h estimated</span>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePreviewTemplate(template)}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEditTemplate(template)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDuplicateTemplate(template)}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDeleteTemplate(template.id)}
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

      {/* Create Template Dialog */}
      <Dialog open={showCreateForm} onOpenChange={setShowCreateForm}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create Course Template</DialogTitle>
            <DialogDescription>
              Create a reusable template for your courses
            </DialogDescription>
          </DialogHeader>
          <CreateCourseForm
            onSuccess={handleTemplateCreated}
            onCancel={() => setShowCreateForm(false)}
            organizationId={organizationId}
          />
        </DialogContent>
      </Dialog>

      {/* Edit Template Dialog */}
      <Dialog open={!!editingTemplate} onOpenChange={() => setEditingTemplate(null)}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Course Template</DialogTitle>
            <DialogDescription>
              Update your course template
            </DialogDescription>
          </DialogHeader>
          {editingTemplate && (
            <CreateCourseForm
              course={editingTemplate}
              onSuccess={handleTemplateUpdated}
              onCancel={() => setEditingTemplate(null)}
              organizationId={organizationId}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Preview Template Dialog */}
      <Dialog open={!!previewTemplate} onOpenChange={() => setPreviewTemplate(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Template Preview</DialogTitle>
            <DialogDescription>
              Preview the course template structure
            </DialogDescription>
          </DialogHeader>
          {previewTemplate && (
            <div className="space-y-6">
              <div className="space-y-2">
                <h3 className="text-lg font-semibold">{previewTemplate.title}</h3>
                <p className="text-gray-600">{previewTemplate.description}</p>
                <div className="flex items-center space-x-4 text-sm text-gray-500">
                  <span>Category: {previewTemplate.category}</span>
                  <span>Level: {previewTemplate.level}</span>
                  <span>Duration: {previewTemplate.estimatedHours}h</span>
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="font-semibold">Topics</h4>
                {previewTemplate.topics.map((topic, index) => (
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
                              <BookOpen className="h-4 w-4" />
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
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
