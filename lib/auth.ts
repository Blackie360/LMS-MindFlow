// Re-export auth client functions for convenience
export { signIn, signUp, signOut, useSession } from "./auth-client"

// Server-side auth functions
export { auth } from "./auth-server"

// Session utilities
export { getCurrentUser, getCurrentSession, requireAuth, requireRole } from "./session"
