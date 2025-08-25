'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'

interface User {
  id: number
  email: string
  name: string
  role: 'admin' | 'customer'
}

interface Announcement {
  id: number
  title: string
  content: string
  created_at: string
  created_by_name: string
}

export default function Hero() {
  const [user, setUser] = useState<User | null>(null)
  const [isVisible, setIsVisible] = useState(false)
  const [announcements, setAnnouncements] = useState<Announcement[]>([])
  const [currentSlide, setCurrentSlide] = useState(0)

  useEffect(() => {
    // Check if user is logged in
    const userData = localStorage.getItem('user')
    if (userData) {
      setUser(JSON.parse(userData))
      fetchAnnouncements()
    }
    
    setIsVisible(true)
  }, [])

  useEffect(() => {
    // Auto slide announcements if there are multiple
    if (announcements.length > 1) {
      const interval = setInterval(() => {
        setCurrentSlide((prev) => (prev + 1) % announcements.length)
      }, 5000)
      
      return () => clearInterval(interval)
    }
  }, [announcements.length])

  const fetchAnnouncements = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch('/api/announcements', {
        headers: {
          'Authorization': token ? `Bearer ${token}` : ''
        },
        credentials: 'include'
      })

      if (response.ok) {
        const data = await response.json()
        // Filter only board-type announcements for the Hero section
        const boardAnnouncements = (data.announcements || []).filter((ann: any) => ann.type === 'board')
        setAnnouncements(boardAnnouncements)
      }
    } catch (error) {
      console.error('Error fetching announcements:', error)
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

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

          {/* Right Content - Information Board */}
          <div className={`transition-all duration-1000 delay-500 ${
            isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-10'
          }`}>
            {user ? (
              <div className="relative">
                {/* Information Board */}
                <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-6">
                  <div className="flex items-center mb-6">
                    <div className="bg-blue-600 p-2 rounded-lg">
                      <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
                      </svg>
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 ml-3">
                      Papan Informasi
                    </h3>
                  </div>
                  
                  {announcements.length > 0 ? (
                    <div className="space-y-4">
                      <div className="border border-gray-200 rounded-lg p-4">
                        <h4 className="text-lg font-semibold text-gray-900 mb-2">
                          {announcements[currentSlide]?.title}
                        </h4>
                        <p className="text-gray-700 leading-relaxed mb-3">
                          {announcements[currentSlide]?.content}
                        </p>
                        <div className="flex items-center justify-between text-sm text-gray-500 border-t pt-3">
                          <span className="font-medium">Oleh: {announcements[currentSlide]?.created_by_name}</span>
                          <span>{formatDate(announcements[currentSlide]?.created_at)}</span>
                        </div>
                      </div>
                      
                      {/* Simple navigation for multiple announcements */}
                      {announcements.length > 1 && (
                        <div className="flex items-center justify-between">
                          <button
                            onClick={() => setCurrentSlide(currentSlide === 0 ? announcements.length - 1 : currentSlide - 1)}
                            className="flex items-center px-3 py-1 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded transition-colors"
                          >
                            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                            </svg>
                            Sebelumnya
                          </button>
                          
                          <div className="flex space-x-1">
                            {announcements.map((_, index) => (
                              <button
                                key={index}
                                onClick={() => setCurrentSlide(index)}
                                className={`w-2 h-2 rounded-full transition-colors ${
                                  index === currentSlide ? 'bg-blue-600' : 'bg-gray-300'
                                }`}
                              />
                            ))}
                          </div>

                          <button
                            onClick={() => setCurrentSlide(currentSlide === announcements.length - 1 ? 0 : currentSlide + 1)}
                            className="flex items-center px-3 py-1 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded transition-colors"
                          >
                            Selanjutnya
                            <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                          </button>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <div className="bg-gray-100 rounded-lg w-12 h-12 flex items-center justify-center mx-auto mb-3">
                        <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
                        </svg>
                      </div>
                      <p className="text-gray-600 font-medium">Belum ada pengumuman</p>
                      <p className="text-gray-500 text-sm">Pengumuman terbaru akan muncul di sini</p>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              /* Default features for non-logged users */
              <div className="relative">
                {/* Default Feature Card */}
                <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-xl border border-gray-200 hover:shadow-2xl transition-all duration-300 hover:-translate-y-2">
                  <div className="text-center space-y-6">
                    <div className="text-6xl animate-bounce">💎</div>
                    <h3 className="text-2xl font-bold text-black">
                      Kualitas Premium
                    </h3>
                    <p className="text-gray-600 text-lg">
                      Produk digital berkualitas tinggi untuk kebutuhan profesional Anda
                    </p>
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
            )}
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
