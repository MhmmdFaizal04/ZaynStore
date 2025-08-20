'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

interface User {
  id: number
  email: string
  name: string
  role: 'admin' | 'customer'
}

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [user, setUser] = useState<User | null>(null)
  const router = useRouter()

  useEffect(() => {
    // Check if user is logged in
    const userData = localStorage.getItem('user')
    if (userData) {
      setUser(JSON.parse(userData))
    }
  }, [])

  const handleLogout = () => {
    localStorage.removeItem('user')
    setUser(null)
    router.push('/')
  }

  return (
    <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-14 sm:h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <div className="w-7 h-7 sm:w-8 sm:h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg sm:text-xl">D</span>
            </div>
            <span className="text-lg sm:text-xl font-serif font-bold text-gray-900">
              Digital Store
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center space-x-6 xl:space-x-8">
            <Link 
              href="/" 
              className="text-gray-700 hover:text-blue-600 font-medium transition-colors text-sm xl:text-base"
            >
              Beranda
            </Link>
            <Link 
              href="/products" 
              className="text-gray-700 hover:text-blue-600 font-medium transition-colors text-sm xl:text-base"
            >
              Produk
            </Link>
            
            {user ? (
              <>
                {user.role === 'admin' ? (
                  <Link 
                    href="/admin" 
                    className="text-gray-700 hover:text-blue-600 font-medium transition-colors text-sm xl:text-base"
                  >
                    Dashboard Admin
                  </Link>
                ) : (
                  <Link 
                    href="/profile" 
                    className="text-gray-700 hover:text-blue-600 font-medium transition-colors text-sm xl:text-base"
                  >
                    Pesanan Saya
                  </Link>
                )}
                
                <div className="flex items-center space-x-3 xl:space-x-4">
                  <span className="text-gray-600 text-sm xl:text-base hidden xl:block">
                    Halo, {user.name.length > 10 ? user.name.substring(0, 10) + '...' : user.name}
                  </span>
                  <button
                    onClick={handleLogout}
                    className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-1.5 xl:px-4 xl:py-2 rounded-lg transition-colors text-sm xl:text-base"
                  >
                    Logout
                  </button>
                </div>
              </>
            ) : (
              <>
                <Link 
                  href="/login" 
                  className="text-gray-700 hover:text-blue-600 font-medium transition-colors text-sm xl:text-base"
                >
                  Masuk
                </Link>
                <Link 
                  href="/register" 
                  className="btn-primary text-sm xl:text-base"
                >
                  Daftar
                </Link>
              </>
            )}
          </nav>

          {/* Mobile menu button */}
          <button 
            className="lg:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label="Toggle menu"
          >
            <svg 
              className="w-5 h-5 sm:w-6 sm:h-6" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              {isMenuOpen ? (
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M6 18L18 6M6 6l12 12" 
                />
              ) : (
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M4 6h16M4 12h16M4 18h16" 
                />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="lg:hidden py-3 sm:py-4 border-t border-gray-200 bg-white">
            <nav className="flex flex-col space-y-3 sm:space-y-4">
              <Link 
                href="/" 
                className="text-gray-700 hover:text-blue-600 font-medium py-2 px-2 rounded-lg hover:bg-gray-50 transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                Beranda
              </Link>
              <Link 
                href="/products" 
                className="text-gray-700 hover:text-blue-600 font-medium py-2 px-2 rounded-lg hover:bg-gray-50 transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                Produk
              </Link>
              
              {user ? (
                <>
                  {user.role === 'admin' ? (
                    <Link 
                      href="/admin" 
                      className="text-gray-700 hover:text-blue-600 font-medium py-2 px-2 rounded-lg hover:bg-gray-50 transition-colors"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Dashboard Admin
                    </Link>
                  ) : (
                    <Link 
                      href="/profile" 
                      className="text-gray-700 hover:text-blue-600 font-medium py-2 px-2 rounded-lg hover:bg-gray-50 transition-colors"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Pesanan Saya
                    </Link>
                  )}
                  
                  <div className="pt-2 border-t border-gray-200 space-y-3">
                    <p className="text-gray-600 text-sm px-2">Halo, {user.name}</p>
                    <button
                      onClick={() => {
                        handleLogout()
                        setIsMenuOpen(false)
                      }}
                      className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg transition-colors w-full text-center font-medium"
                    >
                      Logout
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <Link 
                    href="/login" 
                    className="text-gray-700 hover:text-blue-600 font-medium py-2 px-2 rounded-lg hover:bg-gray-50 transition-colors"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Masuk
                  </Link>
                  <Link 
                    href="/register" 
                    className="btn-primary inline-block text-center font-medium"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Daftar
                  </Link>
                </>
              )}
            </nav>
          </div>
        )}
      </div>
    </header>
  )
}
