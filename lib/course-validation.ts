import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

interface Course {
  id: string
  title: string
  description?: string
  thumbnail?: string
  createdBy: string
  createdAt: Date
  updatedAt: Date
}

export interface CourseValidationResult {
  isValid: boolean
  errors: string[]
  warnings: string[]
  score: number
}

export async function validateCourseForPublishing(course: Course): Promise<CourseValidationResult> {
  const result: CourseValidationResult = {
    isValid: true,
    errors: [],
    warnings: [],
    score: 0,
  }

  let totalChecks = 0
  let passedChecks = 0

  // Required validations
  const requiredChecks = [
    {
      check: () => !!course.title?.trim(),
      error: "Course title is required",
      weight: 2,
    },
    {
      check: () => !!course.description?.trim(),
      error: "Course description is required",
      weight: 2,
    },
    {
      check: () => course.description && course.description.length >= 50,
      error: "Course description must be at least 50 characters",
      weight: 1,
    },
  ]

  // Check lessons
  try {
    const lessons = await prisma.lesson.findMany({
      where: { moduleId: course.id },
      orderBy: { order: 'asc' }
    })

    requiredChecks.push(
      {
        check: () => lessons && lessons.length > 0,
        error: "Course must have at least one lesson",
        weight: 3,
      },
      {
        check: () => {
          if (!lessons) return false
          return lessons.every(
            (lesson) =>
              lesson.title?.trim() &&
              lesson.content?.trim() &&
              (!lesson.videoUrl || lesson.videoUrl?.trim()),
          )
        },
        error: "All lessons must have complete content",
        weight: 2,
      },
    )

    // Optional but recommended checks
    const recommendedChecks = [
      {
        check: () => !!course.thumbnail?.trim(),
        warning: "Adding a thumbnail makes your course more appealing",
        weight: 1,
      },
      {
        check: () => lessons && lessons.length >= 3,
        warning: "Courses with 3+ lessons have better student engagement",
        weight: 1,
      },
    ]

    // Process required checks
    for (const { check, error, weight } of requiredChecks) {
      totalChecks += weight
      if (check()) {
        passedChecks += weight
      } else {
        result.errors.push(error)
        result.isValid = false
      }
    }

    // Process recommended checks
    for (const { check, warning, weight } of recommendedChecks) {
      totalChecks += weight
      if (check()) {
        passedChecks += weight
      } else {
        result.warnings.push(warning)
      }
    }
  } catch (error) {
    console.error("Error validating course lessons:", error)
    result.errors.push("Unable to validate course content. Please try again.")
    result.isValid = false
  }

  result.score = totalChecks > 0 ? Math.round((passedChecks / totalChecks) * 100) : 0

  return result
}

export function getPublishingRecommendations(course: Course): string[] {
  const recommendations: string[] = []

  if (!course.thumbnail) {
    recommendations.push("Add an eye-catching thumbnail to increase enrollment")
  }

  if (course.description && course.description.length < 100) {
    recommendations.push("Expand your course description to better explain the value")
  }

  return recommendations
}
