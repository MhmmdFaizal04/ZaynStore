import { NextRequest, NextResponse } from 'next/server'
import { readFileSync, existsSync } from 'fs'
import { join } from 'path'

export async function GET(
  request: NextRequest,
  { params }: { params: { filename: string } }
) {
  try {
    const { filename } = params
    
    // Decode filename untuk menangani URL encoding
    const decodedFilename = decodeURIComponent(filename)
    console.log('Serving file:', decodedFilename)
    
    // Path ke file di public directory
    const filePath = join(process.cwd(), 'public', decodedFilename)
    console.log('File path:', filePath)
    
    // Cek apakah file ada
    if (!existsSync(filePath)) {
      console.log('File not found:', filePath)
      return new NextResponse('File not found', { status: 404 })
    }
    
    // Baca file secara synchronous
    const fileBuffer = readFileSync(filePath)
    console.log('File size:', fileBuffer.length)
    
    // Tentukan content type berdasarkan ekstensi file
    const extension = filename.toLowerCase().split('.').pop()
    let contentType = 'application/octet-stream'
    
    switch (extension) {
      case 'jpg':
      case 'jpeg':
        contentType = 'image/jpeg'
        break
      case 'png':
        contentType = 'image/png'
        break
      case 'gif':
        contentType = 'image/gif'
        break
      case 'pdf':
        contentType = 'application/pdf'
        break
      case 'webp':
        contentType = 'image/webp'
        break
    }
    
    console.log('Content type:', contentType)
    
    // Return file dengan header yang tepat
    return new NextResponse(fileBuffer, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Content-Length': fileBuffer.length.toString(),
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    })
    
  } catch (error) {
    console.error('Error serving payment proof:', error)
    return new NextResponse('Internal Server Error', { status: 500 })
  }
}
