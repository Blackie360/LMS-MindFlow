import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { BookOpen, Users, Clock } from "lucide-react"
import Link from "next/link"
interface Course {
  id: string
  title: string
  description?: string
  thumbnail?: string
  createdBy: string
  createdAt: Date
  updatedAt: Date
}

interface CourseCardProps {
  course: Course
  showEnrollButton?: boolean
  isEnrolled?: boolean
  progress?: number
}

export function CourseCard({ course, showEnrollButton = false, isEnrolled = false, progress = 0 }: CourseCardProps) {
  return (
    <Card className="group hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
      <div className="relative overflow-hidden rounded-t-lg">
        <div className="aspect-video bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
          <BookOpen className="w-12 h-12 text-primary" />
        </div>
        <div className="absolute top-2 right-2">
          <Badge variant="secondary" className="bg-white/90 backdrop-blur-sm">
            ${course.price === 0 ? "Free" : course.price.toFixed(2)}
          </Badge>
        </div>
        {isEnrolled && (
          <div className="absolute top-2 left-2">
            <Badge className="bg-green-600">Enrolled</Badge>
          </div>
        )}
      </div>

      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          {course.category && (
            <Badge variant="outline" className="mb-2">
              {course.category.name}
            </Badge>
          )}
        </div>
        <CardTitle className="line-clamp-2 group-hover:text-primary transition-colors">{course.title}</CardTitle>
        <CardDescription className="line-clamp-2">{course.description}</CardDescription>
      </CardHeader>

      <CardContent className="pt-0">
        <div className="flex items-center justify-between text-sm text-muted-foreground mb-4">
          <span className="flex items-center">
            <Clock className="w-4 h-4 mr-1" />
            {course.lessons?.length || 0} lessons
          </span>
          <span className="flex items-center">
            <Users className="w-4 h-4 mr-1" />
            {course._count?.enrollments || 0}
          </span>
        </div>

        {isEnrolled && progress > 0 && (
          <div className="mb-4">
            <div className="flex justify-between text-sm mb-1">
              <span>Progress</span>
              <span>{Math.round(progress)}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div className="bg-primary h-2 rounded-full" style={{ width: `${progress}%` }}></div>
            </div>
          </div>
        )}

        <div className="flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            by {course.instructor?.full_name || course.instructor?.email || "Unknown"}
          </div>
          <div className="flex gap-2">
            <Button asChild size="sm" variant="outline">
              <Link href={`/courses/${course.id}`}>View</Link>
            </Button>
            {showEnrollButton && !isEnrolled && <Button size="sm">Enroll</Button>}
            {isEnrolled && (
              <Button asChild size="sm">
                <Link href={`/courses/${course.id}/learn`}>Continue</Link>
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
