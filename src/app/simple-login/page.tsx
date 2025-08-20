'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function SimpleLoginPage() {
  const [formData, setFormData] = useState({
    email: 'admin@digitalstore.com',
    password: 'admin123'
  })
  const [status, setStatus] = useState('')
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setStatus('Attempting login...')

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData),
        credentials: 'include'
      })

      setStatus(`Response status: ${response.status}`)

      if (response.ok) {
        const data = await response.json()
        setStatus(`Login successful! User: ${data.user.name}, Role: ${data.user.role}`)
        
        // Store in localStorage
        localStorage.setItem('user', JSON.stringify(data.user))
        localStorage.setItem('token', data.token)
        
        setStatus('Redirecting to admin...')
        
        // Force redirect
        setTimeout(() => {
          window.location.href = '/admin'
        }, 1000)
        
      } else {
        const data = await response.json()
        setStatus(`Login failed: ${data.error}`)
      }
    } catch (error) {
      setStatus(`Error: ${error}`)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        <h1 className="text-2xl font-bold mb-6 text-center">Simple Admin Login</h1>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
              className="w-full p-3 border border-gray-300 rounded-lg"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Password
            </label>
            <input
              type="password"
              value={formData.password}
              onChange={(e) => setFormData({...formData, password: e.target.value})}
              className="w-full p-3 border border-gray-300 rounded-lg"
              required
            />
          </div>
          
          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700"
          >
            Login as Admin
          </button>
        </form>
        
        <div className="mt-6 p-4 bg-gray-100 rounded-lg">
          <h3 className="font-medium text-gray-700 mb-2">Status:</h3>
          <p className="text-sm text-gray-600">{status || 'Ready to login'}</p>
        </div>
        
        <div className="mt-4 space-y-2">
          <button
            onClick={() => {
              localStorage.clear()
              setStatus('LocalStorage cleared')
            }}
            className="w-full bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-700"
          >
            Clear Storage
          </button>
          
          <button
            onClick={() => {
              window.location.href = '/admin'
            }}
            className="w-full bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700"
          >
            Go to Admin (Test)
          </button>
        </div>
      </div>
    </div>
  )
}
