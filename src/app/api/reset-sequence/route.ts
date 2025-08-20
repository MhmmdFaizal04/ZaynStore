import { NextRequest, NextResponse } from 'next/server'
import { sql } from '@vercel/postgres'
import { requireAdmin } from '@/lib/jwt'

// Force dynamic rendering for this API route
export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    // Require admin authentication
    requireAdmin(request)
    
    const { table } = await request.json()
    
    if (!table || !['products', 'transactions', 'users'].includes(table)) {
      return NextResponse.json(
        { error: 'Tabel tidak valid. Pilih: products, transactions, atau users' },
        { status: 400 }
      )
    }

    console.log(`Resetting sequence for table: ${table}`)
    
    // Get the maximum ID from the table
    const maxResult = await sql.query(`SELECT COALESCE(MAX(id), 0) as max_id FROM ${table}`)
    const maxId = maxResult.rows[0].max_id
    
    // Reset the sequence to start from max_id + 1
    const nextId = maxId + 1
    await sql.query(`ALTER SEQUENCE ${table}_id_seq RESTART WITH ${nextId}`)
    
    console.log(`Sequence ${table}_id_seq reset to start from ${nextId}`)

    return NextResponse.json({
      message: `Sequence untuk tabel ${table} berhasil direset`,
      table: table,
      max_id: maxId,
      next_id: nextId
    })

  } catch (error) {
    console.error('Reset sequence error:', error)
    
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
