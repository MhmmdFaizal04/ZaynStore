'use client'

import { useState } from 'react'
import Link from 'next/link'

export default function LoginPage() {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  })
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

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

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData),
        credentials: 'include'
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Login failed')
      }

      const data = await response.json()
      
      // Store user data in localStorage
      localStorage.setItem('user', JSON.stringify(data.user))
      localStorage.setItem('token', data.token)
      
      // Redirect based on role
      if (data.user.role === 'admin') {
        window.location.href = '/admin'
      } else {
        window.location.href = '/'
      }
      
    } catch (error) {
      if (error instanceof Error) {
        setError(error.message)
      } else {
        setError('Terjadi kesalahan. Silakan coba lagi.')
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex flex-col justify-center py-8 sm:py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute top-0 left-0 w-full h-full opacity-60">
        <div className="animate-float absolute top-20 left-10 w-20 h-20 bg-blue-100 rounded-full blur-xl"></div>
        <div className="animate-float-delayed absolute top-40 right-20 w-32 h-32 bg-purple-100 rounded-full blur-xl"></div>
        <div className="animate-pulse absolute bottom-32 left-1/4 w-16 h-16 bg-indigo-100 rounded-full blur-lg"></div>
      </div>
      
      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <div className="flex justify-center animate-fade-in-up">
          <div className="relative group">
            <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300 animate-logo-bounce">
              <span className="text-white font-bold text-2xl sm:text-3xl animate-logo-rotate">Z</span>
            </div>
            <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl blur opacity-25 group-hover:opacity-40 transition duration-300"></div>
          </div>
        </div>
        <h2 className="mt-6 sm:mt-8 text-center text-3xl sm:text-4xl font-serif font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent animate-fade-in-up animation-delay-200">
          Masuk ke Akun Anda
        </h2>
        <p className="mt-3 text-center text-sm text-gray-600 animate-fade-in-up animation-delay-400">
          Atau{' '}
          <Link href="/register" className="font-medium text-blue-600 hover:text-purple-600 transition-colors duration-300 hover:underline">
            daftar akun baru
          </Link>
        </p>
      </div>

      <div className="mt-6 sm:mt-8 sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <div className="bg-white/80 backdrop-blur-sm py-8 sm:py-10 px-6 sm:px-8 lg:px-12 shadow-xl sm:shadow-2xl sm:rounded-2xl border border-white/20 animate-scale-in animation-delay-600">
          <form className="space-y-6 sm:space-y-8" onSubmit={handleSubmit}>
            {error && (
              <div className="bg-red-50/80 backdrop-blur-sm border border-red-200 text-red-600 px-4 py-3 rounded-xl text-sm animate-shake">
                {error}
              </div>
            )}

            <div className="animate-fade-in-up animation-delay-800">
              <label htmlFor="email" className="form-label">
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                className="form-input focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-300"
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
                className="form-input focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-300"
                value={formData.password}
                onChange={handleChange}
                placeholder="Masukkan password"
              />
            </div>

            <div className="animate-fade-in-up animation-delay-1200">
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white py-3 sm:py-4 px-6 rounded-xl text-sm sm:text-base font-medium shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              >
                {isLoading ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Memproses...
                  </div>
                ) : (
                  'Masuk'
                )}
              </button>
            </div>
          </form>

          <div className="mt-8 animate-fade-in-up animation-delay-1400">
            <div className="text-center">
              <Link 
                href="/" 
                className="text-sm text-gray-600 hover:text-blue-600 transition-colors duration-300 hover:underline"
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
