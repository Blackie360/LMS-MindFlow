import { notFound, redirect } from "next/navigation"
import { supabase } from "@/lib/supabase"
import { getCurrentUser } from "@/lib/auth"
import { LessonViewer } from "@/components/courses/lesson-viewer"

interface LearnPageProps {
  params: {
    id: string
  }
  searchParams: {
    lesson?: string
  }
}

export default async function LearnPage({ params, searchParams }: LearnPageProps) {
  const user = await getCurrentUser()

  if (!user) {
    redirect("/auth")
  }

  // Check if user is enrolled
  const { data: enrollment } = await supabase
    .from("enrollments")
    .select("*")
    .eq("student_id", user.id)
    .eq("course_id", params.id)
    .single()

  if (!enrollment) {
    redirect(`/courses/${params.id}`)
  }

  // Fetch course with lessons
  const { data: course } = await supabase
    .from("courses")
    .select(`
      *,
      lessons(*)
    `)
    .eq("id", params.id)
    .single()

  if (!course) {
    notFound()
  }

  // Sort lessons by order
  const lessons = course.lessons?.sort((a, b) => a.order_index - b.order_index) || []

  // Get current lesson (from URL param or first lesson)
  const currentLessonId = searchParams.lesson || lessons[0]?.id
  const currentLesson = lessons.find((l) => l.id === currentLessonId)

  if (!currentLesson) {
    notFound()
  }

  // Fetch user's progress
  const { data: progress } = await supabase
    .from("lesson_progress")
    .select("*")
    .eq("student_id", user.id)
    .in(
      "lesson_id",
      lessons.map((l) => l.id),
    )

  return (
    <LessonViewer
      course={course}
      lessons={lessons}
      currentLesson={currentLesson}
      userId={user.id}
      progress={progress || []}
    />
  )
}
