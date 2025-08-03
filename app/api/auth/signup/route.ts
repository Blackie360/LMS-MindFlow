import { type NextRequest, NextResponse } from "next/server"
import { getUserByEmail, createUser, hashPassword, createSession } from "@/lib/auth"

export async function POST(request: NextRequest) {
  try {
    const { email, password, name, role = "STUDENT" } = await request.json()

    if (!email || !password || !name) {
      return NextResponse.json({ error: "Email, password, and name are required" }, { status: 400 })
    }

    if (password.length < 8) {
      return NextResponse.json({ error: "Password must be at least 8 characters long" }, { status: 400 })
    }

    // Check if user already exists
    const existingUser = await getUserByEmail(email)
    if (existingUser) {
      return NextResponse.json({ error: "User with this email already exists" }, { status: 409 })
    }

    // Hash password
    const hashedPassword = await hashPassword(password)

    // Create user
    const user = await createUser(email, name, hashedPassword, role)

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
    console.error("Sign up error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
