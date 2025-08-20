import { NextRequest, NextResponse } from 'next/server'
import { sql } from '@vercel/postgres'
import { requireAdmin } from '@/lib/jwt'

// Force dynamic rendering for this API route
export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    // Require admin authentication
    requireAdmin(request)
    
    console.log('Fixing approved transactions without download links...')
    
    // Get all approved transactions without download_link
    const approvedTransactions = await sql`
      SELECT 
        t.id,
        t.user_id,
        t.product_id,
        p.file_url as product_file_url
      FROM transactions t
      JOIN products p ON t.product_id = p.id
      WHERE t.status = 'approved' 
        AND (t.download_link IS NULL OR t.download_link = '')
        AND p.file_url IS NOT NULL
        AND p.file_url != ''
    `

    if (approvedTransactions.rows.length === 0) {
      return NextResponse.json({
        message: 'No approved transactions need fixing',
        count: 0
      })
    }

    let fixedCount = 0

    // Update each transaction with the product file URL as download link
    for (const transaction of approvedTransactions.rows) {
      await sql`
        UPDATE transactions 
        SET download_link = ${transaction.product_file_url},
            updated_at = CURRENT_TIMESTAMP
        WHERE id = ${transaction.id}
      `
      fixedCount++
    }

    console.log(`Fixed ${fixedCount} approved transactions`)

    return NextResponse.json({
      message: `Successfully fixed ${fixedCount} approved transactions`,
      count: fixedCount,
      transactions: approvedTransactions.rows
    })

  } catch (error) {
    console.error('Fix download links error:', error)
    
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
