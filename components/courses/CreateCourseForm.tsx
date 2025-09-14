"use client";

import { BookOpen, Plus, X, Upload, FileText, Trash2 } from "lucide-react";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface Topic {
  id?: string;
  title: string;
  description: string;
  readingMaterials: ReadingMaterial[];
}

interface ReadingMaterial {
  id?: string;
  title: string;
  description: string;
  fileName: string;
  fileUrl: string;
  fileSize: number;
  fileType: string;
}

interface CreateCourseFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
  organizationId?: string;
  course?: any; // For editing existing courses
}

export function CreateCourseForm({
  onSuccess,
  onCancel,
  organizationId,
  course,
}: CreateCourseFormProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [level, setLevel] = useState("beginner");
  const [estimatedHours, setEstimatedHours] = useState("");
  const [prerequisites, setPrerequisites] = useState("");
  const [learningObjectives, setLearningObjectives] = useState<string[]>([""]);
  const [isTemplate, setIsTemplate] = useState(false);
  const [templateName, setTemplateName] = useState("");
  const [topics, setTopics] = useState<Topic[]>([
    { title: "", description: "", readingMaterials: [] },
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [uploadingFiles, setUploadingFiles] = useState<{ [key: string]: boolean }>({});

  // Initialize form with course data if editing
  useEffect(() => {
    if (course) {
      setTitle(course.title || "");
      setDescription(course.description || "");
      setCategory(course.category || "");
      setLevel(course.level || "beginner");
      setEstimatedHours(course.estimatedHours?.toString() || "");
      setPrerequisites(course.prerequisites || "");
      setLearningObjectives(course.learningObjectives || [""]);
      setIsTemplate(course.isTemplate || false);
      setTemplateName(course.templateName || "");
      setTopics(course.topics?.map((topic: any) => ({
        id: topic.id,
        title: topic.title,
        description: topic.description,
        readingMaterials: topic.readingMaterials?.map((material: any) => ({
          id: material.id,
          title: material.title,
          description: material.description,
          fileName: material.fileName,
          fileUrl: material.fileUrl,
          fileSize: material.fileSize,
          fileType: material.fileType,
        })) || [],
      })) || [{ title: "", description: "", readingMaterials: [] }]);
    }
  }, [course]);

  const addTopic = () => {
    setTopics([...topics, { title: "", description: "", readingMaterials: [] }]);
  };

  const removeTopic = (index: number) => {
    if (topics.length > 1) {
      setTopics(topics.filter((_, i) => i !== index));
    }
  };

  const updateTopic = (
    index: number,
    field: "title" | "description",
    value: string,
  ) => {
    const newTopics = [...topics];
    newTopics[index][field] = value;
    setTopics(newTopics);
  };

  const addLearningObjective = () => {
    setLearningObjectives([...learningObjectives, ""]);
  };

  const removeLearningObjective = (index: number) => {
    if (learningObjectives.length > 1) {
      setLearningObjectives(learningObjectives.filter((_, i) => i !== index));
    }
  };

  const updateLearningObjective = (index: number, value: string) => {
    const newObjectives = [...learningObjectives];
    newObjectives[index] = value;
    setLearningObjectives(newObjectives);
  };

  const handleFileUpload = async (file: File, topicIndex: number) => {
    const topicKey = `topic-${topicIndex}`;
    setUploadingFiles(prev => ({ ...prev, [topicKey]: true }));

    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Upload failed");
      }

      const uploadResult = await response.json();

      const newReadingMaterial: ReadingMaterial = {
        title: file.name.split('.')[0], // Use filename without extension as title
        description: "",
        fileName: uploadResult.fileName,
        fileUrl: uploadResult.fileUrl,
        fileSize: uploadResult.fileSize,
        fileType: uploadResult.fileType,
      };

      const newTopics = [...topics];
      newTopics[topicIndex].readingMaterials.push(newReadingMaterial);
      setTopics(newTopics);
    } catch (error) {
      console.error("File upload error:", error);
      setError("Failed to upload file. Please try again.");
    } finally {
      setUploadingFiles(prev => ({ ...prev, [topicKey]: false }));
    }
  };

  const removeReadingMaterial = (topicIndex: number, materialIndex: number) => {
    const newTopics = [...topics];
    newTopics[topicIndex].readingMaterials.splice(materialIndex, 1);
    setTopics(newTopics);
  };

  const updateReadingMaterial = (
    topicIndex: number,
    materialIndex: number,
    field: "title" | "description",
    value: string,
  ) => {
    const newTopics = [...topics];
    newTopics[topicIndex].readingMaterials[materialIndex][field] = value;
    setTopics(newTopics);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const courseData = {
        title,
        description,
        category,
        level,
        estimatedHours: estimatedHours ? parseInt(estimatedHours) : undefined,
        prerequisites,
        learningObjectives: learningObjectives.filter(obj => obj.trim() !== ""),
        isTemplate,
        templateName: isTemplate ? templateName : undefined,
        organizationId,
        topics: topics.filter(topic => topic.title.trim() !== ""),
      };

      const url = course ? `/api/courses/${course.id}` : "/api/courses";
      const method = course ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(courseData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Failed to ${course ? 'update' : 'create'} course`);
      }

      onSuccess?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-6xl mx-auto">
      <CardHeader>
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-green-500/20 rounded-lg flex items-center justify-center">
            <BookOpen className="h-4 w-4 text-green-500" />
          </div>
          <div>
            <CardTitle>{course ? 'Edit Course' : 'Create New Course'}</CardTitle>
            <CardDescription>
              {course ? 'Update your course information and content' : 'Build an engaging learning experience with topics and reading materials'}
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <Tabs defaultValue="basic" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="basic">Basic Info</TabsTrigger>
              <TabsTrigger value="topics">Topics & Materials</TabsTrigger>
              <TabsTrigger value="settings">Settings</TabsTrigger>
            </TabsList>

            <TabsContent value="basic" className="space-y-6">
              {/* Basic Course Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Course Title *</Label>
                  <Input
                    id="title"
                    placeholder="e.g., Introduction to Web Development"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required
                    disabled={isLoading}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="category">Category</Label>
                  <Input
                    id="category"
                    placeholder="e.g., Technology, Science, Arts"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    disabled={isLoading}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="level">Difficulty Level</Label>
                  <Select value={level} onValueChange={setLevel}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select level" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="beginner">Beginner</SelectItem>
                      <SelectItem value="intermediate">Intermediate</SelectItem>
                      <SelectItem value="advanced">Advanced</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="estimatedHours">Estimated Hours</Label>
                  <Input
                    id="estimatedHours"
                    type="number"
                    placeholder="e.g., 20"
                    min="1"
                    value={estimatedHours}
                    onChange={(e) => setEstimatedHours(e.target.value)}
                    disabled={isLoading}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Course Description</Label>
                <Textarea
                  id="description"
                  placeholder="Describe what students will learn, prerequisites, and course objectives..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={4}
                  disabled={isLoading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="prerequisites">Prerequisites</Label>
                <Textarea
                  id="prerequisites"
                  placeholder="What should students know before taking this course?"
                  value={prerequisites}
                  onChange={(e) => setPrerequisites(e.target.value)}
                  rows={2}
                  disabled={isLoading}
                />
              </div>

              {/* Learning Objectives */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label>Learning Objectives</Label>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={addLearningObjective}
                    disabled={isLoading}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Objective
                  </Button>
                </div>

                <div className="space-y-3">
                  {learningObjectives.map((objective, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <Input
                        placeholder="e.g., Students will learn to build responsive websites"
                        value={objective}
                        onChange={(e) => updateLearningObjective(index, e.target.value)}
                        disabled={isLoading}
                      />
                      {learningObjectives.length > 1 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeLearningObjective(index)}
                          disabled={isLoading}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="topics" className="space-y-6">
              {/* Course Topics */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label>Course Topics</Label>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={addTopic}
                    disabled={isLoading}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Topic
                  </Button>
                </div>

                <div className="space-y-6">
                  {topics.map((topic, topicIndex) => (
                    <div key={`topic-${topicIndex}`} className="border rounded-lg p-6 space-y-4">
                      <div className="flex items-center justify-between">
                        <Badge variant="outline">Topic {topicIndex + 1}</Badge>
                        {topics.length > 1 && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => removeTopic(topicIndex)}
                            disabled={isLoading}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        )}
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor={`topic-${topicIndex}-title`}>
                            Topic Title
                          </Label>
                          <Input
                            id={`topic-${topicIndex}-title`}
                            placeholder="e.g., HTML Fundamentals"
                            value={topic.title}
                            onChange={(e) =>
                              updateTopic(topicIndex, "title", e.target.value)
                            }
                            disabled={isLoading}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor={`topic-${topicIndex}-description`}>
                            Description
                          </Label>
                          <Input
                            id={`topic-${topicIndex}-description`}
                            placeholder="Brief description of this topic"
                            value={topic.description}
                            onChange={(e) =>
                              updateTopic(topicIndex, "description", e.target.value)
                            }
                            disabled={isLoading}
                          />
                        </div>
                      </div>

                      {/* Reading Materials for this topic */}
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <Label className="text-sm font-medium">Reading Materials</Label>
                          <div className="relative">
                            <input
                              type="file"
                              id={`file-upload-${topicIndex}`}
                              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) {
                                  handleFileUpload(file, topicIndex);
                                }
                              }}
                              disabled={isLoading || uploadingFiles[`topic-${topicIndex}`]}
                              accept=".pdf,.doc,.docx,.txt,.ppt,.pptx,.jpg,.jpeg,.png,.gif,.mp4,.webm,.mp3,.wav"
                            />
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              disabled={isLoading || uploadingFiles[`topic-${topicIndex}`]}
                            >
                              <Upload className="h-4 w-4 mr-2" />
                              {uploadingFiles[`topic-${topicIndex}`] ? "Uploading..." : "Upload File"}
                            </Button>
                          </div>
                        </div>

                        {topic.readingMaterials.length > 0 && (
                          <div className="space-y-2">
                            {topic.readingMaterials.map((material, materialIndex) => (
                              <div key={materialIndex} className="flex items-center space-x-2 p-3 bg-gray-50 rounded-lg">
                                <FileText className="h-4 w-4 text-gray-500" />
                                <div className="flex-1 min-w-0">
                                  <Input
                                    placeholder="Material title"
                                    value={material.title}
                                    onChange={(e) =>
                                      updateReadingMaterial(topicIndex, materialIndex, "title", e.target.value)
                                    }
                                    disabled={isLoading}
                                    className="border-0 bg-transparent p-0 h-auto"
                                  />
                                  <p className="text-xs text-gray-500 truncate">
                                    {material.fileName} ({(material.fileSize / 1024 / 1024).toFixed(2)} MB)
                                  </p>
                                </div>
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => removeReadingMaterial(topicIndex, materialIndex)}
                                  disabled={isLoading}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="settings" className="space-y-6">
              {/* Course Template Settings */}
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="isTemplate"
                    checked={isTemplate}
                    onChange={(e) => setIsTemplate(e.target.checked)}
                    disabled={isLoading}
                    className="rounded"
                  />
                  <Label htmlFor="isTemplate">Save as Course Template</Label>
                </div>

                {isTemplate && (
                  <div className="space-y-2">
                    <Label htmlFor="templateName">Template Name</Label>
                    <Input
                      id="templateName"
                      placeholder="e.g., Web Development Fundamentals Template"
                      value={templateName}
                      onChange={(e) => setTemplateName(e.target.value)}
                      disabled={isLoading}
                    />
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>

          {error && (
            <div className="text-sm text-red-600 bg-red-50 p-3 rounded-md">
              {error}
            </div>
          )}

          <div className="flex justify-end space-x-3">
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? (course ? "Updating Course..." : "Creating Course...") : (course ? "Update Course" : "Create Course")}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
