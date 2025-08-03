import { type NextRequest, NextResponse } from "next/server"
import { getUserByEmail, getPasswordByUserId, verifyPassword, createSession } from "@/lib/auth"

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()

    if (!email || !password) {
      return NextResponse.json({ error: "Email and password are required" }, { status: 400 })
    }

    // Find user by email
    const user = await getUserByEmail(email)
    if (!user) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 })
    }

    // Get password hash
    const hashedPassword = await getPasswordByUserId(user.id)
    if (!hashedPassword) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 })
    }

    // Verify password
    const isValidPassword = await verifyPassword(password, hashedPassword)
    if (!isValidPassword) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 })
    }

    // Create session
    const session = await createSession(user.id, request.ip, request.headers.get("user-agent") || undefined)

    // Set session cookie
    const response = NextResponse.json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    })

    response.cookies.set("session-token", session.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60, // 7 days
      path: "/",
    })

    return response
  } catch (error) {
    console.error("Sign in error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
