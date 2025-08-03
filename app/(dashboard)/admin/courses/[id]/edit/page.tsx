import { notFound, redirect } from "next/navigation"
import { getCurrentUser } from "@/lib/session"
import { supabase } from "@/lib/supabase"
import { CourseForm } from "@/components/admin/course-form"
import { LessonManager } from "@/components/admin/lesson-manager"
import { PublishStatusIndicator } from "@/components/admin/publish-status-indicator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

interface EditCoursePageProps {
  params: {
    id: string
  }
}

export default async function EditCoursePage({ params }: EditCoursePageProps) {
  const user = await getCurrentUser()

  if (!user || user.role !== "admin") {
    redirect("/dashboard")
  }

  const { data: course } = await supabase
    .from("courses")
    .select(`
      *,
      category:categories(*),
      lessons(*),
      _count:enrollments(count)
    `)
    .eq("id", params.id)
    .single()

  if (!course) {
    notFound()
  }

  // Count completed lessons (lessons with content)
  const completedLessons =
    course.lessons?.filter(
      (lesson) => lesson.title && lesson.content && (lesson.lesson_type !== "video" || lesson.video_url),
    ).length || 0

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Edit Course</h1>
        <p className="text-gray-600">Manage your course content and settings</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-3">
          <Tabs defaultValue="details" className="space-y-6">
            <TabsList>
              <TabsTrigger value="details">Course Details</TabsTrigger>
              <TabsTrigger value="lessons">Lessons ({course.lessons?.length || 0})</TabsTrigger>
              <TabsTrigger value="students">Students ({course._count?.count || 0})</TabsTrigger>
            </TabsList>

            <TabsContent value="details">
              <CourseForm course={course} isEditing={true} />
            </TabsContent>

            <TabsContent value="lessons">
              <LessonManager courseId={course.id} lessons={course.lessons || []} />
            </TabsContent>

            <TabsContent value="students">
              <div className="text-center py-12">
                <p className="text-gray-500">Student management coming soon...</p>
              </div>
            </TabsContent>
          </Tabs>
        </div>

        <div className="lg:col-span-1">
          <PublishStatusIndicator
            course={course}
            lessonsCount={course.lessons?.length || 0}
            completedLessons={completedLessons}
          />
        </div>
      </div>
    </div>
  )
}
