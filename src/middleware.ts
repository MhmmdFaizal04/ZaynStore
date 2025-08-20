import { NextRequest, NextResponse } from 'next/server'

// Simple JWT decode function for middleware (Edge Runtime compatible)
function decodeJWT(token: string) {
  try {
    const parts = token.split('.')
    if (parts.length !== 3) return null
    
    const payload = parts[1]
    
    // Fix base64 padding
    let base64 = payload.replace(/-/g, '+').replace(/_/g, '/')
    while (base64.length % 4) {
      base64 += '='
    }
    
    const decoded = JSON.parse(atob(base64))
    
    // Check if token is expired
    if (decoded.exp && Date.now() >= decoded.exp * 1000) {
      return null
    }
    
    return decoded
  } catch (error) {
    return null
  }
}

export function middleware(request: NextRequest) {
  // Define protected routes
  const protectedRoutes = ['/admin', '/profile', '/checkout']
  const adminRoutes = ['/admin']
  
  const { pathname } = request.nextUrl
  
  // Try to get token from both Authorization header and cookies
  const authHeader = request.headers.get('authorization')
  let authToken = null
  
  if (authHeader && authHeader.startsWith('Bearer ')) {
    authToken = authHeader.substring(7)
  } else {
    authToken = request.cookies.get('auth-token')?.value
  }

  // Check if the current path is protected
  const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route))
  const isAdminRoute = adminRoutes.some(route => pathname.startsWith(route))

  if (isProtectedRoute) {
    if (!authToken) {
      const loginUrl = new URL('/login', request.url)
      loginUrl.searchParams.set('redirect', pathname)
      return NextResponse.redirect(loginUrl)
    }

    const user = decodeJWT(authToken)
    
    if (!user) {
      const loginUrl = new URL('/login', request.url)
      loginUrl.searchParams.set('redirect', pathname)
      return NextResponse.redirect(loginUrl)
    }

    if (isAdminRoute && user.role !== 'admin') {
      return NextResponse.redirect(new URL('/', request.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\.png$|.*\\.jpg$|.*\\.jpeg$|.*\\.gif$|.*\\.svg$).*)',
  ],
}
