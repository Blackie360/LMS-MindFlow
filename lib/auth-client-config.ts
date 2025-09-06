/**
 * Dynamic auth client configuration that works with any domain
 * This solves CORS issues between Vercel preview and production domains
 */

function getBaseURL(): string {
  // In browser, use current origin
  if (typeof window !== "undefined") {
    return window.location.origin;
  }
  
  // On server, use environment variable
  return process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
}

export const authConfig = {
  baseURL: getBaseURL(),
};
