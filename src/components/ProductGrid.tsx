'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'

interface Product {
  id: number
  name: string
  description: string
  price: number
  image_url?: string
  category: string
  created_at: string
}

export default function ProductGrid() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchProducts()
  }, [])

  const fetchProducts = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/products?limit=12')
      const data = await response.json()
      
      if (response.ok) {
        setProducts(data.products || [])
      } else {
        setError(data.error || 'Gagal memuat produk')
      }
    } catch (error) {
      console.error('Error fetching products:', error)
      setError('Terjadi kesalahan saat memuat produk')
    } finally {
      setLoading(false)
    }
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR'
    }).format(price)
  }

  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
        {[...Array(8)].map((_, index) => (
          <div 
            key={index} 
            className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6 animate-pulse"
            style={{animationDelay: `${index * 0.1}s`}}
          >
            <div className="aspect-square bg-gray-200 rounded-lg mb-4 relative overflow-hidden">
              <div className="absolute inset-0 bg-gray-300 animate-pulse"></div>
            </div>
            <div className="space-y-3">
              <div className="h-4 bg-gray-200 rounded relative overflow-hidden">
                <div className="absolute inset-0 bg-gray-300 animate-pulse"></div>
              </div>
              <div className="h-3 bg-gray-200 rounded w-3/4 relative overflow-hidden">
                <div className="absolute inset-0 bg-gray-300 animate-pulse"></div>
              </div>
              <div className="h-4 bg-gray-200 rounded w-1/2 relative overflow-hidden">
                <div className="absolute inset-0 bg-gray-300 animate-pulse"></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-8 sm:py-12 px-4">
        <div className="text-red-600 mb-4 text-sm sm:text-base">{error}</div>
        <button 
          onClick={fetchProducts}
          className="btn-primary"
        >
          Coba Lagi
        </button>
      </div>
    )
  }

  if (products.length === 0) {
    return (
      <div className="text-center py-8 sm:py-12 px-4">
        <div className="text-gray-500 mb-4 text-sm sm:text-base">
          Belum ada produk yang tersedia.
        </div>
        <p className="text-xs sm:text-sm text-gray-400">
          Admin belum menambahkan produk ke dalam sistem.
        </p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
      {products.map((product, index) => (
        <div 
          key={product.id} 
          className="card hover:shadow-xl transition-all duration-500 group hover:-translate-y-2 fade-in-up"
          style={{animationDelay: `${index * 0.1}s`}}
        >
          {/* Product Image */}
          <div className="relative w-full h-40 sm:h-48 mb-3 sm:mb-4 bg-gray-100 rounded-lg overflow-hidden">
            {product.image_url ? (
              <Image 
                src={product.image_url} 
                alt={product.name}
                width={300}
                height={200}
                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                onError={(e) => {
                  // Fallback ke placeholder jika gambar gagal load
                  e.currentTarget.style.display = 'none'
                  const placeholder = e.currentTarget.nextElementSibling as HTMLElement
                  if (placeholder) {
                    placeholder.style.display = 'flex'
                  }
                }}
              />
            ) : null}
            <div className="w-full h-full flex items-center justify-center text-gray-400" style={{display: product.image_url ? 'none' : 'flex'}}>
              <svg className="w-12 h-12 sm:w-16 sm:h-16" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
              </svg>
            </div>
            {/* Overlay - Hidden on mobile, shown on hover for desktop */}
            <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-300 hidden sm:flex items-center justify-center opacity-0 group-hover:opacity-100">
              <Link 
                href={`/products/${product.id}`}
                className="bg-white text-gray-900 px-4 py-2 rounded-lg font-medium hover:bg-gray-100 transition-all duration-300 transform scale-90 group-hover:scale-100"
              >
                Lihat Detail
              </Link>
            </div>
            
            {/* Category Badge */}
            <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-full">
              <span className="text-xs font-medium text-black">{product.category}</span>
            </div>
          </div>

          {/* Product Info */}
          <div className="flex-1">
            <h3 className="font-serif font-semibold text-gray-900 mb-2 line-clamp-2 text-sm sm:text-base leading-tight group-hover:text-black transition-colors duration-300">
              {product.name}
            </h3>
            <p className="text-xs sm:text-sm text-gray-600 mb-3 sm:mb-4 line-clamp-2 leading-relaxed">
              {product.description}
            </p>
            <div className="flex items-center justify-between">
              <div className="text-base sm:text-lg font-bold text-black">
                {formatPrice(product.price)}
              </div>
              <Link 
                href={`/products/${product.id}`}
                className="text-xs sm:text-sm text-gray-500 hover:text-black transition-all duration-300 font-medium group-hover:translate-x-1"
              >
                Detail →
              </Link>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
