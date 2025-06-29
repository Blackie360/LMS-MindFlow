"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Play, Pause, CheckCircle, Clock, ChevronLeft, ChevronRight } from "lucide-react"
import Link from "next/link"
import { toast } from "@/hooks/use-toast"

interface Lesson {
  id: string
  title: string
  description: string
  content: string
  video_url?: string
  order_index: number
  duration: number
  lesson_type: "video" | "text" | "pdf"
}

interface Course {
  id: string
  title: string
  lessons: Lesson[]
}

interface LessonViewerProps {
  course: Course
  currentLesson: Lesson
  userId: string
}

export function LessonViewer({ course, currentLesson, userId }: LessonViewerProps) {
  const [isPlaying, setIsPlaying] = useState(false)
  const [progress, setProgress] = useState(0)
  const [isCompleted, setIsCompleted] = useState(false)

  const currentIndex = course.lessons.findIndex((l) => l.id === currentLesson.id)
  const nextLesson = course.lessons[currentIndex + 1]
  const prevLesson = course.lessons[currentIndex - 1]

  const handleMarkComplete = async () => {
    try {
      // Simulate marking lesson as complete
      await new Promise((resolve) => setTimeout(resolve, 500))

      setIsCompleted(true)
      toast({
        title: "Lesson Completed!",
        description: "Great job! You've completed this lesson.",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to mark lesson as complete.",
        variant: "destructive",
      })
    }
  }

  const togglePlayPause = () => {
    setIsPlaying(!isPlaying)
  }

  return (
    <div className="flex h-full">
      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="border-b p-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-semibold">{currentLesson.title}</h1>
              <p className="text-sm text-muted-foreground">{course.title}</p>
            </div>
            <div className="flex items-center space-x-2">
              <Badge variant="outline">
                Lesson {currentLesson.order_index} of {course.lessons.length}
              </Badge>
              <Button
                onClick={handleMarkComplete}
                disabled={isCompleted}
                variant={isCompleted ? "secondary" : "default"}
                size="sm"
              >
                {isCompleted ? (
                  <>
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Completed
                  </>
                ) : (
                  "Mark Complete"
                )}
              </Button>
            </div>
          </div>
        </div>

        {/* Video/Content Area */}
        <div className="flex-1 p-6">
          {currentLesson.lesson_type === "video" ? (
            <div className="space-y-4">
              {/* Video Player Placeholder */}
              <div className="aspect-video bg-black rounded-lg flex items-center justify-center relative">
                <div className="text-white text-center">
                  <Play className="w-16 h-16 mx-auto mb-4" />
                  <p>Video Player</p>
                  <p className="text-sm opacity-75">{currentLesson.video_url}</p>
                </div>

                {/* Video Controls */}
                <div className="absolute bottom-4 left-4 right-4">
                  <div className="flex items-center space-x-4 text-white">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={togglePlayPause}
                      className="text-white hover:bg-white/20"
                    >
                      {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                    </Button>
                    <Progress value={progress} className="flex-1" />
                    <span className="text-sm">
                      {Math.floor((progress * currentLesson.duration) / 100)}:
                      {String(Math.floor((((progress * currentLesson.duration) / 100) % 1) * 60)).padStart(2, "0")} /{" "}
                      {currentLesson.duration}:00
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle>{currentLesson.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="prose max-w-none">
                  <p>{currentLesson.content}</p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Navigation */}
        <div className="border-t p-4">
          <div className="flex items-center justify-between">
            <div>
              {prevLesson ? (
                <Button asChild variant="outline">
                  <Link href={`/courses/${course.id}/learn?lesson=${prevLesson.id}`}>
                    <ChevronLeft className="w-4 h-4 mr-2" />
                    Previous
                  </Link>
                </Button>
              ) : (
                <div />
              )}
            </div>

            <div className="flex items-center space-x-2">
              <span className="text-sm text-muted-foreground">
                {currentIndex + 1} of {course.lessons.length}
              </span>
              <Progress value={((currentIndex + 1) / course.lessons.length) * 100} className="w-32" />
            </div>

            <div>
              {nextLesson ? (
                <Button asChild>
                  <Link href={`/courses/${course.id}/learn?lesson=${nextLesson.id}`}>
                    Next
                    <ChevronRight className="w-4 h-4 ml-2" />
                  </Link>
                </Button>
              ) : (
                <Button asChild>
                  <Link href={`/courses/${course.id}`}>Course Complete</Link>
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Sidebar */}
      <div className="w-80 border-l bg-muted/30">
        <div className="p-4 border-b">
          <h3 className="font-semibold">Course Content</h3>
        </div>
        <div className="p-4 space-y-2">
          {course.lessons.map((lesson, index) => (
            <Link
              key={lesson.id}
              href={`/courses/${course.id}/learn?lesson=${lesson.id}`}
              className={`block p-3 rounded-lg border transition-colors ${
                lesson.id === currentLesson.id ? "bg-primary text-primary-foreground" : "hover:bg-muted"
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div
                    className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${
                      lesson.id === currentLesson.id
                        ? "bg-primary-foreground text-primary"
                        : isCompleted && index < currentIndex
                          ? "bg-green-600 text-white"
                          : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {isCompleted && index < currentIndex ? <CheckCircle className="w-3 h-3" /> : index + 1}
                  </div>
                  <div className="flex-1">
                    <h4 className="text-sm font-medium line-clamp-1">{lesson.title}</h4>
                    <div className="flex items-center space-x-2 text-xs opacity-75">
                      <Clock className="w-3 h-3" />
                      <span>{lesson.duration} min</span>
                    </div>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
