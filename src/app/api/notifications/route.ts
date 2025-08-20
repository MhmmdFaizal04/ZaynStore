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

    // Get user notifications
    const notifications = await sql`
      SELECT 
        id,
        type,
        title,
        message,
        data,
        read,
        created_at
      FROM notifications
      WHERE user_id = ${currentUser.userId}
      ORDER BY created_at DESC
      LIMIT 20
    `

    // Format notifications
    const formattedNotifications = notifications.rows.map(notification => ({
      id: notification.id,
      type: notification.type,
      title: notification.title,
      message: notification.message,
      data: notification.data,
      read: notification.read,
      created_at: notification.created_at,
      action_url: getActionUrl(notification.type, notification.data)
    }))

    const unreadCount = notifications.rows.filter(n => !n.read).length

    return NextResponse.json({
      notifications: formattedNotifications,
      unread_count: unreadCount
    })

  } catch (error) {
    console.error('Get notifications error:', error)
    return NextResponse.json(
      { error: 'Terjadi kesalahan server' },
      { status: 500 }
    )
  }
}

// Mark notification as read
export async function PATCH(request: NextRequest) {
  try {
    const currentUser = getCurrentUser(request)
    
    if (!currentUser) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    const { notificationId } = await request.json()

    if (!notificationId) {
      return NextResponse.json(
        { error: 'Notification ID is required' },
        { status: 400 }
      )
    }

    // Update notification as read
    await sql`
      UPDATE notifications 
      SET read = TRUE, updated_at = CURRENT_TIMESTAMP
      WHERE id = ${notificationId} AND user_id = ${currentUser.userId}
    `

    return NextResponse.json({ success: true })

  } catch (error) {
    console.error('Mark notification as read error:', error)
    return NextResponse.json(
      { error: 'Terjadi kesalahan server' },
      { status: 500 }
    )
  }
}

// Helper function to determine action URL based on notification type
function getActionUrl(type: string, data: any): string {
  switch (type) {
    case 'transaction_approved':
    case 'transaction_rejected':
      return '/profile'
    case 'pending_transaction':
      return '/admin?tab=transactions'
    default:
      return '/'
  }
}
