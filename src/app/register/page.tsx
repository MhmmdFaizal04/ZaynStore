'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    if (formData.password !== formData.confirmPassword) {
      setError('Password dan konfirmasi password tidak cocok')
      setIsLoading(false)
      return
    }

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          password: formData.password
        })
      })

      const data = await response.json()

      if (response.ok) {
        // Store user data in localStorage
        localStorage.setItem('user', JSON.stringify(data.user))
        router.push('/')
      } else {
        setError(data.error)
      }
    } catch (error) {
      setError('Terjadi kesalahan. Silakan coba lagi.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 flex flex-col justify-center py-8 sm:py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute top-0 left-0 w-full h-full opacity-60">
        <div className="animate-float absolute top-16 right-10 w-24 h-24 bg-purple-100 rounded-full blur-xl"></div>
        <div className="animate-float-delayed absolute top-32 left-16 w-28 h-28 bg-blue-100 rounded-full blur-xl"></div>
        <div className="animate-pulse absolute bottom-20 right-1/4 w-20 h-20 bg-indigo-100 rounded-full blur-lg"></div>
      </div>
      
      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <div className="flex justify-center animate-fade-in-up">
          <div className="relative group">
            <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-r from-purple-600 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300 animate-logo-bounce">
              <span className="text-white font-bold text-2xl sm:text-3xl animate-logo-rotate">Z</span>
            </div>
            <div className="absolute -inset-1 bg-gradient-to-r from-purple-600 to-blue-600 rounded-2xl blur opacity-25 group-hover:opacity-40 transition duration-300"></div>
          </div>
        </div>
        <h2 className="mt-6 sm:mt-8 text-center text-3xl sm:text-4xl font-serif font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent animate-fade-in-up animation-delay-200">
          Buat Akun Baru
        </h2>
        <p className="mt-3 text-center text-sm text-gray-600 animate-fade-in-up animation-delay-400">
          Atau{' '}
          <Link href="/login" className="font-medium text-purple-600 hover:text-blue-600 transition-colors duration-300 hover:underline">
            masuk ke akun yang sudah ada
          </Link>
        </p>
      </div>

      <div className="mt-6 sm:mt-8 sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <div className="bg-white/80 backdrop-blur-sm py-8 sm:py-10 px-6 sm:px-8 lg:px-12 shadow-xl sm:shadow-2xl sm:rounded-2xl border border-white/20 animate-scale-in animation-delay-600">
          <form className="space-y-5 sm:space-y-6" onSubmit={handleSubmit}>
            {error && (
              <div className="bg-red-50/80 backdrop-blur-sm border border-red-200 text-red-600 px-4 py-3 rounded-xl text-sm animate-shake">
                {error}
              </div>
            )}

            <div className="animate-fade-in-up animation-delay-800">
              <label htmlFor="name" className="form-label">
                Nama Lengkap
              </label>
              <input
                id="name"
                name="name"
                type="text"
                required
                className="form-input focus:ring-4 focus:ring-purple-500/20 focus:border-purple-500 transition-all duration-300"
                value={formData.name}
                onChange={handleChange}
                placeholder="Masukkan nama lengkap"
              />
            </div>

            <div className="animate-fade-in-up animation-delay-900">
              <label htmlFor="email" className="form-label">
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                className="form-input focus:ring-4 focus:ring-purple-500/20 focus:border-purple-500 transition-all duration-300"
                value={formData.email}
                onChange={handleChange}
                placeholder="your@email.com"
              />
            </div>

            <div className="animate-fade-in-up animation-delay-1000">
              <label htmlFor="password" className="form-label">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                className="form-input focus:ring-4 focus:ring-purple-500/20 focus:border-purple-500 transition-all duration-300"
                value={formData.password}
                onChange={handleChange}
                placeholder="Minimal 6 karakter"
              />
              <p className="mt-1 text-xs text-gray-500">Minimal 6 karakter</p>
            </div>

            <div className="animate-fade-in-up animation-delay-1100">
              <label htmlFor="confirmPassword" className="form-label">
                Konfirmasi Password
              </label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                required
                className="form-input focus:ring-4 focus:ring-purple-500/20 focus:border-purple-500 transition-all duration-300"
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="Ulangi password"
              />
            </div>

            <div className="animate-fade-in-up animation-delay-1200">
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white py-3 sm:py-4 px-6 rounded-xl text-sm sm:text-base font-medium shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              >
                {isLoading ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Memproses...
                  </div>
                ) : (
                  'Daftar'
                )}
              </button>
            </div>
          </form>

          <div className="mt-8 animate-fade-in-up animation-delay-1400">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-xs sm:text-sm">
                <span className="px-2 bg-white text-gray-500">Dengan mendaftar, Anda menyetujui</span>
              </div>
            </div>

            <div className="mt-4 text-center space-x-1">
              <a href="/terms" className="text-xs text-purple-600 hover:text-blue-600 transition-colors duration-300 hover:underline">
                Syarat & Ketentuan
              </a>
              <span className="text-xs text-gray-500">dan</span>
              <a href="/privacy" className="text-xs text-purple-600 hover:text-blue-600 transition-colors duration-300 hover:underline">
                Kebijakan Privasi
              </a>
            </div>

            <div className="mt-4 text-center">
              <Link 
                href="/" 
                className="text-sm text-gray-600 hover:text-purple-600 transition-colors duration-300 hover:underline"
              >
                ← Kembali ke Beranda
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
