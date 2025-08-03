export const APP_CONFIG = {
  name: "MindFlow",
  description: "A modern learning management system",
  version: "1.0.0",
}

export const ROLES = {
  STUDENT: "STUDENT",
  INSTRUCTOR: "INSTRUCTOR",
} as const

export const ROUTES = {
  HOME: "/",
  AUTH: "/auth",
  DASHBOARD: "/dashboard",
  COURSES: "/courses",
  MY_COURSES: "/my-courses",
  INSTRUCTOR: {
    DASHBOARD: "/instructor",
    COURSES: "/instructor/courses",
    STUDENTS: "/instructor/students",
  },
} as const

export const VALIDATION = {
  PASSWORD_MIN_LENGTH: 8,
  COURSE_TITLE_MAX_LENGTH: 100,
  MODULE_TITLE_MAX_LENGTH: 100,
  LESSON_TITLE_MAX_LENGTH: 100,
} as const
