import bcrypt from 'bcryptjs'

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12)
}

export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword)
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR'
  }).format(amount)
}

export function formatDate(date: Date): string {
  return new Intl.DateTimeFormat('id-ID', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(date)
}

export function generateDownloadToken(): string {
  return Math.random().toString(36).substring(2) + Date.now().toString(36)
}

export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

export function validatePassword(password: string): boolean {
  // Minimum 6 characters
  return password.length >= 6
}

export function validateFile(file: File, allowedTypes: string[]): boolean {
  return allowedTypes.includes(file.type)
}

export function generateQRISData(amount: number, orderId: string): string {
  // Simulasi data QRIS - dalam implementasi nyata, gunakan API bank atau payment gateway
  return `00020101021126580009ID.CO.QRIS.WWW0215ID12345678901234567890303UME51440014ID.CO.TELKOM.WWW02150891234567890123450303UME520454995303360540${amount}5802ID5914Digital Store6007Jakarta610310000626708${orderId}63041234`
}
