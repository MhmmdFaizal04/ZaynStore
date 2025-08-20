import jwt from 'jsonwebtoken'
import { NextRequest } from 'next/server'

interface JWTPayload {
  userId: number
  email: string
  role: string
  iat?: number
  exp?: number
}

export function signToken(payload: Omit<JWTPayload, 'iat' | 'exp'>): string {
  if (!process.env.JWT_SECRET) {
    throw new Error('JWT_SECRET is not defined')
  }

  return jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: '7d', // Token berlaku 7 hari
    issuer: 'digital-store',
    audience: 'digital-store-users'
  })
}

export function verifyToken(token: string): JWTPayload {
  if (!process.env.JWT_SECRET) {
    throw new Error('JWT_SECRET is not defined')
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET, {
      issuer: 'digital-store',
      audience: 'digital-store-users'
    }) as JWTPayload

    return decoded
  } catch (error) {
    throw new Error('Invalid or expired token')
  }
}

export function extractTokenFromRequest(request: NextRequest): string | null {
  // Try to get token from Authorization header
  const authHeader = request.headers.get('authorization')
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.substring(7)
  }

  // Try to get token from cookies
  const token = request.cookies.get('auth-token')?.value
  if (token) {
    return token
  }

  return null
}

export function getCurrentUser(request: NextRequest): JWTPayload | null {
  try {
    const token = extractTokenFromRequest(request)
    if (!token) {
      return null
    }

    const user = verifyToken(token)
    return user
  } catch (error) {
    return null
  }
}

// Middleware helper untuk protected routes
export function requireAuth(request: NextRequest): JWTPayload {
  const user = getCurrentUser(request)
  if (!user) {
    throw new Error('Authentication required')
  }
  return user
}

// Middleware helper untuk admin routes
export function requireAdmin(request: NextRequest): JWTPayload {
  const user = requireAuth(request)
  if (user.role !== 'admin') {
    throw new Error('Admin access required')
  }
  return user
}
