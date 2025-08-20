import { NextRequest, NextResponse } from 'next/server'
import { sql } from '@vercel/postgres'
import { requireAdmin } from '@/lib/jwt'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const productId = parseInt(params.id)

    if (isNaN(productId)) {
      return NextResponse.json(
        { error: 'ID produk tidak valid' },
        { status: 400 }
      )
    }

    const result = await sql`
      SELECT * FROM products WHERE id = ${productId}
    `

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: 'Produk tidak ditemukan' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      product: result.rows[0]
    })

  } catch (error) {
    console.error('Get product error:', error)
    return NextResponse.json(
      { error: 'Terjadi kesalahan server' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Require admin authentication for updating products
    requireAdmin(request)
    
    const productId = parseInt(params.id)
    const { name, description, price, category, file_url, image_url } = await request.json()

    if (isNaN(productId)) {
      return NextResponse.json(
        { error: 'ID produk tidak valid' },
        { status: 400 }
      )
    }

    if (!name || !description || !price || !category || !file_url) {
      return NextResponse.json(
        { error: 'Semua field wajib harus diisi' },
        { status: 400 }
      )
    }

    const result = await sql`
      UPDATE products 
      SET name = ${name}, description = ${description}, price = ${price}, 
          category = ${category}, file_url = ${file_url}, image_url = ${image_url},
          updated_at = CURRENT_TIMESTAMP
      WHERE id = ${productId}
      RETURNING *
    `

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: 'Produk tidak ditemukan' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      message: 'Produk berhasil diperbarui',
      product: result.rows[0]
    })

  } catch (error) {
    console.error('Update product error:', error)
    
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

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Require admin authentication for deleting products
    requireAdmin(request)
    
    const productId = parseInt(params.id)

    if (isNaN(productId)) {
      return NextResponse.json(
        { error: 'ID produk tidak valid' },
        { status: 400 }
      )
    }

    // Check if product has any transactions
    const transactionCheck = await sql`
      SELECT COUNT(*) as count FROM transactions WHERE product_id = ${productId}
    `

    if (parseInt(transactionCheck.rows[0].count) > 0) {
      return NextResponse.json(
        { error: 'Tidak dapat menghapus produk yang memiliki transaksi' },
        { status: 400 }
      )
    }

    const result = await sql`
      DELETE FROM products WHERE id = ${productId}
      RETURNING id, name
    `

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: 'Produk tidak ditemukan' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      message: 'Produk berhasil dihapus',
      deletedProduct: result.rows[0]
    })

  } catch (error) {
    console.error('Delete product error:', error)
    
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
