import { NextRequest, NextResponse } from 'next/server'
import { initDatabase, seedDatabase } from '@/lib/database'

export async function POST(request: NextRequest) {
  try {
    console.log('Initializing database...')
    const initResult = await initDatabase()
    
    console.log('Seeding database...')
    const seedResult = await seedDatabase()
    
    return NextResponse.json({
      success: true,
      message: 'Database berhasil diinisialisasi dan data sample berhasil ditambahkan',
      details: {
        init: initResult,
        seed: seedResult
      }
    })
  } catch (error) {
    console.error('Database initialization error:', error)
    return NextResponse.json(
      { 
        success: false,
        error: 'Gagal menginisialisasi database',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
