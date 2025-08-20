'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import Header from '@/components/Header'
import Hero from '@/components/Hero'
import ProductGrid from '@/components/ProductGrid'
import Footer from '@/components/Footer'

interface User {
  id: number
  email: string
  name: string
  role: 'admin' | 'customer'
}

export default function HomePage() {
  const [user, setUser] = useState<User | null>(null)

  useEffect(() => {
    // Check if user is logged in
    const userData = localStorage.getItem('user')
    if (userData) {
      setUser(JSON.parse(userData))
    }

    // Scroll reveal animation
    const observerOptions = {
      threshold: 0.1,
      rootMargin: '0px 0px -50px 0px'
    }

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('revealed')
        }
      })
    }, observerOptions)

    // Observe all scroll-reveal elements
    const scrollElements = document.querySelectorAll('.scroll-reveal')
    scrollElements.forEach((el) => observer.observe(el))

    return () => observer.disconnect()
  }, [])

  return (
    <main className="min-h-screen bg-gray-50">
      <Header />
      
      {/* Hero Section dengan animasi background */}
      <div className="relative">
        <Hero />
        
        {/* Decorative Elements */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
          <div className="absolute top-10 left-10 w-4 h-4 bg-gray-400 rounded-full opacity-60 animate-ping" style={{animationDelay: '0s'}}></div>
          <div className="absolute top-32 right-20 w-3 h-3 bg-gray-500 rounded-full opacity-60 animate-ping" style={{animationDelay: '1s'}}></div>
          <div className="absolute bottom-20 left-1/4 w-2 h-2 bg-gray-600 rounded-full opacity-60 animate-ping" style={{animationDelay: '2s'}}></div>
        </div>
      </div>

      {/* Products Section dengan scroll reveal */}
      <section className="py-16 sm:py-20 lg:py-24 relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute inset-0" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000000' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
            backgroundSize: '60px 60px'
          }}></div>
        </div>

        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          {/* Section Header dengan animasi */}
          <div className="text-center mb-12 sm:mb-16 scroll-reveal">
            <div className="inline-flex items-center px-4 py-2 bg-gray-100 rounded-full mb-6">
              <span className="text-sm font-medium text-black">
                Premium Digital Assets
              </span>
            </div>
            
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-serif font-bold text-gray-900 mb-6">
              Source Code
              <span className="text-black"> & Digital Assets </span>
              Premium
            </h2>
            
            <p className="text-lg sm:text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Koleksi lengkap source code website, aplikasi mobile, game assets, dan script premium 
              untuk developer dan professional.
            </p>
          </div>

          {/* ProductGrid dengan wrapper animasi */}
          <div className="scroll-reveal">
            <ProductGrid />
          </div>

          {/* CTA Section */}
          <div className="text-center mt-16 scroll-reveal">
            <div className="bg-white rounded-2xl p-8 sm:p-12 border border-gray-200 relative overflow-hidden">
              {/* Background decoration */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-gray-200 rounded-full -translate-y-16 translate-x-16 opacity-50"></div>
              <div className="absolute bottom-0 left-0 w-24 h-24 bg-gray-300 rounded-full translate-y-12 -translate-x-12 opacity-50"></div>
              
              <div className="relative z-10">
                <h3 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">
                  Ready to Start Your Project?
                </h3>
                <p className="text-gray-600 mb-8 max-w-2xl mx-auto">
                  Join thousands of developers who trust our premium collection of source codes 
                  and digital assets for their projects.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Link 
                    href="/products" 
                    className="group bg-black text-white px-8 py-4 rounded-xl font-semibold text-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 hover:scale-105"
                  >
                    <span className="flex items-center justify-center">
                      Jelajahi Product
                      <svg className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                      </svg>
                    </span>
                  </Link>
                  {!user ? (
                    <Link 
                      href="/register" 
                      className="group bg-white border-2 border-gray-300 text-gray-800 px-8 py-4 rounded-xl font-semibold text-lg hover:bg-gray-50 transition-all duration-300 hover:border-gray-400"
                    >
                      <span className="flex items-center justify-center">
                        Daftar Sekarang
                        <svg className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                        </svg>
                      </span>
                    </Link>
                  ) : (
                    <button 
                      onClick={() => alert('Anda sudah login')}
                      className="group bg-white border-2 border-gray-300 text-gray-800 px-8 py-4 rounded-xl font-semibold text-lg hover:bg-gray-50 transition-all duration-300 hover:border-gray-400"
                    >
                      <span className="flex items-center justify-center">
                        Daftar Sekarang
                        <svg className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                        </svg>
                      </span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 sm:py-20 bg-white relative">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 scroll-reveal">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Why Choose 
              <span className="text-black"> Zayn Store</span>?
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Professional platform for developers with premium source codes and digital assets
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                icon: "⚡",
                title: "Premium Quality",
                description: "High-quality source codes and applications ready to use with complete documentation"
              },
              {
                icon: "📦",
                title: "Complete Package",
                description: "ZIP files with source code, documentation, and installation guide included"
              },
              {
                icon: "🔒",
                title: "Instant Download",
                description: "Immediate access to files after payment confirmation without waiting"
              },
              {
                icon: "�",
                title: "Latest Technology",
                description: "Updated code with modern technology and comprehensive documentation"
              }
            ].map((feature, index) => (
              <div 
                key={index}
                className="scroll-reveal text-center p-6 rounded-xl hover:bg-gray-50 transition-all duration-300 group hover:-translate-y-2"
                style={{animationDelay: `${index * 0.1}s`}}
              >
                <div className="text-4xl mb-4 group-hover:scale-110 transition-transform duration-300">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                  {feature.title}
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </main>
  )
}
