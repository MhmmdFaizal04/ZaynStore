import { NextRequest, NextResponse } from 'next/server'
import { sql } from '@vercel/postgres'
import { getCurrentUser, requireAdmin } from '@/lib/jwt'

// Force dynamic rendering for this API route
export const dynamic = 'force-dynamic'

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Require admin authentication
    requireAdmin(request)
    
    const transactionId = parseInt(params.id)
    const { status } = await request.json()

    if (isNaN(transactionId)) {
      return NextResponse.json(
        { error: 'ID transaksi tidak valid' },
        { status: 400 }
      )
    }

    if (!['approved', 'rejected'].includes(status)) {
      return NextResponse.json(
        { error: 'Status tidak valid' },
        { status: 400 }
      )
    }

    // Get transaction details with product info
    const transactionResult = await sql`
      SELECT 
        t.*,
        p.file_url as product_file_url,
        u.email as user_email,
        u.name as user_name
      FROM transactions t
      JOIN products p ON t.product_id = p.id
      JOIN users u ON t.user_id = u.id
      WHERE t.id = ${transactionId}
    `

    if (transactionResult.rows.length === 0) {
      return NextResponse.json(
        { error: 'Transaksi tidak ditemukan' },
        { status: 404 }
      )
    }

    const transaction = transactionResult.rows[0]

    // Generate download link if approved
    let downloadLink = null
    if (status === 'approved' && transaction.product_file_url) {
      // In real implementation, this would be a secure download URL from Vercel Blob
      // For now, we'll use the product file URL
      downloadLink = transaction.product_file_url
    }

    // Update transaction status
    const result = await sql`
      UPDATE transactions 
      SET status = ${status}, 
          download_link = ${downloadLink},
          updated_at = CURRENT_TIMESTAMP
      WHERE id = ${transactionId}
      RETURNING *
    `

    const updatedTransaction = result.rows[0]

    // If approved, you can add email sending logic here
    if (status === 'approved') {
      // TODO: Send email with download link
      console.log(`Transaction ${transactionId} approved. Should send email to ${transaction.user_email}`)
      console.log(`Download link: ${downloadLink}`)
    }

    return NextResponse.json({
      message: `Transaksi berhasil ${status === 'approved' ? 'disetujui' : 'ditolak'}`,
      transaction: updatedTransaction
    })

  } catch (error) {
    console.error('Update transaction error:', error)
    
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

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const currentUser = getCurrentUser(request)
    
    if (!currentUser) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    const transactionId = parseInt(params.id)

    if (isNaN(transactionId)) {
      return NextResponse.json(
        { error: 'ID transaksi tidak valid' },
        { status: 400 }
      )
    }

    const result = await sql`
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
      WHERE t.id = ${transactionId}
    `

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: 'Transaksi tidak ditemukan' },
        { status: 404 }
      )
    }

    const transaction = result.rows[0]

    // Check if user has permission to view this transaction
    if (currentUser.role !== 'admin' && transaction.user_id !== currentUser.userId) {
      return NextResponse.json(
        { error: 'Akses ditolak' },
        { status: 403 }
      )
    }

    return NextResponse.json({
      transaction
    })

  } catch (error) {
    console.error('Get transaction error:', error)
    return NextResponse.json(
      { error: 'Terjadi kesalahan server' },
      { status: 500 }
    )
  }
}
