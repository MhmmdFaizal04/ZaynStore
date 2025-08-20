import { sql } from '@vercel/postgres'

export interface NotificationData {
  transactionId?: number
  productName?: string
  amount?: number
  downloadLink?: string
  [key: string]: any
}

export async function createNotification({
  userId,
  type,
  title,
  message,
  data = {}
}: {
  userId: number
  type: string
  title: string
  message: string
  data?: NotificationData
}) {
  try {
    await sql`
      INSERT INTO notifications (user_id, type, title, message, data)
      VALUES (${userId}, ${type}, ${title}, ${message}, ${JSON.stringify(data)})
    `
    return { success: true }
  } catch (error) {
    console.error('Error creating notification:', error)
    return { success: false, error }
  }
}

// Create notification when transaction is approved
export async function createTransactionApprovedNotification(
  userId: number,
  productName: string,
  transactionId: number,
  downloadLink?: string
) {
  return createNotification({
    userId,
    type: 'transaction_approved',
    title: 'Pesanan Disetujui!',
    message: `Pesanan ${productName} telah disetujui. Silakan download file Anda.`,
    data: {
      transactionId,
      productName,
      downloadLink
    }
  })
}

// Create notification when transaction is rejected
export async function createTransactionRejectedNotification(
  userId: number,
  productName: string,
  transactionId: number
) {
  return createNotification({
    userId,
    type: 'transaction_rejected',
    title: 'Pesanan Ditolak',
    message: `Pesanan ${productName} ditolak. Silakan hubungi admin untuk informasi lebih lanjut.`,
    data: {
      transactionId,
      productName
    }
  })
}

// Create notification for admin when new transaction is created
export async function createPendingTransactionNotification(
  adminUserId: number,
  customerName: string,
  productName: string,
  transactionId: number,
  amount: number
) {
  return createNotification({
    userId: adminUserId,
    type: 'pending_transaction',
    title: 'Pesanan Baru Menunggu Persetujuan',
    message: `${customerName} memesan ${productName}`,
    data: {
      transactionId,
      productName,
      customerName,
      amount
    }
  })
}
