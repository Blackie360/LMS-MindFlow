"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { toast } from "@/hooks/use-toast"
import { Loader2, ArrowLeft, Save } from "lucide-react"
import type { Lesson } from "@prisma/client"

interface LessonFormProps {
  courseId: string
  lesson?: Lesson | null
  isEditing?: boolean
  onSave: (lesson: Lesson) => void
  onCancel: () => void
  nextOrderIndex: number
}

export function LessonForm({ courseId, lesson, isEditing = false, onSave, onCancel, nextOrderIndex }: LessonFormProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    title: lesson?.title || "",
    description: lesson?.description || "",
    content: lesson?.content || "",
    video_url: lesson?.video_url || "",
    lesson_type: lesson?.lesson_type || "text",
    order_index: lesson?.order_index || nextOrderIndex,
    duration: lesson?.duration?.toString() || "",
  })
  const [errors, setErrors] = useState<Record<string, string>>({})

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.title.trim()) {
      newErrors.title = "Lesson title is required"
    }

    if (formData.lesson_type === "video" && !formData.video_url.trim()) {
      newErrors.video_url = "Video URL is required for video lessons"
    }

    if (!formData.content.trim()) {
      newErrors.content = "Lesson content is required"
    }

    if (formData.duration && Number.parseInt(formData.duration) < 0) {
      newErrors.duration = "Duration cannot be negative"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      toast({
        title: "Validation Error",
        description: "Please fix the errors in the form.",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)

    try {
      const lessonData = {
        course_id: courseId,
        title: formData.title.trim(),
        description: formData.description.trim() || null,
        content: formData.content.trim(),
        video_url: formData.video_url.trim() || null,
        lesson_type: formData.lesson_type as "video" | "text" | "pdf",
        order_index: formData.order_index,
        duration: formData.duration ? Number.parseInt(formData.duration) : null,
        updated_at: new Date().toISOString(),
      }

      if (isEditing && lesson) {
        const { data, error } = await supabase.from("lessons").update(lessonData).eq("id", lesson.id).select().single()

        if (error) throw error

        toast({
          title: "Lesson Updated! ✅",
          description: `"${data.title}" has been updated successfully.`,
        })

        onSave(data)
      } else {
        const { data, error } = await supabase.from("lessons").insert(lessonData).select().single()

        if (error) throw error

        toast({
          title: "Lesson Created! 🎉",
          description: `"${data.title}" has been created successfully.`,
        })

        onSave(data)
      }
    } catch (error: any) {
      console.error("Lesson save error:", error)

      let errorMessage = "Failed to save lesson. Please try again."

      if (error.message?.includes("duplicate")) {
        errorMessage = "A lesson with this order already exists."
      }

      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleInputChange = (field: string, value: string | number) => {
    setFormData((prev) => ({ ...prev, [field]: value }))

    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }))
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <Button variant="outline" onClick={onCancel}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Lessons
        </Button>
        <div>
          <h2 className="text-2xl font-bold">{isEditing ? "Edit Lesson" : "Add New Lesson"}</h2>
          <p className="text-gray-600">{isEditing ? "Update lesson content" : "Create a new lesson for your course"}</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Form */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Lesson Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Lesson Title *</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => handleInputChange("title", e.target.value)}
                    placeholder="Enter lesson title"
                    required
                    className={errors.title ? "border-red-500" : ""}
                  />
                  {errors.title && <p className="text-sm text-red-500">{errors.title}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => handleInputChange("description", e.target.value)}
                    placeholder="Brief description of what this lesson covers"
                    rows={2}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="lesson_type">Lesson Type</Label>
                    <Select
                      value={formData.lesson_type}
                      onValueChange={(value) => handleInputChange("lesson_type", value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="text">Text Content</SelectItem>
                        <SelectItem value="video">Video</SelectItem>
                        <SelectItem value="pdf">PDF Document</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="order_index">Lesson Order</Label>
                    <Input
                      id="order_index"
                      type="number"
                      min="1"
                      value={formData.order_index}
                      onChange={(e) => handleInputChange("order_index", Number.parseInt(e.target.value) || 1)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="duration">Duration (minutes)</Label>
                    <Input
                      id="duration"
                      type="number"
                      min="0"
                      value={formData.duration}
                      onChange={(e) => handleInputChange("duration", e.target.value)}
                      placeholder="Optional"
                      className={errors.duration ? "border-red-500" : ""}
                    />
                    {errors.duration && <p className="text-sm text-red-500">{errors.duration}</p>}
                  </div>
                </div>

                {formData.lesson_type === "video" && (
                  <div className="space-y-2">
                    <Label htmlFor="video_url">Video URL *</Label>
                    <Input
                      id="video_url"
                      value={formData.video_url}
                      onChange={(e) => handleInputChange("video_url", e.target.value)}
                      placeholder="YouTube, Vimeo, or direct video URL"
                      className={errors.video_url ? "border-red-500" : ""}
                    />
                    {errors.video_url && <p className="text-sm text-red-500">{errors.video_url}</p>}
                    <p className="text-xs text-gray-500">Supports YouTube, Vimeo, and direct video file URLs</p>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Lesson Content</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Label htmlFor="content">Content *</Label>
                  <Textarea
                    id="content"
                    value={formData.content}
                    onChange={(e) => handleInputChange("content", e.target.value)}
                    placeholder="Write your lesson content here. You can use markdown formatting."
                    rows={12}
                    className={`font-mono text-sm ${errors.content ? "border-red-500" : ""}`}
                    required
                  />
                  {errors.content && <p className="text-sm text-red-500">{errors.content}</p>}
                  <p className="text-xs text-gray-500">
                    Supports markdown formatting: **bold**, *italic*, `code`, # headings, etc.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      {isEditing ? "Updating..." : "Creating..."}
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      {isEditing ? "Update Lesson" : "Create Lesson"}
                    </>
                  )}
                </Button>

                <Button type="button" variant="outline" className="w-full bg-transparent" onClick={onCancel}>
                  Cancel
                </Button>
              </CardContent>
            </Card>

            {formData.video_url && formData.lesson_type === "video" && (
              <Card>
                <CardHeader>
                  <CardTitle>Video Preview</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="aspect-video bg-gray-100 rounded-lg flex items-center justify-center">
                    <p className="text-sm text-gray-500">Video preview will appear here</p>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </form>
    </div>
  )
}
