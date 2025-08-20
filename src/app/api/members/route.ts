import { NextRequest, NextResponse } from 'next/server'
import { sql } from '@vercel/postgres'
import { requireAdmin } from '@/lib/jwt'

// Force dynamic rendering for this API route
export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    // Require admin authentication
    requireAdmin(request)
    
    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search')
    const role = searchParams.get('role')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const offset = (page - 1) * limit

    let query = `
      SELECT 
        u.id,
        u.name,
        u.email,
        u.role,
        u.created_at,
        COUNT(DISTINCT t.id) as total_transactions,
        COALESCE(SUM(CASE WHEN t.status = 'approved' THEN t.amount ELSE 0 END), 0) as total_spent
      FROM users u
      LEFT JOIN transactions t ON u.id = t.user_id
      WHERE 1=1
    `
    let params: any[] = []
    let paramIndex = 1

    if (search) {
      query += ` AND (u.name ILIKE $${paramIndex} OR u.email ILIKE $${paramIndex})`
      params.push(`%${search}%`)
      paramIndex++
    }

    if (role && ['admin', 'customer'].includes(role)) {
      query += ` AND u.role = $${paramIndex}`
      params.push(role)
      paramIndex++
    }

    query += ` GROUP BY u.id, u.name, u.email, u.role, u.created_at`
    query += ` ORDER BY u.created_at DESC LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`
    params.push(limit, offset)

    const result = await sql.query(query, params)

    // Get total count
    let countQuery = 'SELECT COUNT(*) FROM users WHERE 1=1'
    let countParams: any[] = []
    let countParamIndex = 1

    if (search) {
      countQuery += ` AND (name ILIKE $${countParamIndex} OR email ILIKE $${countParamIndex})`
      countParams.push(`%${search}%`)
      countParamIndex++
    }

    if (role && ['admin', 'customer'].includes(role)) {
      countQuery += ` AND role = $${countParamIndex}`
      countParams.push(role)
      countParamIndex++
    }

    const countResult = await sql.query(countQuery, countParams)
    const total = parseInt(countResult.rows[0].count)

    return NextResponse.json({
      members: result.rows,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    })

  } catch (error) {
    console.error('Get members error:', error)
    
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
    // Require admin authentication
    requireAdmin(request)
    
    const { searchParams } = new URL(request.url)
    const memberId = searchParams.get('id')

    if (!memberId) {
      return NextResponse.json(
        { error: 'ID member diperlukan' },
        { status: 400 }
      )
    }

    const id = parseInt(memberId)
    if (isNaN(id)) {
      return NextResponse.json(
        { error: 'ID member tidak valid' },
        { status: 400 }
      )
    }

    // Check if member exists and is not admin
    const memberResult = await sql`
      SELECT id, role FROM users WHERE id = ${id}
    `

    if (memberResult.rows.length === 0) {
      return NextResponse.json(
        { error: 'Member tidak ditemukan' },
        { status: 404 }
      )
    }

    const member = memberResult.rows[0]
    if (member.role === 'admin') {
      return NextResponse.json(
        { error: 'Tidak dapat menghapus akun admin' },
        { status: 403 }
      )
    }

    // Check if member has transactions
    const transactionCheck = await sql`
      SELECT COUNT(*) as count FROM transactions WHERE user_id = ${id}
    `

    if (parseInt(transactionCheck.rows[0].count) > 0) {
      return NextResponse.json(
        { error: 'Tidak dapat menghapus member yang memiliki transaksi' },
        { status: 400 }
      )
    }

    // Delete member
    await sql`DELETE FROM users WHERE id = ${id}`

    return NextResponse.json({
      message: 'Member berhasil dihapus'
    })

  } catch (error) {
    console.error('Delete member error:', error)
    
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
