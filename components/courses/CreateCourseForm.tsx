"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { BookOpen, Plus, X } from "lucide-react";

interface CreateCourseFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function CreateCourseForm({ onSuccess, onCancel }: CreateCourseFormProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [level, setLevel] = useState("beginner");
  const [modules, setModules] = useState([{ title: "", description: "" }]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const addModule = () => {
    setModules([...modules, { title: "", description: "" }]);
  };

  const removeModule = (index: number) => {
    if (modules.length > 1) {
      setModules(modules.filter((_, i) => i !== index));
    }
  };

  const updateModule = (index: number, field: "title" | "description", value: string) => {
    const newModules = [...modules];
    newModules[index][field] = value;
    setModules(newModules);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      // TODO: Implement course creation API call
      console.log("Creating course:", { title, description, category, level, modules });
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      onSuccess?.();
    } catch (err) {
      setError("An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-green-500/20 rounded-lg flex items-center justify-center">
            <BookOpen className="h-4 w-4 text-green-500" />
          </div>
          <div>
            <CardTitle>Create New Course</CardTitle>
            <CardDescription>
              Build an engaging learning experience for your students
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
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

          {/* Course Modules */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label>Course Modules</Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addModule}
                disabled={isLoading}
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Module
              </Button>
            </div>
            
            <div className="space-y-4">
              {modules.map((module, index) => (
                <div key={index} className="border rounded-lg p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <Badge variant="outline">Module {index + 1}</Badge>
                    {modules.length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeModule(index)}
                        disabled={isLoading}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="space-y-2">
                      <Label htmlFor={`module-${index}-title`}>Module Title</Label>
                      <Input
                        id={`module-${index}-title`}
                        placeholder="e.g., HTML Fundamentals"
                        value={module.title}
                        onChange={(e) => updateModule(index, "title", e.target.value)}
                        disabled={isLoading}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor={`module-${index}-description`}>Description</Label>
                      <Input
                        id={`module-${index}-description`}
                        placeholder="Brief description of this module"
                        value={module.description}
                        onChange={(e) => updateModule(index, "description", e.target.value)}
                        disabled={isLoading}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {error && (
            <div className="text-sm text-red-600 bg-red-50 p-3 rounded-md">
              {error}
            </div>
          )}

          <div className="flex justify-end space-x-3">
            <Button type="button" variant="outline" onClick={onCancel} disabled={isLoading}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Creating Course..." : "Create Course"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
