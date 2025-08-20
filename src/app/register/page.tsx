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
    <div className="min-h-screen bg-gradient-to-br from-white via-gray-50 to-gray-100 flex flex-col justify-center py-8 sm:py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Subtle Background Elements */}
      <div className="absolute top-0 left-0 w-full h-full opacity-20">
        <div className="animate-float absolute top-16 right-10 w-24 h-24 bg-gray-300 rounded-full blur-xl"></div>
        <div className="animate-float-delayed absolute top-32 left-16 w-28 h-28 bg-gray-400 rounded-full blur-xl"></div>
        <div className="animate-pulse absolute bottom-20 right-1/4 w-20 h-20 bg-gray-300 rounded-full blur-lg"></div>
      </div>
      
      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <div className="flex justify-center animate-fade-in-up">
          <div className="relative group">
            <div className="w-16 h-16 sm:w-20 sm:h-20 bg-black rounded-2xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300 animate-logo-bounce">
              <span className="text-white font-bold text-2xl sm:text-3xl animate-logo-rotate">Z</span>
            </div>
            <div className="absolute -inset-1 bg-black rounded-2xl blur opacity-25 group-hover:opacity-40 transition duration-300"></div>
          </div>
        </div>
        <h2 className="mt-6 sm:mt-8 text-center text-3xl sm:text-4xl font-serif font-bold text-black animate-fade-in-up animation-delay-200">
          Create Account
        </h2>
        <p className="mt-3 text-center text-sm text-gray-600 animate-fade-in-up animation-delay-400">
          Join our premium digital collection{' '}
          <Link href="/login" className="font-medium text-black hover:text-gray-700 transition-colors duration-300 hover:underline">
            or sign in if you already have an account
          </Link>
        </p>
      </div>

      <div className="mt-6 sm:mt-8 sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <div className="bg-white/90 backdrop-blur-sm py-8 sm:py-10 px-6 sm:px-8 lg:px-12 shadow-xl sm:shadow-2xl sm:rounded-2xl border border-gray-200 animate-scale-in animation-delay-600">
          <form className="space-y-5 sm:space-y-6" onSubmit={handleSubmit}>
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm animate-shake">
                {error}
              </div>
            )}

            <div className="animate-fade-in-up animation-delay-800">
              <label htmlFor="name" className="block text-sm font-semibold text-black mb-2">
                Full Name
              </label>
              <input
                id="name"
                name="name"
                type="text"
                required
                className="w-full px-3 py-2 sm:py-3 bg-white border border-gray-300 text-black rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-black transition-all duration-300 text-sm sm:text-base placeholder-gray-400"
                value={formData.name}
                onChange={handleChange}
                placeholder="Your full name"
              />
            </div>

            <div className="animate-fade-in-up animation-delay-900">
              <label htmlFor="email" className="block text-sm font-semibold text-black mb-2">
                Email Address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                className="w-full px-3 py-2 sm:py-3 bg-white border border-gray-300 text-black rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-black transition-all duration-300 text-sm sm:text-base placeholder-gray-400"
                value={formData.email}
                onChange={handleChange}
                placeholder="your@email.com"
              />
            </div>

            <div className="animate-fade-in-up animation-delay-1000">
              <label htmlFor="password" className="block text-sm font-semibold text-black mb-2">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                className="w-full px-3 py-2 sm:py-3 bg-white border border-gray-300 text-black rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-black transition-all duration-300 text-sm sm:text-base placeholder-gray-400"
                value={formData.password}
                onChange={handleChange}
                placeholder="Strong password (6+ characters)"
              />
              <p className="mt-1 text-xs text-gray-500">Minimum 6 characters required</p>
            </div>

            <div className="animate-fade-in-up animation-delay-1100">
              <label htmlFor="confirmPassword" className="block text-sm font-semibold text-black mb-2">
                Confirm Password
              </label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                required
                className="w-full px-3 py-2 sm:py-3 bg-white border border-gray-300 text-black rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-black transition-all duration-300 text-sm sm:text-base placeholder-gray-400"
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="Repeat your password"
              />
            </div>

            <div className="animate-fade-in-up animation-delay-1200">
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-black hover:bg-gray-800 text-white py-3 sm:py-4 px-6 rounded-xl text-sm sm:text-base font-medium shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              >
                {isLoading ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Creating Account...
                  </div>
                ) : (
                  'Create Account'
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
                <span className="px-2 bg-white text-gray-500">By registering, you agree to our</span>
              </div>
            </div>

            <div className="mt-4 text-center space-x-1">
              <a href="/terms" className="text-xs text-black hover:text-gray-700 transition-colors duration-300 hover:underline">
                Terms & Conditions
              </a>
              <span className="text-xs text-gray-500">and</span>
              <a href="/privacy" className="text-xs text-black hover:text-gray-700 transition-colors duration-300 hover:underline">
                Privacy Policy
              </a>
            </div>

            <div className="mt-4 text-center">
              <Link 
                href="/" 
                className="text-sm text-gray-600 hover:text-black transition-colors duration-300 hover:underline"
              >
                ← Back to Store
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
