import { pool } from "./db"
import bcrypt from "bcryptjs"
import { randomBytes } from "crypto"
import type { User, Session } from "./db"

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12)
}

export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword)
}

export function generateSessionToken(): string {
  return randomBytes(32).toString("hex")
}

export async function createSession(userId: string, ipAddress?: string, userAgent?: string): Promise<Session> {
  const token = generateSessionToken()
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days

  const result = await pool.query(
    `INSERT INTO session (id, token, "userId", "expiresAt", "createdAt", "updatedAt", "ipAddress", "userAgent")
     VALUES (gen_random_uuid(), $1, $2, $3, NOW(), NOW(), $4, $5)
     RETURNING *`,
    [token, userId, expiresAt, ipAddress, userAgent],
  )

  return result.rows[0]
}

export async function getSessionByToken(token: string): Promise<Session | null> {
  const result = await pool.query('SELECT * FROM session WHERE token = $1 AND "expiresAt" > NOW()', [token])

  return result.rows[0] || null
}

export async function deleteSession(token: string): Promise<void> {
  await pool.query("DELETE FROM session WHERE token = $1", [token])
}

export async function getUserById(id: string): Promise<User | null> {
  const result = await pool.query('SELECT * FROM "user" WHERE id = $1', [id])
  return result.rows[0] || null
}

export async function getUserByEmail(email: string): Promise<User | null> {
  const result = await pool.query('SELECT * FROM "user" WHERE email = $1', [email])
  return result.rows[0] || null
}

export async function createUser(email: string, name: string, hashedPassword: string, role = "STUDENT"): Promise<User> {
  const result = await pool.query(
    `INSERT INTO "user" (id, email, name, role, "emailVerified", "createdAt", "updatedAt")
     VALUES (gen_random_uuid(), $1, $2, $3, true, NOW(), NOW())
     RETURNING *`,
    [email, name, role],
  )

  // Store password in account table
  await pool.query(
    `INSERT INTO account (id, "userId", "providerId", "accountId", password, "createdAt", "updatedAt")
     VALUES (gen_random_uuid(), $1, 'credentials', $1, $2, NOW(), NOW())`,
    [result.rows[0].id, hashedPassword],
  )

  return result.rows[0]
}

export async function getPasswordByUserId(userId: string): Promise<string | null> {
  const result = await pool.query('SELECT password FROM account WHERE "userId" = $1 AND "providerId" = $2', [
    userId,
    "credentials",
  ])
  return result.rows[0]?.password || null
}
