import { NextRequest, NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/session"
import { getStudentDashboardData } from "@/app/(dashboard)/student/lib/student-data"

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Ensure only students can access this endpoint
    if (user.role !== "STUDENT") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const searchParams = request.nextUrl.searchParams
    const userId = searchParams.get('userId')

    // Ensure user can only access their own data
    if (!userId || userId !== user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const dashboardData = await getStudentDashboardData(userId)
    
    return NextResponse.json(dashboardData)
  } catch (error) {
    console.error("Student dashboard API error:", error)
    
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}