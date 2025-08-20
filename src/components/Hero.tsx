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
    { icon: "💎", title: "Kualitas Premium", desc: "Produk digital berkualitas" },
    { icon: "📦", title: "Paket Lengkap", desc: "Dokumentasi disertakan" },
    { icon: "⚡", title: "Akses Instan", desc: "Download langsung" }
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
      setCurrentSlide((prev) => (prev + 1) % features.length)
    }, 3000)
    
    return () => clearInterval(interval)
  }, [features.length])

  return (
    <section className="relative overflow-hidden bg-white min-h-screen flex items-center">
      {/* Subtle Background Elements */}
      <div className="absolute inset-0 overflow-hidden opacity-30">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gray-200 rounded-full filter blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gray-300 rounded-full filter blur-3xl animate-pulse" style={{animationDelay: '2s'}}></div>
      </div>

      <div className="relative z-10 container mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <div className={`space-y-8 transition-all duration-1000 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
          }`}>
            <div className="space-y-6">
              <div className="inline-flex items-center px-4 py-2 bg-white/80 backdrop-blur-sm rounded-full border border-gray-200 shadow-sm">
                <span className="w-2 h-2 bg-black rounded-full mr-2 animate-pulse"></span>
                <span className="text-sm font-medium text-gray-700">✨ Premium Digital Store</span>
              </div>
              
              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-serif font-bold leading-tight">
                <span className="block text-black fade-in-up">Premium</span>
                <span className="block text-black fade-in-up" style={{animationDelay: '0.2s'}}>
                  Cheat
                </span>
                <span className="block text-gray-600 fade-in-up" style={{animationDelay: '0.4s'}}>Murah</span>
              </h1>
              
              <p className="text-base sm:text-lg lg:text-xl text-gray-600 leading-relaxed fade-in-up" style={{animationDelay: '0.6s'}}>
                Temukan koleksi produk digital berkualitas tinggi kami. 
                Solusi profesional untuk kebutuhan modern. <span className="font-semibold text-black">Download instan terjamin.</span>
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 fade-in-up" style={{animationDelay: '0.8s'}}>
                <Link 
                  href="/products" 
                  className="group bg-black text-white px-8 py-4 rounded-xl font-semibold text-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
                >
                  <span className="flex items-center justify-center">
                    Jelajahi Koleksi
                    <svg className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                    </svg>
                  </span>
                </Link>
                
                {!user ? (
                  <Link 
                    href="/register" 
                    className="group bg-white border-2 border-black text-black px-8 py-4 rounded-xl font-semibold text-lg shadow-md hover:shadow-lg transition-all duration-300 hover:bg-gray-50"
                  >
                    <span className="flex items-center justify-center">
                      Daftar Sekarang
                      <svg className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                      </svg>
                    </span>
                  </Link>
                ) : (
                  <button 
                    onClick={() => alert('Anda sudah login')}
                    className="group bg-white border-2 border-black text-black px-8 py-4 rounded-xl font-semibold text-lg shadow-md hover:shadow-lg transition-all duration-300 hover:bg-gray-50"
                  >
                    <span className="flex items-center justify-center">
                      Daftar Sekarang
                      <svg className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                      </svg>
                    </span>
                  </button>
                )}
              
              {user && user.role === 'customer' && (
                <Link 
                  href="/profile" 
                  className="group bg-white border-2 border-black text-black px-8 py-4 rounded-xl font-semibold text-lg shadow-md hover:shadow-lg transition-all duration-300 hover:bg-gray-50"
                >
                  <span className="flex items-center justify-center">
                    Download Saya
                    <svg className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                    </svg>
                  </span>
                </Link>
              )}
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-6 pt-8 border-t border-gray-200 fade-in-up" style={{animationDelay: '1s'}}>
              <div className="text-center group hover:scale-105 transition-transform duration-300">
                <div className="text-2xl sm:text-3xl lg:text-4xl font-bold text-black mb-2">500+</div>
                <div className="text-sm text-gray-500">Produk</div>
              </div>
              <div className="text-center group hover:scale-105 transition-transform duration-300">
                <div className="text-2xl sm:text-3xl lg:text-4xl font-bold text-black mb-2">2K+</div>
                <div className="text-sm text-gray-500">Pelanggan</div>
              </div>
              <div className="text-center group hover:scale-105 transition-transform duration-300">
                <div className="text-2xl sm:text-3xl lg:text-4xl font-bold text-black mb-2">24/7</div>
                <div className="text-sm text-gray-500">Dukungan</div>
              </div>
            </div>
          </div>

          {/* Right Content - Animated Features */}
          <div className={`transition-all duration-1000 delay-500 ${
            isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-10'
          }`}>
            <div className="relative">
              {/* Main Feature Card */}
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-xl border border-gray-200 hover:shadow-2xl transition-all duration-300 hover:-translate-y-2">
                <div className="text-center space-y-6">
                  <div className="text-6xl animate-bounce">
                    {features[currentSlide].icon}
                  </div>
                  <h3 className="text-2xl font-bold text-black">
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
                            ? 'bg-black scale-125' 
                            : 'bg-gray-300 hover:bg-gray-400'
                        }`}
                      />
                    ))}
                  </div>
                </div>
              </div>

              {/* Floating Elements */}
              <div className="absolute -top-4 -right-4 w-20 h-20 bg-gray-300 rounded-full opacity-50 animate-ping"></div>
              <div className="absolute -bottom-4 -left-4 w-16 h-16 bg-gray-400 rounded-full opacity-30 animate-pulse"></div>
              
              {/* Secondary Cards */}
              <div className="absolute -right-8 top-1/2 transform -translate-y-1/2 bg-white/90 backdrop-blur-sm rounded-xl p-4 shadow-lg border border-gray-200 floating-animation" style={{animationDelay: '1s'}}>
                <div className="text-2xl mb-2">📱</div>
                <div className="text-xs font-medium text-gray-700">Aplikasi</div>
              </div>
              
              <div className="absolute -left-8 top-1/4 bg-white/90 backdrop-blur-sm rounded-xl p-4 shadow-lg border border-gray-200 floating-animation" style={{animationDelay: '2s'}}>
                <div className="text-2xl mb-2">🎨</div>
                <div className="text-xs font-medium text-gray-700">Desain</div>
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
