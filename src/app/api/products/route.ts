import { NextRequest, NextResponse } from 'next/server'
import { sql } from '@vercel/postgres'
import { requireAdmin } from '@/lib/jwt'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category')
    const search = searchParams.get('search')
    const exclude = searchParams.get('exclude')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '12')
    const offset = (page - 1) * limit

    let query = `
      SELECT id, name, description, price, image_url, category, created_at
      FROM products
      WHERE 1=1
    `
    let params: any[] = []
    let paramIndex = 1

    if (category) {
      query += ` AND category = $${paramIndex}`
      params.push(category)
      paramIndex++
    }

    if (search) {
      query += ` AND (name ILIKE $${paramIndex} OR description ILIKE $${paramIndex})`
      params.push(`%${search}%`)
      paramIndex++
    }

    if (exclude) {
      query += ` AND id != $${paramIndex}`
      params.push(parseInt(exclude))
      paramIndex++
    }

    query += ` ORDER BY created_at DESC LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`
    params.push(limit, offset)

    const result = await sql.query(query, params)

    // Get total count for pagination
    let countQuery = 'SELECT COUNT(*) FROM products WHERE 1=1'
    let countParams: any[] = []
    let countParamIndex = 1

    if (category) {
      countQuery += ` AND category = $${countParamIndex}`
      countParams.push(category)
      countParamIndex++
    }

    if (search) {
      countQuery += ` AND (name ILIKE $${countParamIndex} OR description ILIKE $${countParamIndex})`
      countParams.push(`%${search}%`)
      countParamIndex++
    }

    if (exclude) {
      countQuery += ` AND id != $${countParamIndex}`
      countParams.push(parseInt(exclude))
      countParamIndex++
    }

    const countResult = await sql.query(countQuery, countParams)
    const total = parseInt(countResult.rows[0].count)

    return NextResponse.json({
      products: result.rows,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    })

  } catch (error) {
    console.error('Get products error:', error)
    return NextResponse.json(
      { error: 'Terjadi kesalahan server' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    // Require admin authentication for creating products
    requireAdmin(request)
    
    const { name, description, price, category, file_url, image_url } = await request.json()

    if (!name || !description || !price || !category) {
      return NextResponse.json(
        { error: 'Nama, deskripsi, harga, dan kategori wajib diisi' },
        { status: 400 }
      )
    }

    const result = await sql`
      INSERT INTO products (name, description, price, category, file_url, image_url)
      VALUES (${name}, ${description}, ${price}, ${category}, ${file_url}, ${image_url})
      RETURNING *
    `

    return NextResponse.json({
      message: 'Produk berhasil ditambahkan',
      product: result.rows[0]
    })

  } catch (error) {
    console.error('Create product error:', error)
    
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
