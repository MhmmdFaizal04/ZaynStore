'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'

interface User {
  id: number
  email: string
  name: string
  role: 'admin' | 'customer'
}

export default function Hero() {
  const [user, setUser] = useState<User | null>(null)

  useEffect(() => {
    // Check if user is logged in
    const userData = localStorage.getItem('user')
    if (userData) {
      setUser(JSON.parse(userData))
    }
  }, [])

  return (
    <section className="bg-gradient-to-br from-blue-50 to-blue-100 py-12 sm:py-16 lg:py-20 xl:py-24">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-serif font-bold text-gray-900 mb-4 sm:mb-6 leading-tight">
          Platform
          <span className="text-blue-600 block sm:inline sm:ml-3">Digital Store</span>
          <span className="block">Terpercaya</span>
        </h1>
        <p className="text-base sm:text-lg lg:text-xl text-gray-600 mb-6 sm:mb-8 max-w-xl lg:max-w-2xl xl:max-w-3xl mx-auto leading-relaxed px-4 sm:px-0">
          Temukan berbagai file digital berkualitas tinggi untuk kebutuhan bisnis, 
          kreatif, dan edukasi Anda. Akses instan setelah pembelian.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center items-center max-w-md sm:max-w-none mx-auto">
          <Link 
            href="/products" 
            className="btn-primary text-base sm:text-lg px-6 sm:px-8 py-2.5 sm:py-3 w-full sm:w-auto"
          >
            Jelajahi Produk
          </Link>
          {!user && (
            <Link 
              href="/register" 
              className="btn-secondary text-base sm:text-lg px-6 sm:px-8 py-2.5 sm:py-3 w-full sm:w-auto"
            >
              Daftar Sekarang
            </Link>
          )}
          {user && user.role === 'customer' && (
            <Link 
              href="/profile" 
              className="btn-secondary text-base sm:text-lg px-6 sm:px-8 py-2.5 sm:py-3 w-full sm:w-auto"
            >
              Pesanan Saya
            </Link>
          )}
        </div>
        
        {/* Stats */}
        <div className="mt-12 sm:mt-16 lg:mt-20 grid grid-cols-1 sm:grid-cols-3 gap-6 sm:gap-8 lg:gap-12">
          <div className="text-center p-4 rounded-lg bg-white/50 backdrop-blur-sm">
            <div className="text-2xl sm:text-3xl lg:text-4xl font-bold text-blue-600 mb-2">100+</div>
            <div className="text-gray-600 text-sm sm:text-base">Produk Digital</div>
          </div>
          <div className="text-center p-4 rounded-lg bg-white/50 backdrop-blur-sm">
            <div className="text-2xl sm:text-3xl lg:text-4xl font-bold text-blue-600 mb-2">1000+</div>
            <div className="text-gray-600 text-sm sm:text-base">Pelanggan Puas</div>
          </div>
          <div className="text-center p-4 rounded-lg bg-white/50 backdrop-blur-sm">
            <div className="text-2xl sm:text-3xl lg:text-4xl font-bold text-blue-600 mb-2">24/7</div>
            <div className="text-gray-600 text-sm sm:text-base">Akses Download</div>
          </div>
        </div>
      </div>
    </section>
  )
}
