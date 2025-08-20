import { NextRequest, NextResponse } from 'next/server'
import { sql } from '@vercel/postgres'
import { getCurrentUser } from '@/lib/jwt'

// Force dynamic rendering for this API route
export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const currentUser = getCurrentUser(request)
    
    if (!currentUser) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    let notifications = []

    if (currentUser.role === 'admin') {
      // Admin notifications: pending transactions
      const pendingTransactions = await sql`
        SELECT 
          t.id,
          t.created_at,
          u.name as user_name,
          p.name as product_name,
          t.amount
        FROM transactions t
        JOIN users u ON t.user_id = u.id
        JOIN products p ON t.product_id = p.id
        WHERE t.status = 'pending'
        ORDER BY t.created_at DESC
        LIMIT 10
      `

      notifications = pendingTransactions.rows.map(tx => ({
        id: `transaction-${tx.id}`,
        type: 'pending_transaction',
        title: 'Pesanan Baru Menunggu Persetujuan',
        message: `${tx.user_name} memesan ${tx.product_name}`,
        amount: tx.amount,
        created_at: tx.created_at,
        action_url: '/admin?tab=transactions',
        read: false
      }))

    } else {
      // Member notifications: approved/rejected transactions
      const userTransactions = await sql`
        SELECT 
          t.id,
          t.status,
          t.updated_at,
          t.created_at,
          p.name as product_name,
          t.amount,
          t.download_link
        FROM transactions t
        JOIN products p ON t.product_id = p.id
        WHERE t.user_id = ${currentUser.userId}
          AND t.status IN ('approved', 'rejected')
          AND t.updated_at > t.created_at
        ORDER BY t.updated_at DESC
        LIMIT 10
      `

      notifications = userTransactions.rows.map(tx => ({
        id: `transaction-${tx.id}`,
        type: tx.status === 'approved' ? 'transaction_approved' : 'transaction_rejected',
        title: tx.status === 'approved' ? 'Pesanan Disetujui!' : 'Pesanan Ditolak',
        message: tx.status === 'approved' 
          ? `Pesanan ${tx.product_name} telah disetujui. Silakan download file Anda.`
          : `Pesanan ${tx.product_name} ditolak. Silakan hubungi admin untuk informasi lebih lanjut.`,
        amount: tx.amount,
        created_at: tx.updated_at,
        action_url: tx.status === 'approved' ? '/profile' : '/profile',
        download_available: tx.status === 'approved' && tx.download_link,
        read: false
      }))
    }

    return NextResponse.json({
      notifications,
      unread_count: notifications.length
    })

  } catch (error) {
    console.error('Get notifications error:', error)
    return NextResponse.json(
      { error: 'Terjadi kesalahan server' },
      { status: 500 }
    )
  }
}
