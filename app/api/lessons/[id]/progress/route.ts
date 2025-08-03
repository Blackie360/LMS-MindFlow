import { type NextRequest, NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/session"
import { pool } from "@/lib/db"

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await getCurrentUser()
    if (!user || user.role !== "STUDENT") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const lessonId = params.id
    const { completed } = await request.json()

    // Upsert lesson progress
    const result = await pool.query(
      `INSERT INTO lesson_progress (id, student_id, lesson_id, completed, completed_at, created_at)
       VALUES (gen_random_uuid(), $1, $2, $3, $4, NOW())
       ON CONFLICT (student_id, lesson_id) 
       DO UPDATE SET completed = $3, completed_at = $4
       RETURNING *`,
      [user.id, lessonId, completed, completed ? new Date() : null],
    )

    return NextResponse.json(result.rows[0])
  } catch (error) {
    console.error("Error updating lesson progress:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
