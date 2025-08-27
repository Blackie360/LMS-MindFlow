import { Suspense } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { BookOpen, Users, Star, Clock, Search, Filter } from "lucide-react"
import Link from "next/link"
import { LoadingSpinner } from "@/components/ui/loading-spinner"

// Force dynamic rendering
export const dynamic = 'force-dynamic'

// Static course data for demo
const courses = [
  {
    id: "1",
    title: "Introduction to React",
    description: "Learn the fundamentals of React development and build modern web applications",
    instructor: { full_name: "John Doe" },
    category: { name: "Web Development" },
    price: 99.99,
    enrollments: [{ count: 156 }],
    lessons: [{ count: 12 }],
    rating: 4.8,
    duration: "8 hours",
  },
  {
    id: "2",
    title: "Advanced JavaScript",
    description: "Master advanced JavaScript concepts, patterns, and modern ES6+ features",
    instructor: { full_name: "Jane Smith" },
    category: { name: "Programming" },
    price: 149.99,
    enrollments: [{ count: 89 }],
    lessons: [{ count: 18 }],
    rating: 4.9,
    duration: "12 hours",
  },
  {
    id: "3",
    title: "UI/UX Design Principles",
    description: "Learn design thinking, user experience principles, and create beautiful interfaces",
    instructor: { full_name: "Mike Johnson" },
    category: { name: "Design" },
    price: 79.99,
    enrollments: [{ count: 203 }],
    lessons: [{ count: 10 }],
    rating: 4.7,
    duration: "6 hours",
  },
]

const categories = [
  { id: "cat-1", name: "Web Development" },
  { id: "cat-2", name: "Programming" },
  { id: "cat-3", name: "Design" },
  { id: "cat-4", name: "Data Science" },
]

function CourseFilters() {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input placeholder="Search courses..." className="pl-10" />
            </div>
          </div>
          <div className="flex gap-2">
            <Select defaultValue="all">
              <SelectTrigger className="w-[180px]">
                <Filter className="w-4 h-4 mr-2" />
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map((category) => (
                  <SelectItem key={category.id} value={category.id}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select defaultValue="all">
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Level" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Levels</SelectItem>
                <SelectItem value="beginner">Beginner</SelectItem>
                <SelectItem value="intermediate">Intermediate</SelectItem>
                <SelectItem value="advanced">Advanced</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

function CourseCard({ course }: { course: (typeof courses)[0] }) {
  return (
    <Card className="group hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
      <div className="relative overflow-hidden rounded-t-lg">
        <div className="aspect-video bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
          <BookOpen className="w-12 h-12 text-primary" />
        </div>
        <div className="absolute top-2 right-2">
          <Badge variant="secondary" className="bg-white/90 backdrop-blur-sm">
            ${course.price}
          </Badge>
        </div>
      </div>

      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <Badge variant="outline" className="mb-2">
            {course.category.name}
          </Badge>
          <div className="flex items-center text-sm text-muted-foreground">
            <Star className="w-3 h-3 fill-yellow-400 text-yellow-400 mr-1" />
            {course.rating}
          </div>
        </div>
        <CardTitle className="line-clamp-2 group-hover:text-primary transition-colors">{course.title}</CardTitle>
        <CardDescription className="line-clamp-2">{course.description}</CardDescription>
      </CardHeader>

      <CardContent className="pt-0">
        <div className="flex items-center justify-between text-sm text-muted-foreground mb-4">
          <span className="flex items-center">
            <Clock className="w-4 h-4 mr-1" />
            {course.duration}
          </span>
          <span className="flex items-center">
            <Users className="w-4 h-4 mr-1" />
            {course.enrollments[0]?.count || 0}
          </span>
        </div>

        <div className="flex items-center justify-between">
          <div className="text-sm text-muted-foreground">by {course.instructor.full_name}</div>
          <Button asChild size="sm">
            <Link href={`/courses/${course.id}`}>View Course</Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

function CourseGrid() {
  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {courses.map((course) => (
        <CourseCard key={course.id} course={course} />
      ))}
    </div>
  )
}

export default function CoursesPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Browse Courses</h1>
        <p className="text-gray-600">Discover new skills and advance your career</p>
      </div>

      <Suspense fallback={<LoadingSpinner text="Loading filters..." />}>
        <CourseFilters />
      </Suspense>

      <Suspense fallback={<LoadingSpinner text="Loading courses..." />}>
        <CourseGrid />
      </Suspense>

      {courses.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500">No courses available at the moment.</p>
        </div>
      )}
    </div>
  )
}
