import { cookies } from "next/headers"
import { getSessionByToken, getUserById } from "./auth"
import type { User } from "./db"

const SESSION_COOKIE_NAME = "session-token"

export async function getCurrentUser(): Promise<User | null> {
  try {
    const cookieStore = cookies()
    const sessionToken = cookieStore.get(SESSION_COOKIE_NAME)?.value

    if (!sessionToken) {
      return null
    }

    const session = await getSessionByToken(sessionToken)
    if (!session) {
      return null
    }

    const user = await getUserById(session.userId)
    return user
  } catch (error) {
    console.error("Error getting current user:", error)
    return null
  }
}

export function setSessionCookie(token: string) {
  const cookieStore = cookies()
  cookieStore.set(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 7 * 24 * 60 * 60, // 7 days
    path: "/",
  })
}

export function clearSessionCookie() {
  const cookieStore = cookies()
  cookieStore.delete(SESSION_COOKIE_NAME)
}
