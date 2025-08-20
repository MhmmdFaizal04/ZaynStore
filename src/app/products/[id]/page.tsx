'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { formatCurrency } from '@/lib/utils'
import Header from '@/components/Header'
import Footer from '@/components/Footer'

interface Product {
  id: number
  name: string
  description: string
  price: number
  image_url?: string
  category: string
  created_at: string
}

export default function ProductDetailPage({ params }: { params: { id: string } }) {
  const [product, setProduct] = useState<Product | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [user, setUser] = useState<any>(null)
  const router = useRouter()

  const fetchProduct = useCallback(async () => {
    try {
      const response = await fetch(`/api/products/${params.id}`)
      const data = await response.json()

      if (response.ok) {
        setProduct(data.product)
      } else {
        setError(data.error)
      }
    } catch (error) {
      setError('Terjadi kesalahan saat memuat produk')
    } finally {
      setLoading(false)
    }
  }, [params.id])

  useEffect(() => {
    // Check if user is logged in
    const userData = localStorage.getItem('user')
    if (userData) {
      setUser(JSON.parse(userData))
    }

    // Fetch product details
    fetchProduct()
  }, [fetchProduct])

  const handleBuyClick = () => {
    if (!user) {
      router.push('/login')
      return
    }
    
    if (product) {
      router.push(`/checkout/${product.id}`)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-4xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="animate-pulse">
                <div className="w-full h-96 bg-gray-300 rounded-lg"></div>
              </div>
              <div className="animate-pulse space-y-4">
                <div className="h-4 bg-gray-300 rounded w-1/4"></div>
                <div className="h-8 bg-gray-300 rounded w-3/4"></div>
                <div className="h-6 bg-gray-300 rounded w-1/2"></div>
                <div className="space-y-2">
                  <div className="h-4 bg-gray-300 rounded"></div>
                  <div className="h-4 bg-gray-300 rounded"></div>
                  <div className="h-4 bg-gray-300 rounded w-3/4"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    )
  }

  if (error || !product) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="container mx-auto px-4 py-16 text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Produk Tidak Ditemukan</h1>
          <p className="text-gray-600 mb-8">{error || 'Produk yang Anda cari tidak tersedia'}</p>
          <Link href="/" className="btn-primary">
            Kembali ke Beranda
          </Link>
        </div>
        <Footer />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-6xl mx-auto">
          {/* Breadcrumb */}
          <nav className="mb-8">
            <ol className="flex items-center space-x-2 text-sm text-gray-500">
              <li><Link href="/" className="hover:text-primary-600">Beranda</Link></li>
              <li>/</li>
              <li><Link href="/products" className="hover:text-primary-600">Produk</Link></li>
              <li>/</li>
              <li className="text-gray-900">{product.name}</li>
            </ol>
          </nav>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Product Image */}
            <div className="space-y-4">
              <div className="aspect-square bg-gray-100 rounded-xl overflow-hidden shadow-lg">
                {product.image_url ? (
                  <Image 
                    src={product.image_url} 
                    alt={product.name}
                    width={600}
                    height={600}
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                    priority
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400 bg-gradient-to-br from-gray-50 to-gray-100">
                    <div className="text-center">
                      <svg className="w-20 h-20 mx-auto mb-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
                      </svg>
                      <p className="text-sm text-gray-500">Preview tidak tersedia</p>
                    </div>
                  </div>
                )}
              </div>
              
              {/* Image Gallery Placeholder */}
              <div className="hidden lg:grid grid-cols-4 gap-2">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="aspect-square bg-gray-100 rounded-lg border-2 border-transparent hover:border-primary-300 transition-colors">
                    <div className="w-full h-full flex items-center justify-center text-gray-300">
                      <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
                      </svg>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Product Info */}
            <div className="space-y-8">
              {/* Header */}
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-primary-100 text-primary-800">
                    {product.category}
                  </span>
                  <span className="text-xs text-gray-500">
                    Digital Product
                  </span>
                </div>
                
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-serif font-bold text-gray-900 leading-tight">
                  {product.name}
                </h1>
                
                <div className="flex items-baseline gap-4">
                  <div className="text-2xl sm:text-3xl lg:text-4xl font-bold text-primary-600">
                    {formatCurrency(product.price)}
                  </div>
                  <div className="text-sm text-gray-500 line-through">
                    {formatCurrency(product.price * 1.5)}
                  </div>
                  <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-red-100 text-red-800">
                    33% OFF
                  </span>
                </div>
              </div>

              {/* Description */}
              <div className="prose prose-gray max-w-none">
                <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                  <svg className="w-5 h-5 mr-2 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  Deskripsi Produk
                </h3>
                <p className="text-gray-600 leading-relaxed text-base">
                  {product.description}
                </p>
              </div>

              {/* Features */}
              <div className="bg-gradient-to-r from-primary-50 to-blue-50 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <svg className="w-5 h-5 mr-2 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Yang Anda Dapatkan
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {[
                    { icon: "📁", text: "File digital dalam format ZIP" },
                    { icon: "♾️", text: "Akses download seumur hidup" },
                    { icon: "📧", text: "Link download via email" },
                    { icon: "💼", text: "Lisensi penggunaan komersial" },
                    { icon: "🔄", text: "Update gratis selamanya" },
                    { icon: "💬", text: "Customer support 24/7" }
                  ].map((feature, index) => (
                    <div key={index} className="flex items-center text-sm text-gray-700">
                      <span className="text-lg mr-3">{feature.icon}</span>
                      {feature.text}
                    </div>
                  ))}
                </div>
              </div>

              {/* Purchase Section */}
              <div className="space-y-4">
                <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-sm font-medium text-gray-700">Total</span>
                    <span className="text-2xl font-bold text-gray-900">{formatCurrency(product.price)}</span>
                  </div>
                  
                  <button
                    onClick={handleBuyClick}
                    className="w-full bg-gradient-to-r from-primary-600 to-blue-600 hover:from-primary-700 hover:to-blue-700 text-white font-semibold py-4 px-6 rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 text-lg"
                  >
                    {user ? (
                      <span className="flex items-center justify-center">
                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.5 2.5M7 13l2.5 2.5M17 21a2 2 0 100-4 2 2 0 000 4zM9 21a2 2 0 100-4 2 2 0 000 4z" />
                        </svg>
                        Beli Sekarang
                      </span>
                    ) : (
                      <span className="flex items-center justify-center">
                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                        </svg>
                        Login untuk Membeli
                      </span>
                    )}
                  </button>
                  
                  {!user && (
                    <p className="text-sm text-gray-500 text-center mt-3">
                      <Link href="/register" className="text-primary-600 hover:text-primary-500 font-medium">
                        Belum punya akun? Daftar sekarang →
                      </Link>
                    </p>
                  )}
                </div>

                {/* Security Info */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center justify-center space-x-6 text-xs text-gray-600">
                    <div className="flex items-center">
                      <svg className="w-4 h-4 mr-1 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                      </svg>
                      Pembayaran Aman
                    </div>
                    <div className="flex items-center">
                      <svg className="w-4 h-4 mr-1 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                        <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                      </svg>
                      Download Otomatis
                    </div>
                    <div className="flex items-center">
                      <svg className="w-4 h-4 mr-1 text-purple-500" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                      </svg>
                      Support 24/7
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Related Products Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-12">
          <h2 className="text-2xl sm:text-3xl font-serif font-bold text-gray-900 mb-4">
            Produk Lainnya
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Temukan produk digital lainnya yang mungkin Anda butuhkan untuk mengembangkan bisnis online Anda
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Related product cards would go here */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow duration-300">
            <div className="aspect-video bg-gradient-to-br from-primary-100 to-blue-100 flex items-center justify-center">
              <div className="text-center">
                <div className="text-3xl mb-2">🛒</div>
                <p className="text-sm text-gray-600">Template E-commerce</p>
              </div>
            </div>
            <div className="p-6">
              <h3 className="font-semibold text-gray-900 mb-2">Template E-commerce Modern</h3>
              <p className="text-sm text-gray-600 mb-4">Template website e-commerce responsive dengan fitur lengkap</p>
              <div className="flex items-center justify-between">
                <span className="text-lg font-bold text-primary-600">Rp 299.000</span>
                <button className="text-sm text-primary-600 hover:text-primary-700 font-medium">
                  Lihat Detail →
                </button>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow duration-300">
            <div className="aspect-video bg-gradient-to-br from-green-100 to-emerald-100 flex items-center justify-center">
              <div className="text-center">
                <div className="text-3xl mb-2">📚</div>
                <p className="text-sm text-gray-600">E-book Tutorial</p>
              </div>
            </div>
            <div className="p-6">
              <h3 className="font-semibold text-gray-900 mb-2">E-book Marketing Digital</h3>
              <p className="text-sm text-gray-600 mb-4">Panduan lengkap marketing digital untuk pemula hingga mahir</p>
              <div className="flex items-center justify-between">
                <span className="text-lg font-bold text-primary-600">Rp 149.000</span>
                <button className="text-sm text-primary-600 hover:text-primary-700 font-medium">
                  Lihat Detail →
                </button>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow duration-300">
            <div className="aspect-video bg-gradient-to-br from-purple-100 to-pink-100 flex items-center justify-center">
              <div className="text-center">
                <div className="text-3xl mb-2">💼</div>
                <p className="text-sm text-gray-600">Source Code</p>
              </div>
            </div>
            <div className="p-6">
              <h3 className="font-semibold text-gray-900 mb-2">Source Code CRM System</h3>
              <p className="text-sm text-gray-600 mb-4">Source code lengkap sistem CRM dengan fitur modern</p>
              <div className="flex items-center justify-between">
                <span className="text-lg font-bold text-primary-600">Rp 499.000</span>
                <button className="text-sm text-primary-600 hover:text-primary-700 font-medium">
                  Lihat Detail →
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="text-center mt-8">
          <Link 
            href="/products"
            className="inline-flex items-center px-6 py-3 bg-white border border-primary-300 rounded-lg text-primary-600 hover:bg-primary-50 transition-colors duration-300 font-medium"
          >
            Lihat Semua Produk
            <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </Link>
        </div>
      </div>

      <Footer />
    </div>
  )
}
