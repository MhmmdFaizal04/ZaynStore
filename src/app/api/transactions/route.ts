import { NextRequest, NextResponse } from 'next/server'
import { sql } from '@vercel/postgres'
import { getCurrentUser, requireAuth, requireAdmin } from '@/lib/jwt'

// Force dynamic rendering for this API route
export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const currentUser = getCurrentUser(request)
    
    // If no user is authenticated, return error
    if (!currentUser) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId') || searchParams.get('user_id')
    const status = searchParams.get('status')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const offset = (page - 1) * limit

    let query = `
      SELECT 
        t.*,
        u.name as user_name,
        u.email as user_email,
        p.name as product_name,
        p.price as product_price,
        p.file_url as product_file_url
      FROM transactions t
      JOIN users u ON t.user_id = u.id
      JOIN products p ON t.product_id = p.id
      WHERE 1=1
    `
    let params: any[] = []
    let paramIndex = 1

    // If user is not admin, only show their own transactions
    if (currentUser.role !== 'admin') {
      query += ` AND t.user_id = $${paramIndex}`
      params.push(currentUser.userId)
      paramIndex++
    } else if (userId) {
      // Admin can filter by specific user
      query += ` AND t.user_id = $${paramIndex}`
      params.push(parseInt(userId))
      paramIndex++
    }

    if (status) {
      query += ` AND t.status = $${paramIndex}`
      params.push(status)
      paramIndex++
    }

    query += ` ORDER BY t.created_at DESC LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`
    params.push(limit, offset)

    const result = await sql.query(query, params)

    // Get total count
    let countQuery = `
      SELECT COUNT(*) 
      FROM transactions t
      WHERE 1=1
    `
    let countParams: any[] = []
    let countParamIndex = 1

    // Apply same user filtering for count
    if (currentUser.role !== 'admin') {
      countQuery += ` AND t.user_id = $${countParamIndex}`
      countParams.push(currentUser.userId)
      countParamIndex++
    } else if (userId) {
      countQuery += ` AND t.user_id = $${countParamIndex}`
      countParams.push(parseInt(userId))
      countParamIndex++
    }

    if (status) {
      countQuery += ` AND t.status = $${countParamIndex}`
      countParams.push(status)
      countParamIndex++
    }

    const countResult = await sql.query(countQuery, countParams)
    const total = parseInt(countResult.rows[0].count)

    return NextResponse.json({
      transactions: result.rows,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    })

  } catch (error) {
    console.error('Get transactions error:', error)
    return NextResponse.json(
      { error: 'Terjadi kesalahan server' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const currentUser = requireAuth(request)
    const { user_id, product_id, amount, payment_proof } = await request.json()

    // For security, always use the authenticated user's ID
    const actualUserId = currentUser.userId

    if (!product_id || !amount) {
      return NextResponse.json(
        { error: 'Product ID dan amount harus diisi' },
        { status: 400 }
      )
    }

    // Verify product exists and get price
    const productResult = await sql`
      SELECT id, price FROM products WHERE id = ${product_id}
    `

    if (productResult.rows.length === 0) {
      return NextResponse.json(
        { error: 'Produk tidak ditemukan' },
        { status: 404 }
      )
    }

    const product = productResult.rows[0]

    if (amount !== product.price) {
      return NextResponse.json(
        { error: 'Jumlah pembayaran tidak sesuai dengan harga produk' },
        { status: 400 }
      )
    }

    // Create transaction
    const result = await sql`
      INSERT INTO transactions (user_id, product_id, amount, payment_proof, status)
      VALUES (${actualUserId}, ${product_id}, ${amount}, ${payment_proof}, 'pending')
      RETURNING *
    `

    return NextResponse.json({
      message: 'Transaksi berhasil dibuat',
      transaction: result.rows[0]
    })

  } catch (error) {
    console.error('Create transaction error:', error)
    
    if (error instanceof Error && error.message === 'Authentication required') {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }
    
    return NextResponse.json(
      { error: 'Terjadi kesalahan server' },
      { status: 500 }
    )
  }
}
