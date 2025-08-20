import { NextRequest, NextResponse } from 'next/server'
import { sql } from '@vercel/postgres'
import { requireAdmin } from '@/lib/jwt'
import bcrypt from 'bcryptjs'

export async function PUT(request: NextRequest) {
  try {
    // Require admin authentication
    const currentUser = requireAdmin(request)
    
    const { currentPassword, newPassword } = await request.json()

    if (!currentPassword || !newPassword) {
      return NextResponse.json(
        { error: 'Password lama dan password baru harus diisi' },
        { status: 400 }
      )
    }

    if (newPassword.length < 6) {
      return NextResponse.json(
        { error: 'Password baru minimal 6 karakter' },
        { status: 400 }
      )
    }

    // Get current admin user
    const result = await sql`
      SELECT id, password FROM users 
      WHERE id = ${currentUser.userId} AND role = 'admin'
    `

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: 'User admin tidak ditemukan' },
        { status: 404 }
      )
    }

    const adminUser = result.rows[0]

    // Verify current password
    const isCurrentPasswordValid = await bcrypt.compare(currentPassword, adminUser.password)
    if (!isCurrentPasswordValid) {
      return NextResponse.json(
        { error: 'Password lama tidak benar' },
        { status: 400 }
      )
    }

    // Hash new password
    const hashedNewPassword = await bcrypt.hash(newPassword, 12)

    // Update password in database
    await sql`
      UPDATE users 
      SET password = ${hashedNewPassword}, updated_at = CURRENT_TIMESTAMP
      WHERE id = ${adminUser.id}
    `

    return NextResponse.json({
      message: 'Password berhasil diubah',
      success: true
    })

  } catch (error) {
    console.error('Change password error:', error)
    
    if (error instanceof Error && (error.message === 'Authentication required' || error.message === 'Admin access required')) {
      return NextResponse.json(
        { error: error.message },
        { status: 403 }
      )
    }
    
    return NextResponse.json(
      { error: 'Terjadi kesalahan server' },
      { status: 500 }
    )
  }
}
