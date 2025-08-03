import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

// Create a singleton instance to avoid multiple clients
let supabaseInstance: ReturnType<typeof createClient> | null = null

export const supabase = (() => {
  if (!supabaseInstance) {
    supabaseInstance = createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    })
  }
  return supabaseInstance
})()

// Database Types
export interface Profile {
  id: string
  email: string
  full_name?: string
  avatar_url?: string
  role: "admin" | "student"
  created_at: string
  updated_at: string
}

export interface Course {
  id: string
  title: string
  description?: string
  cover_image?: string
  category_id?: string
  instructor_id: string
  status: "draft" | "published"
  price: number
  created_at: string
  updated_at: string
  category?: Category
  instructor?: Profile
  lessons?: Lesson[]
  _count?: {
    lessons: number
    enrollments: number
  }
}

export interface Category {
  id: string
  name: string
  description?: string
  created_at: string
}

export interface Lesson {
  id: string
  course_id: string
  title: string
  description?: string
  content?: string
  video_url?: string
  lesson_type: "video" | "text" | "pdf"
  order_index: number
  duration?: number
  created_at: string
  updated_at: string
}

export interface Enrollment {
  id: string
  student_id: string
  course_id: string
  enrolled_at: string
  completed_at?: string
  course?: Course
  student?: Profile
}

export interface LessonProgress {
  id: string
  student_id: string
  lesson_id: string
  completed: boolean
  completed_at?: string
  lesson?: Lesson
}
