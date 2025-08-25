import { NextRequest, NextResponse } from 'next/server'
import { sql } from '@vercel/postgres'
import { getCurrentUser, requireAuth, requireAdmin } from '@/lib/jwt'

// Force dynamic rendering for this API route
export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const currentUser = getCurrentUser(request)
    
    // Only authenticated users can see announcements
    if (!currentUser) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    const result = await sql`
      SELECT 
        a.*,
        u.name as created_by_name
      FROM announcements a
      JOIN users u ON a.created_by = u.id
      ORDER BY a.created_at DESC
      LIMIT 10
    `

    return NextResponse.json({
      announcements: result.rows
    })

  } catch (error) {
    console.error('Get announcements error:', error)
    return NextResponse.json(
      { error: 'Terjadi kesalahan server' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const currentUser = requireAdmin(request)
    const { title, content, type = 'board' } = await request.json()

    if (!title || !content) {
      return NextResponse.json(
        { error: 'Title dan content harus diisi' },
        { status: 400 }
      )
    }

    if (!['board', 'alert'].includes(type)) {
      return NextResponse.json(
        { error: 'Tipe pengumuman tidak valid' },
        { status: 400 }
      )
    }

    const result = await sql`
      INSERT INTO announcements (title, content, type, created_by)
      VALUES (${title}, ${content}, ${type}, ${currentUser.userId})
      RETURNING *
    `

    return NextResponse.json({
      message: 'Pengumuman berhasil dibuat',
      announcement: result.rows[0]
    })

  } catch (error) {
    console.error('Create announcement error:', error)
    
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

export async function DELETE(request: NextRequest) {
  try {
    const currentUser = requireAdmin(request)
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json(
        { error: 'ID pengumuman harus disediakan' },
        { status: 400 }
      )
    }

    const result = await sql`
      DELETE FROM announcements 
      WHERE id = ${id}
      RETURNING id
    `

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: 'Pengumuman tidak ditemukan' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      message: 'Pengumuman berhasil dihapus'
    })

  } catch (error) {
    console.error('Delete announcement error:', error)
    
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
