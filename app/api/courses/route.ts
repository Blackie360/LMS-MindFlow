import { type NextRequest, NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/session"
import { pool } from "@/lib/db"

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const category = searchParams.get("category")
    const search = searchParams.get("search")

    let query = `
      SELECT 
        c.*,
        cat.name as category_name,
        u.name as instructor_name,
        COUNT(e.id) as enrollment_count
      FROM courses c
      LEFT JOIN categories cat ON c.category_id = cat.id
      LEFT JOIN "user" u ON c.instructor_id = u.id
      LEFT JOIN enrollments e ON c.id = e.course_id
      WHERE c.status = 'published'
    `

    const params: any[] = []
    let paramIndex = 1

    if (category && category !== "all") {
      query += ` AND c.category_id = $${paramIndex}`
      params.push(category)
      paramIndex++
    }

    if (search) {
      query += ` AND (c.title ILIKE $${paramIndex} OR c.description ILIKE $${paramIndex})`
      params.push(`%${search}%`)
      paramIndex++
    }

    query += ` GROUP BY c.id, cat.name, u.name ORDER BY c.created_at DESC`

    const result = await pool.query(query, params)

    return NextResponse.json(result.rows)
  } catch (error) {
    console.error("Error fetching courses:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user || user.role !== "INSTRUCTOR") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { title, description, category_id, price = 0 } = await request.json()

    if (!title) {
      return NextResponse.json({ error: "Title is required" }, { status: 400 })
    }

    const result = await pool.query(
      `INSERT INTO courses (id, title, description, category_id, instructor_id, status, price, created_at, updated_at)
       VALUES (gen_random_uuid(), $1, $2, $3, $4, 'draft', $5, NOW(), NOW())
       RETURNING *`,
      [title, description, category_id, user.id, price],
    )

    return NextResponse.json(result.rows[0])
  } catch (error) {
    console.error("Error creating course:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
