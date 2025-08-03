"use client"

import { useState, useEffect } from "react"
import { ChevronLeft, ChevronRight, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { supabase } from "@/lib/supabase"
import { toast } from "@/hooks/use-toast"
import type { Lesson, LessonProgress } from "@/lib/supabase"

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
    const lessonProgress = progress.find((p) => p.lesson_id === lesson.id)
    setIsCompleted(lessonProgress?.completed || false)
  }, [lesson.id, progress])

  const toggleCompletion = async () => {
    setIsLoading(true)

    try {
      if (isCompleted) {
        // Mark as incomplete
        const { error } = await supabase
          .from("lesson_progress")
          .delete()
          .eq("student_id", userId)
          .eq("lesson_id", lesson.id)

        if (error) {
          throw error
        }

        toast({
          title: "Progress Updated",
          description: "Lesson marked as incomplete.",
        })
      } else {
        // Mark as complete
        const { error } = await supabase.from("lesson_progress").upsert({
          student_id: userId,
          lesson_id: lesson.id,
          completed: true,
          completed_at: new Date().toISOString(),
        })

        if (error) {
          throw error
        }

        toast({
          title: "Great Job! 🎉",
          description: "Lesson completed successfully!",
        })
      }

      setIsCompleted(!isCompleted)
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
    if (!lesson.video_url) return null

    // Handle YouTube URLs
    if (lesson.video_url.includes("youtube.com") || lesson.video_url.includes("youtu.be")) {
      const videoId = lesson.video_url.includes("youtu.be")
        ? lesson.video_url.split("/").pop()?.split("?")[0]
        : lesson.video_url.split("v=")[1]?.split("&")[0]

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
    if (lesson.video_url.includes("vimeo.com")) {
      const videoId = lesson.video_url.split("/").pop()?.split("?")[0]

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
      <video src={lesson.video_url} controls className="w-full aspect-video rounded-lg">
        Your browser does not support the video tag.
      </video>
    )
  }

  return (
    <div className="space-y-6">
      {/* Video Player */}
      {lesson.lesson_type === "video" && lesson.video_url && (
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
                Lesson {lesson.order_index}: {lesson.title}
              </span>
              {lesson.duration && <span className="text-sm text-gray-500 font-normal">({lesson.duration} min)</span>}
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

          {lesson.description && <p className="text-gray-600">{lesson.description}</p>}
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
