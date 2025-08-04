import { NextRequest, NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/session"
import { getAdminDashboardData } from "@/app/(dashboard)/admin/lib/admin-data"

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Ensure only instructors can access this endpoint
    if (user.role !== "INSTRUCTOR") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const searchParams = request.nextUrl.searchParams
    const userId = searchParams.get('userId')

    // Ensure user can only access their own data
    if (!userId || userId !== user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const dashboardData = await getAdminDashboardData(userId)
    
    return NextResponse.json(dashboardData)
  } catch (error) {
    console.error("Admin dashboard API error:", error)
    
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}