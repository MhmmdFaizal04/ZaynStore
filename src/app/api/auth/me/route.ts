import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/jwt'
import { sql } from '@vercel/postgres'

// Force dynamic rendering for this API route
export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const currentUser = getCurrentUser(request)
    
    if (!currentUser) {
      return NextResponse.json(
        { error: 'Token tidak valid atau sudah expired' },
        { status: 401 }
      )
    }

    // Get fresh user data from database
    const result = await sql`
      SELECT id, email, name, role, created_at
      FROM users 
      WHERE id = ${currentUser.userId}
    `

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: 'User tidak ditemukan' },
        { status: 404 }
      )
    }

    const user = result.rows[0]

    return NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        created_at: user.created_at
      }
    })

  } catch (error) {
    console.error('Auth verification error:', error)
    return NextResponse.json(
      { error: 'Token tidak valid' },
      { status: 401 }
    )
  }
}
