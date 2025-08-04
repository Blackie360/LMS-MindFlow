"use client"

import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Search, Mail, Calendar, BookOpen, Trophy } from "lucide-react"
import type { User, Enrollment } from "@prisma/client"

interface StudentWithEnrollments extends User {
  enrollments: (Enrollment & {
    course: { title: string }
  })[]
}

interface StudentsTableProps {
  students: StudentWithEnrollments[]
}

export function StudentsTable({ students }: StudentsTableProps) {
  const [searchTerm, setSearchTerm] = useState("")

  const filteredStudents = students.filter(
    (student) =>
      student.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.email.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  return (
    <div className="space-y-6">
      {/* Search and Stats */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            placeholder="Search students..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        <div className="flex items-center space-x-4 text-sm text-gray-600">
          <span>Total Students: {students.length}</span>
          <span>Active: {students.filter((s) => s.enrollments.length > 0).length}</span>
        </div>
      </div>

      {/* Students Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredStudents.map((student) => {
          const totalEnrollments = student.enrollments.length
          const completedCourses = student.enrollments.filter((e) => e.completed_at).length

          return (
            <Card key={student.id} className="hover:shadow-lg transition-shadow">
              <CardHeader className="pb-4">
                <div className="flex items-center space-x-3">
                  <Avatar>
                    <AvatarImage src={student.avatar_url || "/placeholder.svg"} />
                    <AvatarFallback>
                      {student.full_name?.charAt(0)?.toUpperCase() || student.email.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <CardTitle className="text-lg truncate">{student.full_name || "No name"}</CardTitle>
                    <div className="flex items-center text-sm text-gray-500">
                      <Mail className="w-3 h-3 mr-1" />
                      <span className="truncate">{student.email}</span>
                    </div>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                {/* Stats */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-3 bg-blue-50 rounded-lg">
                    <div className="flex items-center justify-center mb-1">
                      <BookOpen className="w-4 h-4 text-blue-600" />
                    </div>
                    <div className="text-lg font-semibold text-blue-600">{totalEnrollments}</div>
                    <div className="text-xs text-blue-600">Enrolled</div>
                  </div>

                  <div className="text-center p-3 bg-green-50 rounded-lg">
                    <div className="flex items-center justify-center mb-1">
                      <Trophy className="w-4 h-4 text-green-600" />
                    </div>
                    <div className="text-lg font-semibold text-green-600">{completedCourses}</div>
                    <div className="text-xs text-green-600">Completed</div>
                  </div>
                </div>

                {/* Recent Enrollments */}
                {student.enrollments.length > 0 ? (
                  <div className="space-y-2">
                    <h4 className="text-sm font-medium text-gray-700">Recent Courses</h4>
                    <div className="space-y-1">
                      {student.enrollments.slice(0, 2).map((enrollment) => (
                        <div key={enrollment.id} className="flex items-center justify-between text-xs">
                          <span className="truncate flex-1 mr-2">{enrollment.course.title}</span>
                          <Badge variant={enrollment.completed_at ? "default" : "secondary"} className="text-xs">
                            {enrollment.completed_at ? "Completed" : "In Progress"}
                          </Badge>
                        </div>
                      ))}
                      {student.enrollments.length > 2 && (
                        <div className="text-xs text-gray-500">+{student.enrollments.length - 2} more courses</div>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-4 text-gray-500">
                    <BookOpen className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                    <p className="text-sm">No enrollments yet</p>
                  </div>
                )}

                {/* Join Date */}
                <div className="flex items-center text-xs text-gray-500 pt-2 border-t">
                  <Calendar className="w-3 h-3 mr-1" />
                  <span>Joined {formatDate(student.created_at)}</span>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {filteredStudents.length === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <Search className="w-12 h-12 mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No students found</h3>
            <p className="text-gray-500">
              {searchTerm ? "Try adjusting your search terms" : "No students have signed up yet"}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
