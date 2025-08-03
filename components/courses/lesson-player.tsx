"use client"

import { useState, useEffect } from "react"
import { ChevronLeft, ChevronRight, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { toast } from "@/hooks/use-toast"

interface Lesson {
  id: string
  title: string
  content?: string
  videoUrl?: string
  order: number
}

interface LessonProgress {
  id: string
  lessonId: string
  studentId: string
  completedAt?: Date
}

interface LessonPlayerProps {
  lesson: Lesson
  lessons: Lesson[]
  userId: string
  onLessonChange: (lessonId: string) => void
  progress: LessonProgress[]
}

export function LessonPlayer({ lesson, lessons, userId, onLessonChange, progress }: LessonPlayerProps) {
  const [isCompleted, setIsCompleted] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const currentIndex = lessons.findIndex((l) => l.id === lesson.id)
  const previousLesson = currentIndex > 0 ? lessons[currentIndex - 1] : null
  const nextLesson = currentIndex < lessons.length - 1 ? lessons[currentIndex + 1] : null

  useEffect(() => {
    const lessonProgress = progress.find((p) => p.lessonId === lesson.id)
    setIsCompleted(!!lessonProgress?.completedAt)
  }, [lesson.id, progress])

  const toggleCompletion = async () => {
    setIsLoading(true)

    try {
      const response = await fetch(`/api/lessons/${lesson.id}/progress`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          completed: !isCompleted
        })
      })

      if (!response.ok) {
        throw new Error('Failed to update progress')
      }

      setIsCompleted(!isCompleted)
      
      toast({
        title: isCompleted ? "Progress Updated" : "Great Job! 🎉",
        description: isCompleted ? "Lesson marked as incomplete." : "Lesson completed successfully!",
      })
    } catch (error) {
      console.error("Error updating lesson progress:", error)
      toast({
        title: "Error",
        description: "Failed to update lesson progress. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const renderVideoPlayer = () => {
    if (!lesson.videoUrl) return null

    // Handle YouTube URLs
    if (lesson.videoUrl.includes("youtube.com") || lesson.videoUrl.includes("youtu.be")) {
      const videoId = lesson.videoUrl.includes("youtu.be")
        ? lesson.videoUrl.split("/").pop()?.split("?")[0]
        : lesson.videoUrl.split("v=")[1]?.split("&")[0]

      if (!videoId) {
        return (
          <div className="aspect-video bg-gray-100 rounded-lg flex items-center justify-center">
            <p className="text-gray-500">Invalid YouTube URL</p>
          </div>
        )
      }

      return (
        <div className="aspect-video">
          <iframe
            src={`https://www.youtube.com/embed/${videoId}`}
            title={lesson.title}
            className="w-full h-full rounded-lg"
            allowFullScreen
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          />
        </div>
      )
    }

    // Handle Vimeo URLs
    if (lesson.videoUrl.includes("vimeo.com")) {
      const videoId = lesson.videoUrl.split("/").pop()?.split("?")[0]

      if (!videoId) {
        return (
          <div className="aspect-video bg-gray-100 rounded-lg flex items-center justify-center">
            <p className="text-gray-500">Invalid Vimeo URL</p>
          </div>
        )
      }

      return (
        <div className="aspect-video">
          <iframe
            src={`https://player.vimeo.com/video/${videoId}`}
            title={lesson.title}
            className="w-full h-full rounded-lg"
            allowFullScreen
            allow="autoplay; fullscreen; picture-in-picture"
          />
        </div>
      )
    }

    // Handle direct video URLs
    return (
      <video src={lesson.videoUrl} controls className="w-full aspect-video rounded-lg">
        Your browser does not support the video tag.
      </video>
    )
  }

  return (
    <div className="space-y-6">
      {/* Video Player */}
      {lesson.videoUrl && (
        <Card>
          <CardContent className="p-6">{renderVideoPlayer()}</CardContent>
        </Card>
      )}

      {/* Lesson Content */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center space-x-2">
              <span>
                Lesson {lesson.order}: {lesson.title}
              </span>
            </CardTitle>

            <div className="flex items-center space-x-2">
              <Checkbox id="completed" checked={isCompleted} onCheckedChange={toggleCompletion} disabled={isLoading} />
              <label htmlFor="completed" className="text-sm font-medium cursor-pointer">
                {isLoading ? (
                  <span className="flex items-center">
                    <Loader2 className="mr-1 h-3 w-3 animate-spin" />
                    Updating...
                  </span>
                ) : (
                  "Mark as complete"
                )}
              </label>
            </div>
          </div>


        </CardHeader>

        <CardContent>
          {lesson.content && (
            <div className="prose max-w-none">
              <div
                dangerouslySetInnerHTML={{
                  __html: lesson.content
                    .replace(/\n/g, "<br>")
                    .replace(
                      /```(\w+)?\n([\s\S]*?)```/g,
                      '<pre class="bg-gray-100 p-4 rounded-lg overflow-x-auto"><code>$2</code></pre>',
                    )
                    .replace(/`([^`]+)`/g, '<code class="bg-gray-100 px-1 py-0.5 rounded text-sm">$1</code>'),
                }}
              />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Navigation */}
      <div className="flex justify-between">
        <Button
          variant="outline"
          onClick={() => previousLesson && onLessonChange(previousLesson.id)}
          disabled={!previousLesson}
        >
          <ChevronLeft className="w-4 h-4 mr-2" />
          Previous Lesson
        </Button>

        <Button onClick={() => nextLesson && onLessonChange(nextLesson.id)} disabled={!nextLesson}>
          Next Lesson
          <ChevronRight className="w-4 h-4 ml-2" />
        </Button>
      </div>
    </div>
  )
}
