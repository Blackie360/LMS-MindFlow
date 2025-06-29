"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { supabase } from "@/lib/supabase"
import { toast } from "@/hooks/use-toast"
import { Loader2, Save, Eye } from "lucide-react"
import type { Course, Category } from "@/lib/supabase"

interface CourseFormProps {
  course?: Course
  isEditing?: boolean
}

export function CourseForm({ course, isEditing = false }: CourseFormProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [categories, setCategories] = useState<Category[]>([])
  const [formData, setFormData] = useState({
    title: course?.title || "",
    description: course?.description || "",
    category_id: course?.category_id || "none",
    price: course?.price?.toString() || "0",
    status: course?.status || "draft",
    cover_image: course?.cover_image || "",
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const router = useRouter()

  useEffect(() => {
    fetchCategories()
  }, [])

  const fetchCategories = async () => {
    try {
      const { data, error } = await supabase.from("categories").select("*").order("name")
      if (error) throw error
      if (data) setCategories(data)
    } catch (error) {
      console.error("Error fetching categories:", error)
      toast({
        title: "Error",
        description: "Failed to load categories. Please refresh the page.",
        variant: "destructive",
      })
    }
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.title.trim()) {
      newErrors.title = "Course title is required"
    }

    if (!formData.description.trim()) {
      newErrors.description = "Course description is required"
    }

    if (Number.parseFloat(formData.price) < 0) {
      newErrors.price = "Price cannot be negative"
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

    setIsSaving(true)

    try {
      // Get current user
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser()
      if (userError || !user) {
        throw new Error("Authentication required")
      }

      const courseData = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        category_id: formData.category_id === "none" ? null : formData.category_id,
        price: Number.parseFloat(formData.price) || 0,
        status: formData.status as "draft" | "published",
        cover_image: formData.cover_image.trim() || null,
        instructor_id: user.id,
        updated_at: new Date().toISOString(),
      }

      if (isEditing && course) {
        // Update existing course
        const { data, error } = await supabase
          .from("courses")
          .update(courseData)
          .eq("id", course.id)
          .select(`
            *,
            category:categories(*),
            instructor:profiles(*),
            lessons(*)
          `)
          .single()

        if (error) throw error

        toast({
          title: "Course Updated! ✅",
          description: `"${data.title}" has been updated successfully.`,
        })

        // Refresh the page to show updated data
        router.refresh()
      } else {
        // Create new course
        const { data, error } = await supabase
          .from("courses")
          .insert(courseData)
          .select(`
            *,
            category:categories(*),
            instructor:profiles(*)
          `)
          .single()

        if (error) throw error

        toast({
          title: "Course Created! 🎉",
          description: `"${data.title}" has been created successfully. You can now add lessons.`,
        })

        // Redirect to edit page to add lessons
        router.push(`/admin/courses/${data.id}/edit`)
      }
    } catch (error: any) {
      console.error("Course save error:", error)

      let errorMessage = "Failed to save course. Please try again."

      if (error.message?.includes("duplicate")) {
        errorMessage = "A course with this title already exists."
      } else if (error.message?.includes("Authentication")) {
        errorMessage = "You must be logged in to create courses."
      }

      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))

    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }))
    }
  }

  const handlePreview = () => {
    if (course?.id) {
      window.open(`/courses/${course.id}`, "_blank")
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Form */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Course Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Course Title *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => handleInputChange("title", e.target.value)}
                  placeholder="Enter course title"
                  required
                  className={errors.title ? "border-red-500" : ""}
                />
                {errors.title && <p className="text-sm text-red-500">{errors.title}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description *</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => handleInputChange("description", e.target.value)}
                  placeholder="Describe what students will learn in this course"
                  rows={4}
                  required
                  className={errors.description ? "border-red-500" : ""}
                />
                {errors.description && <p className="text-sm text-red-500">{errors.description}</p>}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="category">Category</Label>
                  <Select
                    value={formData.category_id}
                    onValueChange={(value) => handleInputChange("category_id", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">No category</SelectItem>
                      {categories.map((category) => (
                        <SelectItem key={category.id} value={category.id}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="price">Price ($)</Label>
                  <Input
                    id="price"
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.price}
                    onChange={(e) => handleInputChange("price", e.target.value)}
                    placeholder="0.00"
                    className={errors.price ? "border-red-500" : ""}
                  />
                  {errors.price && <p className="text-sm text-red-500">{errors.price}</p>}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="cover_image">Cover Image URL</Label>
                <Input
                  id="cover_image"
                  value={formData.cover_image}
                  onChange={(e) => handleInputChange("cover_image", e.target.value)}
                  placeholder="https://example.com/image.jpg"
                />
                <p className="text-xs text-gray-500">
                  Optional: Add a cover image URL to make your course more appealing
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Publishing</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select value={formData.status} onValueChange={(value) => handleInputChange("status", value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">
                      <div className="flex items-center space-x-2">
                        <Badge variant="secondary">Draft</Badge>
                        <span>Not visible to students</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="published">
                      <div className="flex items-center space-x-2">
                        <Badge variant="default">Published</Badge>
                        <span>Visible to students</span>
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-gray-500">
                  {formData.status === "draft"
                    ? "Course is saved but not visible to students"
                    : "Course is live and students can enroll"}
                </p>
              </div>

              <div className="pt-4 border-t space-y-2">
                <Button type="submit" className="w-full" disabled={isSaving}>
                  {isSaving ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      {isEditing ? "Updating..." : "Creating..."}
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      {isEditing ? "Update Course" : "Create Course"}
                    </>
                  )}
                </Button>

                {isEditing && course && (
                  <Button type="button" variant="outline" className="w-full bg-transparent" onClick={handlePreview}>
                    <Eye className="mr-2 h-4 w-4" />
                    Preview Course
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Preview */}
          {formData.cover_image && (
            <Card>
              <CardHeader>
                <CardTitle>Cover Image Preview</CardTitle>
              </CardHeader>
              <CardContent>
                <img
                  src={formData.cover_image || "/placeholder.svg"}
                  alt="Course cover preview"
                  className="w-full h-32 object-cover rounded-lg"
                  onError={(e) => {
                    e.currentTarget.style.display = "none"
                  }}
                />
              </CardContent>
            </Card>
          )}

          {/* Course Stats (for editing) */}
          {isEditing && course && (
            <Card>
              <CardHeader>
                <CardTitle>Course Stats</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Lessons:</span>
                  <span className="font-medium">{course.lessons?.length || 0}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Students:</span>
                  <span className="font-medium">{course._count?.enrollments || 0}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Created:</span>
                  <span className="font-medium">{new Date(course.created_at).toLocaleDateString()}</span>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </form>
  )
}
