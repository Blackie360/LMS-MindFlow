export const APP_CONFIG = {
  name: "LMS Platform",
  description: "A comprehensive learning management system for students and educators",
  version: "1.0.0",
}

export const USER_ROLES = {
  ADMIN: "admin",
  STUDENT: "student",
} as const

export const COURSE_STATUS = {
  DRAFT: "draft",
  PUBLISHED: "published",
} as const

export const LESSON_TYPES = {
  VIDEO: "video",
  TEXT: "text",
  PDF: "pdf",
} as const

export const ROUTES = {
  HOME: "/",
  AUTH: "/auth",
  DASHBOARD: "/dashboard",
  COURSES: "/courses",
  MY_COURSES: "/my-courses",
  ADMIN: {
    COURSES: "/admin/courses",
    STUDENTS: "/admin/students",
    ANALYTICS: "/admin/analytics",
  },
} as const

export const VALIDATION = {
  PASSWORD_MIN_LENGTH: 6,
  DESCRIPTION_MIN_LENGTH: 50,
  COURSE_TITLE_MAX_LENGTH: 100,
  LESSON_TITLE_MAX_LENGTH: 100,
} as const
