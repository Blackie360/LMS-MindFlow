"use client";

import { useState, useEffect } from "react";
import { Download, Filter, Search, Eye, TrendingUp, TrendingDown } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Grade {
  id: string;
  studentId: string;
  courseId: string;
  quizId?: string;
  assignmentId?: string;
  score: number;
  maxScore: number;
  percentage: number;
  letterGrade?: string;
  category: string;
  createdAt: string;
  student: {
    id: string;
    name: string;
    email: string;
  };
  course: {
    id: string;
    title: string;
  };
  quiz?: {
    id: string;
    title: string;
  };
  assignment?: {
    id: string;
    title: string;
  };
}

interface GradeBookProps {
  courseId?: string;
}

export function GradeBook({ courseId }: GradeBookProps) {
  const [grades, setGrades] = useState<Grade[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [sortBy, setSortBy] = useState("student");

  useEffect(() => {
    fetchGrades();
  }, [courseId]);

  const fetchGrades = async () => {
    try {
      setIsLoading(true);
      const url = courseId
        ? `/api/grades?${new URLSearchParams({ courseId })}`
        : '/api/grades';
      
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error("Failed to fetch grades");
      }

      const data = await response.json();
      setGrades(data.data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch grades");
    } finally {
      setIsLoading(false);
    }
  };

  const filteredGrades = grades.filter(grade => {
    const matchesSearch = grade.student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         grade.student.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         grade.course.title.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = categoryFilter === "all" || grade.category === categoryFilter;
    
    return matchesSearch && matchesCategory;
  });

  const sortedGrades = [...filteredGrades].sort((a, b) => {
    switch (sortBy) {
      case "student":
        return a.student.name.localeCompare(b.student.name);
      case "course":
        return a.course.title.localeCompare(b.course.title);
      case "score":
        return b.percentage - a.percentage;
      case "date":
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      default:
        return 0;
    }
  });

  const getLetterGradeColor = (letterGrade?: string) => {
    if (!letterGrade) return "bg-gray-100 text-gray-800";
    
    switch (letterGrade) {
      case "A":
        return "bg-green-100 text-green-800";
      case "B":
        return "bg-blue-100 text-blue-800";
      case "C":
        return "bg-yellow-100 text-yellow-800";
      case "D":
        return "bg-orange-100 text-orange-800";
      case "F":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getPercentageColor = (percentage: number) => {
    if (percentage >= 90) return "text-green-600";
    if (percentage >= 80) return "text-blue-600";
    if (percentage >= 70) return "text-yellow-600";
    if (percentage >= 60) return "text-orange-600";
    return "text-red-600";
  };

  const exportGrades = () => {
    const csvContent = [
      ["Student", "Course", "Assessment", "Score", "Max Score", "Percentage", "Letter Grade", "Date"],
      ...sortedGrades.map(grade => [
        grade.student.name,
        grade.course.title,
        grade.quiz?.title || grade.assignment?.title || "N/A",
        grade.score.toString(),
        grade.maxScore.toString(),
        grade.percentage.toFixed(1),
        grade.letterGrade || "N/A",
        new Date(grade.createdAt).toLocaleDateString()
      ])
    ].map(row => row.join(",")).join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `grades-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const getStats = () => {
    if (sortedGrades.length === 0) return null;

    const totalGrades = sortedGrades.length;
    const averagePercentage = sortedGrades.reduce((sum, grade) => sum + grade.percentage, 0) / totalGrades;
    const passingGrades = sortedGrades.filter(grade => grade.percentage >= 70).length;
    const failingGrades = sortedGrades.filter(grade => grade.percentage < 70).length;

    return {
      totalGrades,
      averagePercentage: Math.round(averagePercentage * 10) / 10,
      passingGrades,
      failingGrades,
      passRate: Math.round((passingGrades / totalGrades) * 100)
    };
  };

  const stats = getStats();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading grades...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Grade Book</h2>
          <p className="text-gray-600">
            View and manage student grades and performance
          </p>
        </div>
        <Button onClick={exportGrades} className="bg-brand hover:bg-brand/90">
          <Download className="h-4 w-4 mr-2" />
          Export Grades
        </Button>
      </div>

      {error && (
        <div className="text-sm text-red-600 bg-red-50 p-3 rounded-md">
          {error}
        </div>
      )}

      {/* Statistics */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{stats.totalGrades}</div>
                <div className="text-sm text-gray-600">Total Grades</div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{stats.averagePercentage}%</div>
                <div className="text-sm text-gray-600">Average Score</div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{stats.passingGrades}</div>
                <div className="text-sm text-gray-600">Passing Grades</div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{stats.passRate}%</div>
                <div className="text-sm text-gray-600">Pass Rate</div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search students, courses, or assessments..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  <SelectItem value="quiz">Quizzes</SelectItem>
                  <SelectItem value="assignment">Assignments</SelectItem>
                  <SelectItem value="exam">Exams</SelectItem>
                </SelectContent>
              </Select>
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="student">Student Name</SelectItem>
                  <SelectItem value="course">Course</SelectItem>
                  <SelectItem value="score">Score</SelectItem>
                  <SelectItem value="date">Date</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Grades Table */}
      <Card>
        <CardHeader>
          <CardTitle>Student Grades</CardTitle>
          <CardDescription>
            {sortedGrades.length} grade{sortedGrades.length !== 1 ? 's' : ''} found
          </CardDescription>
        </CardHeader>
        <CardContent>
          {sortedGrades.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No grades found matching your criteria
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Student</TableHead>
                    <TableHead>Course</TableHead>
                    <TableHead>Assessment</TableHead>
                    <TableHead>Score</TableHead>
                    <TableHead>Percentage</TableHead>
                    <TableHead>Letter Grade</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sortedGrades.map((grade) => (
                    <TableRow key={grade.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{grade.student.name}</div>
                          <div className="text-sm text-gray-500">{grade.student.email}</div>
                        </div>
                      </TableCell>
                      <TableCell>{grade.course.title}</TableCell>
                      <TableCell>
                        {grade.quiz?.title || grade.assignment?.title || "N/A"}
                        <div className="text-sm text-gray-500 capitalize">{grade.category}</div>
                      </TableCell>
                      <TableCell>
                        <div className="font-medium">
                          {grade.score}/{grade.maxScore}
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className={`font-medium ${getPercentageColor(grade.percentage)}`}>
                          {grade.percentage.toFixed(1)}%
                        </span>
                      </TableCell>
                      <TableCell>
                        {grade.letterGrade && (
                          <Badge className={getLetterGradeColor(grade.letterGrade)}>
                            {grade.letterGrade}
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        {new Date(grade.createdAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <Button variant="ghost" size="sm">
                          <Eye className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
