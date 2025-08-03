import { auth } from "@/lib/auth-server"

// Force Node.js runtime for Better Auth compatibility
export const runtime = 'nodejs'

export const GET = auth.handler
export const POST = auth.handler