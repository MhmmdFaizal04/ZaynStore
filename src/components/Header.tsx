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
  const [isScrolled, setIsScrolled] = useState(false)
  const router = useRouter()

  useEffect(() => {
    // Check if user is logged in
    const userData = localStorage.getItem('user')
    if (userData) {
      setUser(JSON.parse(userData))
    }

    // Handle scroll for header animation
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const handleLogout = () => {
    localStorage.removeItem('user')
    setUser(null)
    router.push('/')
  }

  return (
    <header className={`sticky top-0 z-50 transition-all duration-500 ${
      isScrolled 
        ? 'bg-white/95 backdrop-blur-md shadow-lg border-b border-gray-100 py-2' 
        : 'bg-white/90 backdrop-blur-sm shadow-sm border-b border-gray-200 py-4'
    }`}>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-14 sm:h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2 group">
            <div className="relative">
              <div className={`bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center transition-all duration-300 group-hover:scale-110 group-hover:rotate-6 shadow-lg group-hover:shadow-xl ${
                isScrolled ? 'w-8 h-8' : 'w-10 h-10'
              }`}>
                <span className={`text-white font-bold transition-all duration-300 ${
                  isScrolled ? 'text-lg' : 'text-xl'
                }`}>Z</span>
              </div>
              <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl blur opacity-0 group-hover:opacity-30 transition-opacity duration-300"></div>
            </div>
            <div className="group-hover:scale-105 transition-transform duration-300">
              <span className={`font-serif font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent transition-all duration-300 ${
                isScrolled ? 'text-lg sm:text-xl' : 'text-lg sm:text-2xl'
              }`}>
                Zayn Store
              </span>
              <div className={`text-gray-500 -mt-1 transition-all duration-300 ${
                isScrolled ? 'text-xs' : 'text-sm'
              }`}>Digital Products</div>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center space-x-6 xl:space-x-8">
            <Link 
              href="/" 
              className="text-gray-700 hover:text-blue-600 font-medium transition-all duration-300 text-sm xl:text-base relative group"
            >
              Beranda
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-blue-600 to-purple-600 group-hover:w-full transition-all duration-300"></span>
            </Link>
            <Link 
              href="/products" 
              className="text-gray-700 hover:text-blue-600 font-medium transition-all duration-300 text-sm xl:text-base relative group"
            >
              Produk
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-blue-600 to-purple-600 group-hover:w-full transition-all duration-300"></span>
            </Link>
            
            {user ? (
              <>
                {user.role === 'admin' ? (
                  <Link 
                    href="/admin" 
                    className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-4 py-2 rounded-lg font-medium hover:from-purple-700 hover:to-pink-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1 hover:scale-105 text-sm xl:text-base"
                  >
                    Admin Panel
                  </Link>
                ) : (
                  <Link 
                    href="/profile" 
                    className="text-gray-700 hover:text-blue-600 font-medium transition-all duration-300 text-sm xl:text-base relative group"
                  >
                    Pesanan Saya
                    <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-blue-600 to-purple-600 group-hover:w-full transition-all duration-300"></span>
                  </Link>
                )}
                
                <div className="flex items-center space-x-3 xl:space-x-4">
                  <div className="text-gray-600 text-sm xl:text-base hidden xl:flex items-center space-x-2">
                    <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                    <span>Halo, {user.name.length > 10 ? user.name.substring(0, 10) + '...' : user.name}</span>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-1.5 xl:px-4 xl:py-2 rounded-lg transition-all duration-300 text-sm xl:text-base hover:shadow-md transform hover:-translate-y-0.5"
                  >
                    Logout
                  </button>
                </div>
              </>
            ) : (
              <>
                <Link 
                  href="/login" 
                  className="text-gray-700 hover:text-blue-600 font-medium transition-all duration-300 text-sm xl:text-base relative group"
                >
                  Masuk
                  <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-blue-600 to-purple-600 group-hover:w-full transition-all duration-300"></span>
                </Link>
                <Link 
                  href="/register" 
                  className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-2 rounded-lg font-medium hover:from-blue-700 hover:to-purple-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1 hover:scale-105 text-sm xl:text-base"
                >
                  Daftar
                </Link>
              </>
            )}
          </nav>

          {/* Mobile menu button */}
          <button 
            className="lg:hidden p-2 rounded-lg hover:bg-gray-100 transition-all duration-300 hover:scale-110"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label="Toggle menu"
          >
            <div className="relative w-6 h-6">
              <span className={`absolute block w-full h-0.5 bg-gray-700 transform transition-all duration-300 ${
                isMenuOpen ? 'rotate-45 top-3' : 'top-1'
              }`}></span>
              <span className={`absolute block w-full h-0.5 bg-gray-700 transform transition-all duration-300 top-3 ${
                isMenuOpen ? 'opacity-0' : 'opacity-100'
              }`}></span>
              <span className={`absolute block w-full h-0.5 bg-gray-700 transform transition-all duration-300 ${
                isMenuOpen ? '-rotate-45 top-3' : 'top-5'
              }`}></span>
            </div>
          </button>
        </div>

        {/* Mobile Navigation */}
        <div className={`lg:hidden transition-all duration-500 overflow-hidden ${
          isMenuOpen ? 'max-h-96 opacity-100 pb-4' : 'max-h-0 opacity-0'
        }`}>
          <div className="border-t border-gray-200 pt-4 bg-white/90 backdrop-blur-sm rounded-lg mt-2">
            <nav className="flex flex-col space-y-2">
              <Link 
                href="/" 
                className="text-gray-700 hover:text-blue-600 font-medium py-3 px-4 rounded-lg hover:bg-blue-50 transition-all duration-300 transform hover:translate-x-2"
                onClick={() => setIsMenuOpen(false)}
              >
                Beranda
              </Link>
              <Link 
                href="/products" 
                className="text-gray-700 hover:text-blue-600 font-medium py-3 px-4 rounded-lg hover:bg-blue-50 transition-all duration-300 transform hover:translate-x-2"
                onClick={() => setIsMenuOpen(false)}
              >
                Produk
              </Link>
              
              {user ? (
                <>
                  {user.role === 'admin' ? (
                    <Link 
                      href="/admin" 
                      className="bg-gradient-to-r from-purple-600 to-pink-600 text-white py-3 px-4 rounded-lg font-medium hover:from-purple-700 hover:to-pink-700 transition-all duration-300 transform hover:translate-x-2"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Admin Panel
                    </Link>
                  ) : (
                    <Link 
                      href="/profile" 
                      className="text-gray-700 hover:text-blue-600 font-medium py-3 px-4 rounded-lg hover:bg-blue-50 transition-all duration-300 transform hover:translate-x-2"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Pesanan Saya
                    </Link>
                  )}
                  
                  <div className="pt-3 border-t border-gray-200 space-y-3">
                    <div className="text-gray-600 text-sm px-4 flex items-center space-x-2">
                      <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                      <span>Halo, {user.name}</span>
                    </div>
                    <button
                      onClick={() => {
                        handleLogout()
                        setIsMenuOpen(false)
                      }}
                      className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-3 rounded-lg transition-all duration-300 w-full text-center font-medium hover:shadow-md transform hover:-translate-y-0.5"
                    >
                      Logout
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <Link 
                    href="/login" 
                    className="text-gray-700 hover:text-blue-600 font-medium py-3 px-4 rounded-lg hover:bg-blue-50 transition-all duration-300 transform hover:translate-x-2"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Masuk
                  </Link>
                  <Link 
                    href="/register" 
                    className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 px-4 rounded-lg font-medium hover:from-blue-700 hover:to-purple-700 transition-all duration-300 text-center transform hover:translate-x-2"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Daftar
                  </Link>
                </>
              )}
            </nav>
          </div>
        </div>
      </div>
    </header>
  )
}
