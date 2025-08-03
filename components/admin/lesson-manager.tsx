"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { LessonForm } from "./lesson-form"
import { Plus, Edit, Trash2, GripVertical, Video, FileText, File } from "lucide-react"
import { supabase } from "@/lib/supabase"
import { toast } from "@/hooks/use-toast"
import type { Lesson } from "@/lib/supabase"

interface LessonManagerProps {
  courseId: string
  lessons: Lesson[]
}

export function LessonManager({ courseId, lessons: initialLessons }: LessonManagerProps) {
  const [lessons, setLessons] = useState(initialLessons.sort((a, b) => a.order_index - b.order_index))
  const [showForm, setShowForm] = useState(false)
  const [editingLesson, setEditingLesson] = useState<Lesson | null>(null)
  const [isDeleting, setIsDeleting] = useState<string | null>(null)

  const handleAddLesson = () => {
    setEditingLesson(null)
    setShowForm(true)
  }

  const handleEditLesson = (lesson: Lesson) => {
    setEditingLesson(lesson)
    setShowForm(true)
  }

  const handleDeleteLesson = async (lessonId: string) => {
    if (!confirm("Are you sure you want to delete this lesson? This action cannot be undone.")) {
      return
    }

    setIsDeleting(lessonId)

    try {
      const { error } = await supabase.from("lessons").delete().eq("id", lessonId)

      if (error) throw error

      setLessons((prev) => prev.filter((lesson) => lesson.id !== lessonId))
      toast({
        title: "Lesson Deleted",
        description: "The lesson has been deleted successfully.",
      })
    } catch (error) {
      console.error("Delete lesson error:", error)
      toast({
        title: "Error",
        description: "Failed to delete lesson. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsDeleting(null)
    }
  }

  const handleLessonSaved = (lesson: Lesson) => {
    if (editingLesson) {
      setLessons((prev) => prev.map((l) => (l.id === lesson.id ? lesson : l)))
    } else {
      setLessons((prev) => [...prev, lesson].sort((a, b) => a.order_index - b.order_index))
    }
    setShowForm(false)
    setEditingLesson(null)
  }

  const getLessonIcon = (type: string) => {
    switch (type) {
      case "video":
        return <Video className="w-4 h-4" />
      case "pdf":
        return <File className="w-4 h-4" />
      default:
        return <FileText className="w-4 h-4" />
    }
  }

  const getLessonTypeColor = (type: string) => {
    switch (type) {
      case "video":
        return "bg-red-100 text-red-800"
      case "pdf":
        return "bg-blue-100 text-blue-800"
      default:
        return "bg-green-100 text-green-800"
    }
  }

  if (showForm) {
    return (
      <LessonForm
        courseId={courseId}
        lesson={editingLesson}
        isEditing={!!editingLesson}
        onSave={handleLessonSaved}
        onCancel={() => {
          setShowForm(false)
          setEditingLesson(null)
        }}
        nextOrderIndex={lessons.length + 1}
      />
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Course Lessons</h2>
          <p className="text-gray-600">Manage the lessons in your course</p>
        </div>
        <Button onClick={handleAddLesson}>
          <Plus className="w-4 h-4 mr-2" />
          Add Lesson
        </Button>
      </div>

      {lessons.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <FileText className="w-12 h-12 mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No lessons yet</h3>
            <p className="text-gray-500 mb-4">Get started by adding your first lesson to this course.</p>
            <Button onClick={handleAddLesson}>
              <Plus className="w-4 h-4 mr-2" />
              Add First Lesson
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {lessons.map((lesson) => (
            <Card key={lesson.id}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-2">
                      <GripVertical className="w-4 h-4 text-gray-400" />
                      <span className="text-sm font-medium text-gray-500">#{lesson.order_index}</span>
                    </div>

                    <div className="flex items-center space-x-2">
                      {getLessonIcon(lesson.lesson_type)}
                      <Badge className={getLessonTypeColor(lesson.lesson_type)} variant="secondary">
                        {lesson.lesson_type}
                      </Badge>
                    </div>

                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900">{lesson.title}</h3>
                      {lesson.description && <p className="text-sm text-gray-500 mt-1">{lesson.description}</p>}
                      {lesson.duration && <p className="text-xs text-gray-400 mt-1">{lesson.duration} minutes</p>}
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Button variant="outline" size="sm" onClick={() => handleEditLesson(lesson)}>
                      <Edit className="w-4 h-4 mr-1" />
                      Edit
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDeleteLesson(lesson.id)}
                      disabled={isDeleting === lesson.id}
                    >
                      <Trash2 className="w-4 h-4 mr-1" />
                      {isDeleting === lesson.id ? "Deleting..." : "Delete"}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
