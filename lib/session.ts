import { auth } from "./auth-server"
import { headers } from "next/headers"
import { PrismaClient } from "@prisma/client"
import { ROLES } from "./constants"

const prisma = new PrismaClient()

export async function getCurrentUser() {
  try {
    const session = await auth.api.getSession({
      headers: headers(),
    })
    
    if (!session?.user) {
      return null
    }

    // Fetch complete user data from database including role
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        image: true,
        createdAt: true,
        updatedAt: true,
        emailVerified: true,
      }
    })
    
    return user
  } catch (error) {
    console.error("Error getting current user:", error)
    
    // Log additional context for debugging
    if (error instanceof Error) {
      console.error("Session error details:", {
        message: error.message,
        stack: error.stack,
        timestamp: new Date().toISOString(),
      })
    }
    
    return null
  }
}

export async function getCurrentSession() {
  try {
    const session = await auth.api.getSession({
      headers: headers(),
    })
    
    return session || null
  } catch (error) {
    console.error("Error getting current session:", error)
    
    // Log additional context for debugging
    if (error instanceof Error) {
      console.error("Session error details:", {
        message: error.message,
        stack: error.stack,
        timestamp: new Date().toISOString(),
      })
    }
    
    return null
  }
}

export async function requireAuth() {
  const user = await getCurrentUser()
  if (!user) {
    throw new Error("Authentication required")
  }
  return user
}

export async function requireRole(role: keyof typeof ROLES) {
  const user = await requireAuth()
  if (user.role !== role) {
    throw new Error(`Role ${role} required`)
  }
  return user
}

export async function requireAnyRole(roles: Array<keyof typeof ROLES>) {
  const user = await requireAuth()
  if (!roles.includes(user.role as keyof typeof ROLES)) {
    throw new Error(`One of the following roles required: ${roles.join(", ")}`)
  }
  return user
}

export async function requireInstructorOrAdmin() {
  return requireAnyRole([ROLES.INSTRUCTOR, ROLES.ADMIN])
}

export async function requireAdmin() {
  return requireRole(ROLES.ADMIN)
}

export async function requireInstructor() {
  return requireRole(ROLES.INSTRUCTOR)
}

export async function requireStudent() {
  return requireRole(ROLES.STUDENT)
}
