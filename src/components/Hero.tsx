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
  const [isVisible, setIsVisible] = useState(false)
  const [currentSlide, setCurrentSlide] = useState(0)

  const features = [
    { icon: "🚀", title: "Kualitas Premium", desc: "File berkualitas tinggi" },
    { icon: "⚡", title: "Download Instan", desc: "Akses langsung setelah bayar" },
    { icon: "🔒", title: "Aman & Terpercaya", desc: "Transaksi 100% aman" }
  ]

  useEffect(() => {
    // Check if user is logged in
    const userData = localStorage.getItem('user')
    if (userData) {
      setUser(JSON.parse(userData))
    }
    
    setIsVisible(true)
    
    // Auto slide features
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % 3) // Use fixed number instead of features.length
    }, 3000)
    
    return () => clearInterval(interval)
  }, [])

  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 min-h-screen flex items-center">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-400 to-purple-600 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-purple-400 to-pink-600 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse" style={{animationDelay: '1s'}}></div>
        <div className="absolute top-40 left-1/2 w-60 h-60 bg-gradient-to-br from-indigo-400 to-cyan-600 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse" style={{animationDelay: '2s'}}></div>
      </div>

      {/* Floating Particles */}
      <div className="absolute inset-0">
        {[...Array(15)].map((_, i) => (
          <div
            key={i}
            className="absolute w-2 h-2 bg-blue-400 rounded-full opacity-30 animate-ping"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 2}s`,
              animationDuration: `${2 + Math.random() * 2}s`
            }}
          ></div>
        ))}
      </div>

      <div className="relative z-10 container mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <div className={`space-y-8 transition-all duration-1000 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
          }`}>
            <div className="space-y-6">
              <div className="inline-flex items-center px-4 py-2 bg-white/50 backdrop-blur-sm rounded-full border border-white/20 shadow-lg">
                <span className="w-2 h-2 bg-green-400 rounded-full mr-2 animate-pulse"></span>
                <span className="text-sm font-medium text-gray-700">✨ Terpercaya & Berkualitas</span>
              </div>
              
              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-serif font-bold leading-tight">
                <span className="block text-gray-900 fade-in-up">Platform</span>
                <span className="block bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent fade-in-up" style={{animationDelay: '0.2s'}}>
                  Digital Store
                </span>
                <span className="block text-gray-900 fade-in-up" style={{animationDelay: '0.4s'}}>Terpercaya</span>
              </h1>
              
              <p className="text-base sm:text-lg lg:text-xl text-gray-600 leading-relaxed fade-in-up" style={{animationDelay: '0.6s'}}>
                Temukan berbagai file digital berkualitas tinggi untuk kebutuhan bisnis, 
                kreatif, dan edukasi Anda. <span className="font-semibold text-blue-600">Akses instan setelah pembelian.</span>
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 fade-in-up" style={{animationDelay: '0.8s'}}>
              <Link 
                href="/products" 
                className="group bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-4 rounded-xl font-semibold text-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 hover:scale-105"
              >
                <span className="flex items-center justify-center">
                  Jelajahi Produk
                  <svg className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </span>
              </Link>
              
              {!user && (
                <Link 
                  href="/register" 
                  className="group bg-white/80 backdrop-blur-sm border border-gray-200 text-gray-700 px-8 py-4 rounded-xl font-semibold text-lg shadow-md hover:shadow-lg transition-all duration-300 hover:bg-white"
                >
                  <span className="flex items-center justify-center">
                    Daftar Sekarang
                    <svg className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                    </svg>
                  </span>
                </Link>
              )}
              
              {user && user.role === 'customer' && (
                <Link 
                  href="/profile" 
                  className="group bg-white/80 backdrop-blur-sm border border-gray-200 text-gray-700 px-8 py-4 rounded-xl font-semibold text-lg shadow-md hover:shadow-lg transition-all duration-300 hover:bg-white"
                >
                  <span className="flex items-center justify-center">
                    Pesanan Saya
                    <svg className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                    </svg>
                  </span>
                </Link>
              )}
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-6 pt-8 border-t border-white/30 fade-in-up" style={{animationDelay: '1s'}}>
              <div className="text-center group hover:scale-105 transition-transform duration-300">
                <div className="text-2xl sm:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">100+</div>
                <div className="text-sm text-gray-600">Produk Digital</div>
              </div>
              <div className="text-center group hover:scale-105 transition-transform duration-300">
                <div className="text-2xl sm:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-2">1000+</div>
                <div className="text-sm text-gray-600">Pelanggan Puas</div>
              </div>
              <div className="text-center group hover:scale-105 transition-transform duration-300">
                <div className="text-2xl sm:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-pink-600 to-red-600 bg-clip-text text-transparent mb-2">24/7</div>
                <div className="text-sm text-gray-600">Akses Download</div>
              </div>
            </div>
          </div>

          {/* Right Content - Animated Features */}
          <div className={`transition-all duration-1000 delay-500 ${
            isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-10'
          }`}>
            <div className="relative">
              {/* Main Feature Card */}
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-xl border border-white/50 hover:shadow-2xl transition-all duration-300 hover:-translate-y-2">
                <div className="text-center space-y-6">
                  <div className="text-6xl animate-bounce">
                    {features[currentSlide].icon}
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900">
                    {features[currentSlide].title}
                  </h3>
                  <p className="text-gray-600 text-lg">
                    {features[currentSlide].desc}
                  </p>
                  
                  {/* Progress Indicators */}
                  <div className="flex justify-center space-x-2">
                    {features.map((_, index) => (
                      <button
                        key={index}
                        onClick={() => setCurrentSlide(index)}
                        className={`w-3 h-3 rounded-full transition-all duration-300 ${
                          index === currentSlide 
                            ? 'bg-blue-600 scale-125' 
                            : 'bg-gray-300 hover:bg-gray-400'
                        }`}
                      />
                    ))}
                  </div>
                </div>
              </div>

              {/* Floating Elements */}
              <div className="absolute -top-4 -right-4 w-20 h-20 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full opacity-80 animate-ping"></div>
              <div className="absolute -bottom-4 -left-4 w-16 h-16 bg-gradient-to-br from-green-400 to-blue-500 rounded-full opacity-60 animate-pulse"></div>
              
              {/* Secondary Cards */}
              <div className="absolute -right-8 top-1/2 transform -translate-y-1/2 bg-white/60 backdrop-blur-sm rounded-xl p-4 shadow-lg border border-white/30 floating-animation" style={{animationDelay: '1s'}}>
                <div className="text-2xl mb-2">💎</div>
                <div className="text-xs font-medium text-gray-700">Premium Quality</div>
              </div>
              
              <div className="absolute -left-8 top-1/4 bg-white/60 backdrop-blur-sm rounded-xl p-4 shadow-lg border border-white/30 floating-animation" style={{animationDelay: '2s'}}>
                <div className="text-2xl mb-2">⚡</div>
                <div className="text-xs font-medium text-gray-700">Fast Download</div>
              </div>
            </div>
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
          <div className="w-6 h-10 border-2 border-gray-400 rounded-full flex justify-center">
            <div className="w-1 h-3 bg-gray-400 rounded-full mt-2 animate-pulse"></div>
          </div>
        </div>
      </div>
    </section>
  )
}
