import Image from "next/image"
import Link from "next/link"
import { Clock, Users, BookOpen, TrendingUp } from "lucide-react"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import type { Course } from "@/lib/supabase"

interface CourseCardProps {
  course: Course
  showEnrollButton?: boolean
  isEnrolled?: boolean
  progress?: number
}

export function CourseCard({ course, showEnrollButton = false, isEnrolled = false, progress = 0 }: CourseCardProps) {
  const totalLessons = course._count?.lessons || 0
  const completedLessons = Math.round((progress / 100) * totalLessons)

  return (
    <Card className="course-card group">
      <CardHeader className="p-0">
        <div className="relative h-48 bg-gradient-to-br from-muted to-muted/50 overflow-hidden">
          {course.cover_image ? (
            <Image
              src={course.cover_image || "/placeholder.svg"}
              alt={course.title}
              fill
              className="object-cover transition-transform duration-300 group-hover:scale-105"
            />
          ) : (
            <div className="flex items-center justify-center h-full bg-gradient-to-br from-primary/10 to-primary/5">
              <BookOpen className="w-12 h-12 text-primary/40" />
            </div>
          )}

          {/* Overlay gradient */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />

          {/* Status badge */}
          {course.status === "draft" && (
            <Badge className="absolute top-3 right-3 bg-secondary/90 backdrop-blur-sm" variant="secondary">
              Draft
            </Badge>
          )}

          {/* Price badge */}
          <div className="absolute top-3 left-3">
            <Badge className="bg-background/90 text-foreground backdrop-blur-sm font-semibold">
              {course.price === 0 ? "Free" : `$${course.price.toFixed(2)}`}
            </Badge>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-6">
        <div className="space-y-4">
          <div className="space-y-2">
            <h3 className="font-semibold text-lg line-clamp-2 group-hover:text-primary transition-colors">
              {course.title}
            </h3>
            <p className="text-sm text-muted-foreground line-clamp-2">{course.description}</p>
          </div>

          <div className="flex items-center space-x-4 text-sm text-muted-foreground">
            <div className="flex items-center">
              <Clock className="w-4 h-4 mr-1" />
              {totalLessons} lessons
            </div>
            <div className="flex items-center">
              <Users className="w-4 h-4 mr-1" />
              {course._count?.enrollments || 0} students
            </div>
          </div>

          {course.category && (
            <Badge variant="outline" className="w-fit">
              {course.category.name}
            </Badge>
          )}

          {isEnrolled && (
            <div className="space-y-3 p-4 bg-muted/30 rounded-lg border">
              <div className="flex justify-between text-sm">
                <span className="font-medium">Your Progress</span>
                <span className="text-muted-foreground">
                  {completedLessons}/{totalLessons} lessons
                </span>
              </div>
              <Progress value={progress} className="progress-bar h-2" />
              <div className="flex items-center text-xs text-muted-foreground">
                <TrendingUp className="w-3 h-3 mr-1" />
                {progress.toFixed(0)}% complete
              </div>
            </div>
          )}
        </div>
      </CardContent>

      <CardFooter className="p-6 pt-0 flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <Button
            asChild
            variant="outline"
            size="sm"
            className="hover:bg-primary hover:text-primary-foreground transition-colors bg-transparent"
          >
            <Link href={`/courses/${course.id}`}>View Details</Link>
          </Button>
        </div>

        <div className="flex items-center space-x-2">
          {showEnrollButton && !isEnrolled && (
            <Button size="sm" className="btn-gradient">
              Enroll Now
            </Button>
          )}

          {isEnrolled && (
            <Button asChild size="sm" className="btn-gradient">
              <Link href={`/courses/${course.id}/learn`}>Continue Learning</Link>
            </Button>
          )}
        </div>
      </CardFooter>
    </Card>
  )
}
