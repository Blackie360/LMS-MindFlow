import { Pool } from "pg"

const pool = new Pool({
  connectionString: process.env.NEON_DATABASE_URL,
  ssl: process.env.NODE_ENV === "production" ? { rejectUnauthorized: false } : false,
})

export { pool }

// Database types based on your schema
export interface User {
  id: string
  name: string | null
  email: string
  emailVerified: boolean | null
  image: string | null
  role: string | null
  createdAt: Date
  updatedAt: Date
}

export interface Course {
  id: string
  title: string
  description: string | null
  cover_image: string | null
  category_id: string | null
  instructor_id: string
  status: string
  price: number
  created_at: Date
  updated_at: Date
}

export interface Category {
  id: string
  name: string
  description: string | null
  created_at: Date
}

export interface Lesson {
  id: string
  course_id: string
  title: string
  description: string | null
  content: string | null
  video_url: string | null
  lesson_type: string
  order_index: number
  duration: number | null
  created_at: Date
  updated_at: Date
}

export interface Enrollment {
  id: string
  student_id: string
  course_id: string
  enrolled_at: Date
  completed_at: Date | null
}

export interface LessonProgress {
  id: string
  student_id: string
  lesson_id: string
  completed: boolean
  completed_at: Date | null
  created_at: Date
}

export interface Session {
  id: string
  token: string
  userId: string
  expiresAt: Date
  createdAt: Date
  updatedAt: Date
  ipAddress: string | null
  userAgent: string | null
}
