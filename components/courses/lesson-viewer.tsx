"use client"

import { useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { ChevronLeft, CheckCircle, Circle, Menu, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { LessonPlayer } from "./lesson-player"
import type { Course, Lesson, LessonProgress } from "@/lib/supabase"

interface LessonViewerProps {
  course: Course
  lessons: Lesson[]
  currentLesson: Lesson
  userId: string
  progress: LessonProgress[]
}

export function LessonViewer({ course, lessons, currentLesson, userId, progress }: LessonViewerProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const router = useRouter()
  const searchParams = useSearchParams()

  const completedLessons = progress.filter((p) => p.completed).length
  const progressPercentage = lessons.length > 0 ? (completedLessons / lessons.length) * 100 : 0

  const handleLessonChange = (lessonId: string) => {
    const params = new URLSearchParams(searchParams.toString())
    params.set("lesson", lessonId)
    router.push(`/courses/${course.id}/learn?${params.toString()}`)
    setSidebarOpen(false)
  }

  const isLessonCompleted = (lessonId: string) => {
    return progress.some((p) => p.lesson_id === lessonId && p.completed)
  }

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Mobile sidebar toggle */}
      <Button
        variant="ghost"
        size="icon"
        className="fixed top-4 left-4 z-50 lg:hidden"
        onClick={() => setSidebarOpen(!sidebarOpen)}
      >
        {sidebarOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
      </Button>

      {/* Sidebar */}
      <div
        className={`
        fixed inset-y-0 left-0 z-40 w-80 bg-white border-r border-gray-200 transform transition-transform duration-300 ease-in-out
        ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
        lg:translate-x-0 lg:static lg:inset-0
      `}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="p-6 border-b border-gray-200">
            <Button variant="ghost" size="sm" className="mb-4" onClick={() => router.push(`/courses/${course.id}`)}>
              <ChevronLeft className="w-4 h-4 mr-2" />
              Back to Course
            </Button>

            <h1 className="text-lg font-semibold text-gray-900 line-clamp-2">{course.title}</h1>

            <div className="mt-4 space-y-2">
              <div className="flex justify-between text-sm text-gray-600">
                <span>Progress</span>
                <span>
                  {completedLessons}/{lessons.length} lessons
                </span>
              </div>
              <Progress value={progressPercentage} className="h-2" />
            </div>
          </div>

          {/* Lessons List */}
          <div className="flex-1 overflow-y-auto p-4">
            <div className="space-y-2">
              {lessons.map((lesson, index) => {
                const isCompleted = isLessonCompleted(lesson.id)
                const isCurrent = lesson.id === currentLesson.id

                return (
                  <button
                    key={lesson.id}
                    onClick={() => handleLessonChange(lesson.id)}
                    className={`
                      w-full text-left p-3 rounded-lg border transition-colors
                      ${isCurrent ? "bg-blue-50 border-blue-200" : "bg-white border-gray-200 hover:bg-gray-50"}
                    `}
                  >
                    <div className="flex items-start space-x-3">
                      <div className="flex-shrink-0 mt-1">
                        {isCompleted ? (
                          <CheckCircle className="w-5 h-5 text-green-500" />
                        ) : (
                          <Circle className="w-5 h-5 text-gray-400" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2">
                          <span className="text-xs text-gray-500">Lesson {lesson.order_index}</span>
                          {lesson.duration && <span className="text-xs text-gray-500">{lesson.duration} min</span>}
                        </div>
                        <h3
                          className={`
                          text-sm font-medium line-clamp-2
                          ${isCurrent ? "text-blue-700" : "text-gray-900"}
                        `}
                        >
                          {lesson.title}
                        </h3>
                        {lesson.description && (
                          <p className="text-xs text-gray-500 line-clamp-1 mt-1">{lesson.description}</p>
                        )}
                      </div>
                    </div>
                  </button>
                )
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 lg:ml-0">
        <div className="h-full overflow-y-auto p-6 lg:p-8">
          <LessonPlayer
            lesson={currentLesson}
            lessons={lessons}
            userId={userId}
            onLessonChange={handleLessonChange}
            progress={progress}
          />
        </div>
      </div>

      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-30 bg-black bg-opacity-50 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}
    </div>
  )
}
