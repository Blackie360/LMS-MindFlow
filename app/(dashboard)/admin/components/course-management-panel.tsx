"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { 
  Plus, 
  Users, 
  TrendingUp, 
  Calendar, 
  MoreHorizontal, 
  Edit, 
  Trash2, 
  BarChart3, 
  Eye,
  Archive,
  BookOpen,
  Clock
} from "lucide-react"
import Link from "next/link"
import type { CourseManagementData, AdminCourse } from "../lib/admin-data"

interface CourseManagementPanelProps {
  courseData: CourseManagementData
}

export function CourseManagementPanel({ courseData }: CourseManagementPanelProps) {
  const [activeTab, setActiveTab] = useState("all")

  const filterCoursesByStatus = (status?: string) => {
    if (!status || status === "all") return courseData.myCourses
    return courseData.myCourses.filter(course => course.status === status.toUpperCase())
  }

  const handleDeleteCourse = async (courseId: string) => {
    if (confirm('Are you sure you want to delete this course? This action cannot be undone.')) {
      try {
        const response = await fetch(`/api/courses/${courseId}`, {
          method: 'DELETE',
        })
        if (response.ok) {
          window.location.reload()
        } else {
          alert('Failed to delete course')
        }
      } catch (error) {
        console.error('Error deleting course:', error)
        alert('Failed to delete course')
      }
    }
  }

  const handleStatusChange = async (courseId: string, newStatus: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED') => {
    try {
      const response = await fetch(`/api/courses/${courseId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      })
      if (response.ok) {
        window.location.reload()
      } else {
        alert(`Failed to ${newStatus.toLowerCase()} course`)
      }
    } catch (error) {
      console.error('Error updating course status:', error)
      alert(`Failed to ${newStatus.toLowerCase()} course`)
    }
  }

  return (
    <div className="space-y-6">
      {/* Quick Actions & Stats */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            Course Management
            <div className="flex gap-2">
              <Button asChild size="sm" variant="outline">
                <Link href="/courses">
                  <BookOpen className="h-4 w-4 mr-2" />
                  View All
                </Link>
              </Button>
              <Button asChild size="sm">
                <Link href="/courses/create">
                  <Plus className="h-4 w-4 mr-2" />
                  Create Course
                </Link>
              </Button>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
            <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg border-0">
              <div className="flex items-center justify-center mb-2">
                <BookOpen className="h-5 w-5 text-blue-600" />
              </div>
              <div className="text-2xl font-bold text-blue-600">
                {courseData.myCourses.length}
              </div>
              <div className="text-sm text-blue-600/70">Total Courses</div>
            </div>
            <div className="text-center p-4 bg-gradient-to-br from-green-50 to-green-100 rounded-lg border-0">
              <div className="flex items-center justify-center mb-2">
                <Users className="h-5 w-5 text-green-600" />
              </div>
              <div className="text-2xl font-bold text-green-600">
                {courseData.totalStudentsEnrolled}
              </div>
              <div className="text-sm text-green-600/70">Total Students</div>
            </div>   
         <div className="text-center p-4 bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg border-0">
              <div className="flex items-center justify-center mb-2">
                <Clock className="h-5 w-5 text-orange-600" />
              </div>
              <div className="text-2xl font-bold text-orange-600">
                {courseData.draftCourses}
              </div>
              <div className="text-sm text-orange-600/70">Draft Courses</div>
            </div>
            <div className="text-center p-4 bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-lg border-0">
              <div className="flex items-center justify-center mb-2">
                <BookOpen className="h-5 w-5 text-emerald-600" />
              </div>
              <div className="text-2xl font-bold text-emerald-600">
                {courseData.publishedCourses}
              </div>
              <div className="text-sm text-emerald-600/70">Published</div>
            </div>
            <div className="text-center p-4 bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg border-0">
              <div className="flex items-center justify-center mb-2">
                <TrendingUp className="h-5 w-5 text-purple-600" />
              </div>
              <div className="text-2xl font-bold text-purple-600">
                {courseData.myCourses.length > 0 
                  ? Math.round(courseData.myCourses.reduce((sum, course) => sum + course.completionRate, 0) / courseData.myCourses.length)
                  : 0}%
              </div>
              <div className="text-sm text-purple-600/70">Avg Completion</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Course Listing with Tabs */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            My Courses
            {courseData.myCourses.length > 0 && (
              <span className="text-sm font-normal text-muted-foreground">
                {courseData.myCourses.length} course{courseData.myCourses.length !== 1 ? 's' : ''}
              </span>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {courseData.myCourses.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <BookOpen className="h-8 w-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No courses yet
              </h3>
              <p className="text-muted-foreground mb-6 max-w-sm mx-auto">
                Get started by creating your first course. Share your knowledge and help students learn.
              </p>
              <Button asChild size="lg">
                <Link href="/courses/create">
                  <Plus className="h-4 w-4 mr-2" />
                  Create Your First Course
                </Link>
              </Button>
            </div>
          ) : (
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="all">
                  All ({courseData.myCourses.length})
                </TabsTrigger>
                <TabsTrigger value="published">
                  Published ({courseData.publishedCourses})
                </TabsTrigger>
                <TabsTrigger value="draft">
                  Draft ({courseData.draftCourses})
                </TabsTrigger>
                <TabsTrigger value="archived">
                  Archived ({courseData.archivedCourses})
                </TabsTrigger>
              </TabsList>
              
              {["all", "published", "draft", "archived"].map((tabValue) => (
                <TabsContent key={tabValue} value={tabValue} className="mt-6">
                  <CourseList 
                    courses={filterCoursesByStatus(tabValue)} 
                    onDelete={handleDeleteCourse}
                    onStatusChange={handleStatusChange}
                  />
                </TabsContent>
              ))}
            </Tabs>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

interface CourseListProps {
  courses: AdminCourse[]
  onDelete: (courseId: string) => void
  onStatusChange: (courseId: string, status: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED') => void
}

function CourseList({ courses, onDelete, onStatusChange }: CourseListProps) {
  if (courses.length === 0) {
    return (
      <div className="text-center py-8">
        <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
          <BookOpen className="h-6 w-6 text-gray-400" />
        </div>
        <p className="text-muted-foreground">No courses in this category</p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {courses.slice(0, 6).map((course) => (
        <div
          key={course.id}
          className="group flex flex-col sm:flex-row sm:items-center justify-between p-4 border rounded-lg hover:bg-gray-50 hover:shadow-sm transition-all duration-200"
        >
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-4">
              {/* Course Thumbnail/Avatar */}
              <div className="flex-shrink-0">
                {course.thumbnail ? (
                  <img
                    src={course.thumbnail}
                    alt={course.title}
                    className="w-12 h-12 rounded-lg object-cover"
                  />
                ) : (
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                    <span className="text-white font-semibold text-sm">
                      {course.title.charAt(0).toUpperCase()}
                    </span>
                  </div>
                )}
              </div>
              
              {/* Course Info */}
              <div className="flex-1 min-w-0">
                <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-1">
                  <h3 className="font-medium text-gray-900 truncate">
                    {course.title}
                  </h3>
                  <Badge 
                    variant={
                      course.status === 'PUBLISHED' ? 'default' : 
                      course.status === 'DRAFT' ? 'secondary' : 'outline'
                    }
                    className={`flex-shrink-0 w-fit ${
                      course.status === 'PUBLISHED' ? 'bg-green-100 text-green-800 hover:bg-green-100' :
                      course.status === 'DRAFT' ? 'bg-orange-100 text-orange-800 hover:bg-orange-100' :
                      'bg-gray-100 text-gray-800 hover:bg-gray-100'
                    }`}
                  >
                    {course.status.toLowerCase()}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground truncate">
                  {course.description || "No description provided"}
                </p>
              </div>
            </div>
          </div>   
       
          {/* Course Stats and Actions */}
          <div className="flex items-center justify-between sm:justify-end gap-4 mt-3 sm:mt-0">
            {/* Course Stats */}
            <div className="flex items-center gap-4 text-xs sm:text-sm text-muted-foreground">
              <span className="flex items-center">
                <Users className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                <span className="font-medium">{course.enrollmentCount}</span>
                <span className="hidden sm:inline ml-1">students</span>
              </span>
              <span className="flex items-center">
                <TrendingUp className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                <span className="font-medium">{course.completionRate}%</span>
                <span className="hidden sm:inline ml-1">completion</span>
              </span>
              <span className="flex items-center">
                <Calendar className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                <span className="font-medium">
                  {new Date(course.createdAt).toLocaleDateString('en-US', { 
                    month: 'short', 
                    day: 'numeric' 
                  })}
                </span>
              </span>
            </div>
            
            {/* Actions Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity"
                >
                  <MoreHorizontal className="h-4 w-4" />
                  <span className="sr-only">Open menu</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem asChild>
                  <Link href={`/courses/${course.id}`}>
                    <Eye className="h-4 w-4 mr-2" />
                    View Course
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href={`/courses/${course.id}/edit`}>
                    <Edit className="h-4 w-4 mr-2" />
                    Edit Course
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href={`/courses/${course.id}/analytics`}>
                    <BarChart3 className="h-4 w-4 mr-2" />
                    View Analytics
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                {course.status === 'DRAFT' && (
                  <DropdownMenuItem 
                    onClick={() => onStatusChange(course.id, 'PUBLISHED')}
                    className="text-green-600"
                  >
                    <BookOpen className="h-4 w-4 mr-2" />
                    Publish Course
                  </DropdownMenuItem>
                )}
                {course.status === 'PUBLISHED' && (
                  <DropdownMenuItem 
                    onClick={() => onStatusChange(course.id, 'DRAFT')}
                    className="text-orange-600"
                  >
                    <Clock className="h-4 w-4 mr-2" />
                    Move to Draft
                  </DropdownMenuItem>
                )}
                {course.status !== 'ARCHIVED' && (
                  <DropdownMenuItem 
                    onClick={() => onStatusChange(course.id, 'ARCHIVED')}
                    className="text-gray-600"
                  >
                    <Archive className="h-4 w-4 mr-2" />
                    Archive Course
                  </DropdownMenuItem>
                )}
                {course.status === 'ARCHIVED' && (
                  <DropdownMenuItem 
                    onClick={() => onStatusChange(course.id, 'PUBLISHED')}
                    className="text-green-600"
                  >
                    <BookOpen className="h-4 w-4 mr-2" />
                    Restore Course
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem 
                  onClick={() => onDelete(course.id)}
                  className="text-red-600"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete Course
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      ))}
      
      {courses.length > 6 && (
        <div className="text-center pt-4 border-t">
          <Button variant="outline" asChild>
            <Link href="/courses">
              View All Courses ({courses.length})
            </Link>
          </Button>
        </div>
      )}
    </div>
  )
}