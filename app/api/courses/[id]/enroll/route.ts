import { type NextRequest, NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/session"
import { pool } from "@/lib/db"

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await getCurrentUser()
    if (!user || user.role !== "STUDENT") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const courseId = params.id

    // Check if already enrolled
    const existingEnrollment = await pool.query("SELECT id FROM enrollments WHERE student_id = $1 AND course_id = $2", [
      user.id,
      courseId,
    ])

    if (existingEnrollment.rows.length > 0) {
      return NextResponse.json({ error: "Already enrolled in this course" }, { status: 409 })
    }

    // Create enrollment
    const result = await pool.query(
      `INSERT INTO enrollments (id, student_id, course_id, enrolled_at)
       VALUES (gen_random_uuid(), $1, $2, NOW())
       RETURNING *`,
      [user.id, courseId],
    )

    return NextResponse.json(result.rows[0])
  } catch (error) {
    console.error("Error enrolling in course:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
