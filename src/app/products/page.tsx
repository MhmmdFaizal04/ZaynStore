'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
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

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('')
  const [sortBy, setSortBy] = useState('newest')

  const categories = [
    'All',
    'Web Template',
    'UI Kit',
    'Logo',
    'Icon',
    'Photo',
    'Video',
    'Audio',
    'Document'
  ]

  useEffect(() => {
    fetchProducts()
  }, [selectedCategory, searchTerm, sortBy])

  const fetchProducts = async () => {
    try {
      setLoading(true)
      
      const params = new URLSearchParams()
      if (selectedCategory && selectedCategory !== 'All') {
        params.append('category', selectedCategory)
      }
      if (searchTerm) {
        params.append('search', searchTerm)
      }
      params.append('limit', '50') // Show more products on dedicated page
      
      const response = await fetch(`/api/products?${params.toString()}`)
      const data = await response.json()
      
      if (response.ok) {
        let sortedProducts = data.products || []
        
        // Sort products
        switch (sortBy) {
          case 'price-low':
            sortedProducts.sort((a: Product, b: Product) => a.price - b.price)
            break
          case 'price-high':
            sortedProducts.sort((a: Product, b: Product) => b.price - a.price)
            break
          case 'name':
            sortedProducts.sort((a: Product, b: Product) => a.name.localeCompare(b.name))
            break
          case 'newest':
          default:
            sortedProducts.sort((a: Product, b: Product) => 
              new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
            )
            break
        }
        
        setProducts(sortedProducts)
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

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    fetchProducts()
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      {/* Hero Section */}
      <section className="bg-white py-8 sm:py-12">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-serif font-bold text-black mb-3 sm:mb-4">
              Jelajahi Produk
            </h1>
            <p className="text-base sm:text-lg lg:text-xl text-gray-600 max-w-xl lg:max-w-2xl mx-auto leading-relaxed">
              Temukan berbagai file digital berkualitas tinggi untuk kebutuhan kreatif dan bisnis Anda
            </p>
          </div>
        </div>
      </section>

      {/* Filters Section */}
      <section className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
          <div className="flex flex-col lg:flex-row gap-3 sm:gap-4 items-center justify-between">
            {/* Search */}
            <form onSubmit={handleSearch} className="w-full lg:flex-1 lg:max-w-md">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Cari produk..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-9 sm:pl-10 pr-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-black text-sm sm:text-base"
                />
                <div className="absolute inset-y-0 left-0 pl-2.5 sm:pl-3 flex items-center pointer-events-none">
                  <svg className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
              </div>
            </form>

            {/* Category Filter & Sort */}
            <div className="flex flex-col sm:flex-row items-center gap-3 sm:gap-4 w-full lg:w-auto">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full sm:w-auto px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-black text-sm sm:text-base"
              >
                {categories.map((category) => (
                  <option key={category} value={category === 'All' ? '' : category}>
                    {category}
                  </option>
                ))}
              </select>

              {/* Sort */}
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full sm:w-auto px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-black text-sm sm:text-base"
              >
                <option value="newest">Terbaru</option>
                <option value="name">Nama A-Z</option>
                <option value="price-low">Harga Terendah</option>
                <option value="price-high">Harga Tertinggi</option>
              </select>
            </div>
          </div>
        </div>
      </section>

      {/* Products Grid */}
      <section className="py-8 sm:py-12">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          {/* Results Info */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 sm:mb-8 gap-2">
            <h2 className="text-xl sm:text-2xl font-serif font-bold text-gray-900">
              {searchTerm ? `Hasil pencarian "${searchTerm}"` : 
               selectedCategory && selectedCategory !== 'All' ? `Kategori ${selectedCategory}` : 
               'Semua Produk'}
            </h2>
            <p className="text-sm sm:text-base text-gray-600">
              {loading ? 'Memuat...' : `${products.length} produk ditemukan`}
            </p>
          </div>

          {/* Loading State */}
          {loading && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {[...Array(12)].map((_, index) => (
                <div key={index} className="card animate-pulse">
                  <div className="w-full h-48 bg-gray-300 rounded-lg mb-4"></div>
                  <div className="h-4 bg-gray-300 rounded mb-2"></div>
                  <div className="h-3 bg-gray-300 rounded mb-4"></div>
                  <div className="h-4 bg-gray-300 rounded w-1/2"></div>
                </div>
              ))}
            </div>
          )}

          {/* Error State */}
          {error && (
            <div className="text-center py-12">
              <div className="text-red-600 mb-4">{error}</div>
              <button 
                onClick={fetchProducts}
                className="btn-primary"
              >
                Coba Lagi
              </button>
            </div>
          )}

          {/* Empty State */}
          {!loading && !error && products.length === 0 && (
            <div className="text-center py-12">
              <div className="text-gray-500 mb-4">
                {searchTerm || selectedCategory ? 
                  'Tidak ada produk yang sesuai dengan filter Anda.' :
                  'Belum ada produk yang tersedia.'
                }
              </div>
              {(searchTerm || selectedCategory) && (
                <button 
                  onClick={() => {
                    setSearchTerm('')
                    setSelectedCategory('')
                  }}
                  className="btn-secondary"
                >
                  Reset Filter
                </button>
              )}
            </div>
          )}

          {/* Products Grid */}
          {!loading && !error && products.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {products.map((product) => (
                <div 
                  key={product.id} 
                  className="card hover:shadow-lg transition-shadow duration-300 group"
                >
                  {/* Product Image */}
                  <div className="relative w-full h-48 mb-4 bg-gray-100 rounded-lg overflow-hidden">
                    {product.image_url ? (
                      <img 
                        src={product.image_url} 
                        alt={product.name}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none'
                          const placeholder = e.currentTarget.nextElementSibling as HTMLElement
                          if (placeholder) {
                            placeholder.style.display = 'flex'
                          }
                        }}
                      />
                    ) : null}
                    <div className="w-full h-full flex items-center justify-center text-gray-400" style={{display: product.image_url ? 'none' : 'flex'}}>
                      <svg className="w-16 h-16" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
                      </svg>
                    </div>
                    {/* Overlay */}
                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100">
                      <Link 
                        href={`/products/${product.id}`}
                        className="btn-primary"
                      >
                        Lihat Detail
                      </Link>
                    </div>
                  </div>

                  {/* Product Info */}
                  <div className="flex-1">
                    <div className="text-xs text-black font-medium mb-1">
                      {product.category}
                    </div>
                    <h3 className="font-serif font-semibold text-gray-900 mb-2 line-clamp-2">
                      {product.name}
                    </h3>
                    <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                      {product.description}
                    </p>
                    <div className="flex items-center justify-between">
                      <div className="text-lg font-bold text-black">
                        {formatPrice(product.price)}
                      </div>
                      <Link 
                        href={`/products/${product.id}`}
                        className="text-sm text-gray-500 hover:text-black transition-colors"
                      >
                        Detail →
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      <Footer />
    </div>
  )
}
