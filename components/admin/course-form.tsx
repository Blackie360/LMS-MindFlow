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
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { supabase } from "@/lib/supabase"
import { toast } from "@/hooks/use-toast"
import { Loader2, Save, Eye, Globe, AlertTriangle, CheckCircle, Upload } from "lucide-react"
import type { Course, Category } from "@/lib/supabase"

interface CourseFormProps {
  course?: Course
  isEditing?: boolean
}

interface PublishValidation {
  isValid: boolean
  errors: string[]
  warnings: string[]
}

export function CourseForm({ course, isEditing = false }: CourseFormProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [isPublishing, setIsPublishing] = useState(false)
  const [showPublishDialog, setShowPublishDialog] = useState(false)
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
  const [publishValidation, setPublishValidation] = useState<PublishValidation>({
    isValid: false,
    errors: [],
    warnings: [],
  })
  const router = useRouter()

  useEffect(() => {
    fetchCategories()
    if (isEditing && course) {
      validateForPublishing()
    }
  }, [course, isEditing])

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

  const validateForPublishing = async () => {
    const validation: PublishValidation = {
      isValid: true,
      errors: [],
      warnings: [],
    }

    // Basic course information validation
    if (!formData.title.trim()) {
      validation.errors.push("Course title is required")
      validation.isValid = false
    }

    if (!formData.description.trim()) {
      validation.errors.push("Course description is required")
      validation.isValid = false
    }

    if (formData.description.trim().length < 50) {
      validation.warnings.push("Course description should be at least 50 characters for better SEO")
    }

    if (!formData.cover_image.trim()) {
      validation.warnings.push("Adding a cover image will make your course more appealing")
    }

    if (formData.category_id === "none") {
      validation.warnings.push("Selecting a category helps students find your course")
    }

    // Check if course has lessons (only for existing courses)
    if (isEditing && course) {
      try {
        const { data: lessons, error } = await supabase
          .from("lessons")
          .select("id, title, content, video_url, lesson_type")
          .eq("course_id", course.id)
          .order("order_index")

        if (error) throw error

        if (!lessons || lessons.length === 0) {
          validation.errors.push("Course must have at least one lesson before publishing")
          validation.isValid = false
        } else {
          // Validate lesson content
          const incompleteLessons = lessons.filter(
            (lesson) =>
              !lesson.title.trim() ||
              !lesson.content.trim() ||
              (lesson.lesson_type === "video" && !lesson.video_url?.trim()),
          )

          if (incompleteLessons.length > 0) {
            validation.errors.push(`${incompleteLessons.length} lesson(s) are incomplete and need content`)
            validation.isValid = false
          }

          if (lessons.length < 3) {
            validation.warnings.push("Courses with 3+ lessons tend to have better student engagement")
          }
        }
      } catch (error) {
        console.error("Error validating lessons:", error)
        validation.errors.push("Unable to validate course lessons. Please try again.")
        validation.isValid = false
      }
    } else if (!isEditing) {
      validation.errors.push("Please save the course and add lessons before publishing")
      validation.isValid = false
    }

    setPublishValidation(validation)
    return validation
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
    await saveCourse(false)
  }

  const handlePublish = async () => {
    const validation = await validateForPublishing()

    if (!validation.isValid) {
      toast({
        title: "Cannot Publish Course",
        description: "Please fix the errors before publishing.",
        variant: "destructive",
      })
      return
    }

    setShowPublishDialog(true)
  }

  const confirmPublish = async () => {
    setShowPublishDialog(false)
    await saveCourse(true)
  }

  const saveCourse = async (shouldPublish = false) => {
    if (!validateForm()) {
      toast({
        title: "Validation Error",
        description: "Please fix the errors in the form.",
        variant: "destructive",
      })
      return
    }

    if (shouldPublish) {
      setIsPublishing(true)
    } else {
      setIsSaving(true)
    }

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
        status: shouldPublish ? "published" : (formData.status as "draft" | "published"),
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

        // If publishing, also validate and update lesson metadata
        if (shouldPublish) {
          await updateLessonMetadata(course.id)
        }

        toast({
          title: shouldPublish ? "Course Published Successfully! 🎉" : "Course Updated! ✅",
          description: shouldPublish
            ? `"${data.title}" is now live and available to students.`
            : `"${data.title}" has been updated successfully.`,
        })

        // Update form data to reflect new status
        if (shouldPublish) {
          setFormData((prev) => ({ ...prev, status: "published" }))
        }

        // Refresh the page to show updated data
        router.refresh()
      } else {
        // Create new course
        const { data, error } = await supabase
          .from("courses")
          .insert({
            ...courseData,
            created_at: new Date().toISOString(),
          })
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

      let errorMessage = shouldPublish
        ? "Failed to publish course. Please try again."
        : "Failed to save course. Please try again."

      if (error.message?.includes("duplicate")) {
        errorMessage = "A course with this title already exists."
      } else if (error.message?.includes("Authentication")) {
        errorMessage = "You must be logged in to create courses."
      } else if (error.message?.includes("permission")) {
        errorMessage = "You don't have permission to perform this action."
      }

      toast({
        title: shouldPublish ? "Publishing Failed" : "Save Failed",
        description: errorMessage,
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
      setIsPublishing(false)
    }
  }

  const updateLessonMetadata = async (courseId: string) => {
    try {
      // Update lesson metadata for published course
      const { error } = await supabase
        .from("lessons")
        .update({ updated_at: new Date().toISOString() })
        .eq("course_id", courseId)

      if (error) throw error

      // Log publishing event (you could extend this for analytics)
      console.log(`Course ${courseId} published with lessons updated`)
    } catch (error) {
      console.error("Error updating lesson metadata:", error)
      // Don't fail the publish process for metadata updates
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
    <>
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
                  <p className="text-xs text-muted-foreground">
                    {formData.description.length}/50 characters minimum for publishing
                  </p>
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
                  <p className="text-xs text-muted-foreground">
                    Optional: Add a cover image URL to make your course more appealing
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Publishing Validation */}
            {isEditing && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <CheckCircle className="w-5 h-5" />
                    <span>Publishing Checklist</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {publishValidation.errors.length > 0 && (
                    <Alert variant="destructive">
                      <AlertTriangle className="h-4 w-4" />
                      <AlertDescription>
                        <div className="space-y-1">
                          <p className="font-medium">Required before publishing:</p>
                          <ul className="list-disc list-inside space-y-1">
                            {publishValidation.errors.map((error, index) => (
                              <li key={index} className="text-sm">
                                {error}
                              </li>
                            ))}
                          </ul>
                        </div>
                      </AlertDescription>
                    </Alert>
                  )}

                  {publishValidation.warnings.length > 0 && (
                    <Alert>
                      <AlertTriangle className="h-4 w-4" />
                      <AlertDescription>
                        <div className="space-y-1">
                          <p className="font-medium">Recommendations:</p>
                          <ul className="list-disc list-inside space-y-1">
                            {publishValidation.warnings.map((warning, index) => (
                              <li key={index} className="text-sm">
                                {warning}
                              </li>
                            ))}
                          </ul>
                        </div>
                      </AlertDescription>
                    </Alert>
                  )}

                  {publishValidation.isValid && publishValidation.warnings.length === 0 && (
                    <Alert>
                      <CheckCircle className="h-4 w-4" />
                      <AlertDescription>Your course is ready to publish! All requirements are met.</AlertDescription>
                    </Alert>
                  )}
                </CardContent>
              </Card>
            )}
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
                  <p className="text-xs text-muted-foreground">
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

                  {isEditing && course && formData.status === "draft" && (
                    <Button
                      type="button"
                      onClick={handlePublish}
                      disabled={isPublishing || !publishValidation.isValid}
                      className="w-full"
                      variant="default"
                    >
                      {isPublishing ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Publishing...
                        </>
                      ) : (
                        <>
                          <Globe className="mr-2 h-4 w-4" />
                          Publish Course
                        </>
                      )}
                    </Button>
                  )}

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
                  <div className="flex justify-between text-sm">
                    <span>Status:</span>
                    <Badge variant={course.status === "published" ? "default" : "secondary"}>{course.status}</Badge>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </form>

      {/* Publish Confirmation Dialog */}
      <Dialog open={showPublishDialog} onOpenChange={setShowPublishDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              <Globe className="w-5 h-5" />
              <span>Publish Course</span>
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to publish "{formData.title}"? Once published, the course will be visible to all
              students and they can enroll.
            </DialogDescription>
          </DialogHeader>

          {publishValidation.warnings.length > 0 && (
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                <div className="space-y-1">
                  <p className="font-medium">Before publishing, consider:</p>
                  <ul className="list-disc list-inside space-y-1">
                    {publishValidation.warnings.map((warning, index) => (
                      <li key={index} className="text-sm">
                        {warning}
                      </li>
                    ))}
                  </ul>
                </div>
              </AlertDescription>
            </Alert>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowPublishDialog(false)}>
              Cancel
            </Button>
            <Button onClick={confirmPublish} disabled={isPublishing}>
              {isPublishing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Publishing...
                </>
              ) : (
                <>
                  <Upload className="mr-2 h-4 w-4" />
                  Publish Course
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
