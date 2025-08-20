'use client'

import React, { createContext, useContext, useState, useEffect } from 'react'

interface User {
  id: number
  email: string
  name: string
  role: string
  created_at?: string
}

interface AuthContextType {
  user: User | null
  token: string | null
  login: (email: string, password: string) => Promise<void>
  logout: () => Promise<void>
  loading: boolean
  isAuthenticated: boolean
  isAdmin: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  // Check for existing authentication on mount
  useEffect(() => {
    const checkAuth = async () => {
      console.log('AuthContext: Checking authentication on mount')
      
      // Test localStorage access
      try {
        localStorage.setItem('test', 'test')
        const testValue = localStorage.getItem('test')
        console.log('AuthContext: localStorage test:', testValue)
        localStorage.removeItem('test')
      } catch (e) {
        console.error('AuthContext: localStorage not available:', e)
      }
      
      try {
        // First check localStorage for fallback
        const storedUser = localStorage.getItem('user')
        const storedToken = localStorage.getItem('token')
        console.log('Stored user:', storedUser)
        console.log('Stored token:', storedToken ? 'exists' : 'not found')

        if (storedToken) {
          // Verify token with server
          console.log('AuthContext: Verifying stored token...')
          const response = await fetch('/api/auth/me', {
            headers: {
              'Authorization': `Bearer ${storedToken}`
            }
          })

          console.log('AuthContext: Token verification response:', response.status)

          if (response.ok) {
            const data = await response.json()
            console.log('Token verification successful:', data.user)
            setUser(data.user)
            setToken(storedToken)
          } else {
            console.log('Token verification failed, trying cookie auth')
            // Token is invalid, try cookie-based auth
            await checkCookieAuth()
          }
        } else {
          console.log('No token in localStorage, trying cookie auth')
          // No token in localStorage, try cookie-based auth
          await checkCookieAuth()
        }
      } catch (error) {
        console.error('Auth check error:', error)
      } finally {
        console.log('AuthContext: Setting loading to false')
        setLoading(false)
      }
    }

    checkAuth()
  }, [])

  const checkCookieAuth = async () => {
    try {
      console.log('AuthContext: Checking cookie-based authentication')
      const response = await fetch('/api/auth/me', {
        credentials: 'include' // Include cookies
      })

      console.log('AuthContext: Cookie auth response status:', response.status)

      if (response.ok) {
        const data = await response.json()
        console.log('AuthContext: Cookie auth successful:', data.user)
        setUser(data.user)
        // Don't set token since it's in httpOnly cookie
      } else {
        console.log('AuthContext: Cookie auth failed')
      }
    } catch (error) {
      console.error('Cookie auth check error:', error)
    }
  }

  const login = async (email: string, password: string) => {
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ email, password }),
      credentials: 'include' // Include cookies
    })

    if (!response.ok) {
      let errorMessage = 'Login failed'
      try {
        const data = await response.json()
        errorMessage = data.error || errorMessage
      } catch (e) {
        console.error('Failed to parse error response:', e)
        errorMessage = `HTTP ${response.status}: ${response.statusText}`
      }
      throw new Error(errorMessage)
    }

    let data
    try {
      data = await response.json()
      console.log('Login response data:', data)
    } catch (e) {
      console.error('Failed to parse login response:', e)
      throw new Error('Invalid response from server')
    }

    console.log('Setting user in AuthContext:', data.user)
    setUser(data.user)
    
    // Store token in localStorage as fallback
    if (data.token) {
      console.log('Storing token in localStorage')
      setToken(data.token)
      localStorage.setItem('token', data.token)
      localStorage.setItem('user', JSON.stringify(data.user))
    }
  }

  const logout = async () => {
    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include'
      })
    } catch (error) {
      console.error('Logout error:', error)
    } finally {
      // Clear local state regardless of API call result
      setUser(null)
      setToken(null)
      localStorage.removeItem('token')
      localStorage.removeItem('user')
    }
  }

  const value = {
    user,
    token,
    login,
    logout,
    loading,
    isAuthenticated: !!user,
    isAdmin: user?.role === 'admin'
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
