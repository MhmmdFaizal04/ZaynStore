import { NextRequest, NextResponse } from 'next/server'
import { put } from '@vercel/blob'

// Force dynamic rendering for this API route
export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File
    
    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 })
    }
    
    // Validate file type
    if (!file.type.startsWith('image/') && file.type !== 'application/pdf') {
      return NextResponse.json({ error: 'File must be an image or PDF' }, { status: 400 })
    }
    
    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json({ error: 'File size must be less than 5MB' }, { status: 400 })
    }
    
    // Generate unique filename
    const fileExtension = file.name.split('.').pop()
    const filename = `payment_proof_${Date.now()}_${Math.random().toString(36).substring(2)}.${fileExtension}`
    
    // Upload to Vercel Blob
    const blob = await put(filename, file, {
      access: 'public',
    })
    
    return NextResponse.json({
      message: 'File uploaded successfully',
      filename: filename,
      url: blob.url,
      downloadUrl: blob.downloadUrl
    })
    
  } catch (error) {
    console.error('File upload error:', error)
    return NextResponse.json(
      { error: 'Failed to upload file' },
      { status: 500 }
    )
  }
}
