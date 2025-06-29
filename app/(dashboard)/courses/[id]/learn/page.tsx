import { notFound, redirect } from "next/navigation"
import { getCurrentUser } from "@/lib/auth"
import { LessonViewer } from "@/components/courses/lesson-viewer"

// Static course data for demo
const getCourseData = (id: string) => {
  const courses = {
    "1": {
      id: "1",
      title: "Introduction to React",
      lessons: [
        {
          id: "lesson-1",
          title: "Introduction to React",
          description: "Overview of React and its ecosystem",
          content: "Welcome to React! In this lesson, we'll explore what React is and why it's so popular...",
          video_url: "https://example.com/video1.mp4",
          order_index: 1,
          duration: 15,
          lesson_type: "video" as const,
        },
        {
          id: "lesson-2",
          title: "Components and JSX",
          description: "Understanding React components and JSX syntax",
          content: "React components are the building blocks of any React application...",
          video_url: "https://example.com/video2.mp4",
          order_index: 2,
          duration: 20,
          lesson_type: "video" as const,
        },
      ],
    },
  }

  return courses[id as keyof typeof courses] || null
}

export default async function LearnPage({
  params,
  searchParams,
}: {
  params: { id: string }
  searchParams: { lesson?: string }
}) {
  const user = await getCurrentUser()

  if (!user) {
    redirect("/auth")
  }

  const course = getCourseData(params.id)

  if (!course) {
    notFound()
  }

  // Get current lesson
  const lessonId = searchParams.lesson || course.lessons[0]?.id
  const currentLesson = course.lessons.find((l) => l.id === lessonId) || course.lessons[0]

  if (!currentLesson) {
    notFound()
  }

  return (
    <div className="h-screen flex flex-col">
      <LessonViewer course={course} currentLesson={currentLesson} userId={user.id} />
    </div>
  )
}
