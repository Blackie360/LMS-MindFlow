import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  // Skip middleware for API routes, static files, and auth pages
  if (
    request.nextUrl.pathname.startsWith('/api/') ||
    request.nextUrl.pathname.startsWith('/_next/') ||
    request.nextUrl.pathname.startsWith('/auth') ||
    request.nextUrl.pathname === '/'
  ) {
    return NextResponse.next()
  }

  try {
    // Check for session cookie (simple approach for middleware)
    const sessionCookie = request.cookies.get('better-auth.session_token')
    
    // Protected routes that require authentication
    const protectedRoutes = ['/dashboard', '/courses', '/my-courses', '/admin', '/instructor', '/student']
    const isProtectedRoute = protectedRoutes.some(route => 
      request.nextUrl.pathname.startsWith(route)
    )

    // If no session cookie and trying to access protected route, redirect to auth
    if (!sessionCookie && isProtectedRoute) {
      return NextResponse.redirect(new URL('/auth', request.url))
    }

    // If has session cookie and trying to access auth page, redirect to dashboard
    if (sessionCookie && request.nextUrl.pathname.startsWith('/auth')) {
      return NextResponse.redirect(new URL('/dashboard', request.url))
    }

    // Role-based access control (basic implementation)
    // Note: For full role checking, we'd need to decode the session token
    // This is a simplified version that will be enhanced by the dashboard router
    if (request.nextUrl.pathname.startsWith('/admin') && sessionCookie) {
      // Admin routes - will be validated by the dashboard router
      return NextResponse.next()
    }

    if (request.nextUrl.pathname.startsWith('/student') && sessionCookie) {
      // Student routes - will be validated by the dashboard router
      return NextResponse.next()
    }

    return NextResponse.next()
  } catch (error) {
    console.error('Middleware error:', error)
    
    // Log additional context for debugging
    if (error instanceof Error) {
      console.error('Middleware error details:', {
        message: error.message,
        stack: error.stack,
        path: request.nextUrl.pathname,
        timestamp: new Date().toISOString(),
      })
    }
    
    // On error, allow the request to continue to avoid breaking the app
    return NextResponse.next()
  }
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}