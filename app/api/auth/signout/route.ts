import { type NextRequest, NextResponse } from "next/server"
import { deleteSession } from "@/lib/auth"

export async function POST(request: NextRequest) {
  try {
    const sessionToken = request.cookies.get("session-token")?.value

    if (sessionToken) {
      await deleteSession(sessionToken)
    }

    const response = NextResponse.json({ success: true })
    response.cookies.delete("session-token")

    return response
  } catch (error) {
    console.error("Sign out error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
