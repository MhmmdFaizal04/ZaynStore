'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

interface User {
  id: number
  email: string
  name: string
  role: 'admin' | 'customer'
}

interface Transaction {
  id: number
  product_name: string
  amount: number
  status: 'pending' | 'approved' | 'rejected'
  payment_proof: string
  download_link: string | null
  product_file_url: string
  created_at: string
}

export default function ProfilePage() {
  const [user, setUser] = useState<User | null>(null)
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('orders')
  const [notifications, setNotifications] = useState<any[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const router = useRouter()

  useEffect(() => {
    // Check if user is logged in
    const userData = localStorage.getItem('user')
    if (!userData) {
      router.push('/login')
      return
    }

    const parsedUser = JSON.parse(userData)
    setUser(parsedUser)
    fetchUserTransactions(parsedUser.id)
    fetchNotifications()

    // Auto refresh notifications every 30 seconds
    const interval = setInterval(fetchNotifications, 30000)
    return () => clearInterval(interval)
  }, [router])

  const fetchUserTransactions = async (userId: number) => {
    try {
      const response = await fetch(`/api/transactions?userId=${userId}`)
      const data = await response.json()
      setTransactions(data.transactions || [])
    } catch (error) {
      console.error('Error fetching transactions:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchNotifications = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch('/api/notifications', {
        headers: {
          'Authorization': token ? `Bearer ${token}` : ''
        },
        credentials: 'include'
      })

      if (response.ok) {
        const data = await response.json()
        setNotifications(data.notifications || [])
        setUnreadCount(data.unread_count || 0)
      }
    } catch (error) {
      console.error('Error fetching notifications:', error)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('user')
    router.push('/')
  }

  const handleDownload = async (transactionId: number, downloadLink: string) => {
    try {
      // In real implementation, this would download from Vercel Blob
      window.open(downloadLink, '_blank')
    } catch (error) {
      console.error('Error downloading file:', error)
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR'
    }).format(amount)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return 'bg-green-100 text-green-800'
      case 'pending':
        return 'bg-yellow-100 text-yellow-800'
      case 'rejected':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'approved':
        return 'Disetujui'
      case 'pending':
        return 'Menunggu Konfirmasi'
      case 'rejected':
        return 'Ditolak'
      default:
        return status
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50 flex items-center justify-center">
        <div className="text-center animate-fade-in">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-600 via-purple-600 to-blue-800 rounded-2xl flex items-center justify-center shadow-2xl mb-6 mx-auto animate-bounce">
            <span className="text-white font-bold text-2xl bg-gradient-to-r from-white to-blue-100 bg-clip-text text-transparent">Z</span>
          </div>
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-transparent border-t-blue-600 border-r-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600 animate-pulse">Memuat data profil...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50 animate-gradient">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md shadow-sm border-b border-gray-200 sticky top-0 z-50 animate-slide-down">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-3 sm:py-4">
            <div className="flex items-center space-x-2 sm:space-x-4">
              <Link href="/" className="flex items-center space-x-2 group">
                <div className="w-7 h-7 sm:w-8 sm:h-8 bg-gradient-to-br from-blue-600 via-purple-600 to-blue-800 rounded-xl flex items-center justify-center shadow-lg transform group-hover:scale-110 group-hover:rotate-12 transition-all duration-300 group-hover:shadow-blue-500/25 animate-float">
                  <span className="text-white font-bold text-lg sm:text-xl bg-gradient-to-r from-white to-blue-100 bg-clip-text text-transparent">Z</span>
                </div>
                <div className="hidden sm:block">
                  <span className="text-lg sm:text-xl font-serif font-bold bg-gradient-to-r from-gray-900 via-blue-800 to-purple-800 bg-clip-text text-transparent group-hover:from-blue-600 group-hover:via-purple-600 group-hover:to-blue-800 transition-all duration-300">
                    Zayn
                  </span>
                  <span className="text-lg sm:text-xl font-serif font-bold text-gray-600 ml-1 group-hover:text-blue-600 transition-colors duration-300">
                    Store
                  </span>
                </div>
                <div className="sm:hidden">
                  <span className="text-lg font-serif font-bold bg-gradient-to-r from-gray-900 via-blue-800 to-purple-800 bg-clip-text text-transparent group-hover:from-blue-600 group-hover:via-purple-600 group-hover:to-blue-800 transition-all duration-300">
                    ZaynStore
                  </span>
                </div>
              </Link>
            </div>
            <div className="flex items-center space-x-2 sm:space-x-4">
              <span className="text-gray-600 text-sm sm:text-base hidden md:block">Halo, {user?.name}</span>
              <span className="text-gray-600 text-sm md:hidden">Hi, {user?.name?.split(' ')[0]}</span>
              <button
                onClick={handleLogout}
                className="bg-gradient-to-r from-gray-100 to-gray-200 hover:from-red-100 hover:to-red-200 text-gray-700 hover:text-red-700 px-2 sm:px-4 py-1.5 sm:py-2 rounded-lg transition-all duration-300 text-sm sm:text-base transform hover:scale-105 hover:shadow-lg"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Notification Banner */}
      {unreadCount > 0 && (
        <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-4 py-3 animate-slide-down">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <svg className="w-5 h-5 animate-bounce" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-3.5-3.5a5.98 5.98 0 01-.5-2.5V9a6 6 0 10-12 0v2c0 .85-.18 1.66-.5 2.5L0 17h5m10 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
              <span className="font-medium">
                Anda memiliki {unreadCount} notifikasi baru tentang pesanan Anda
              </span>
            </div>
            <button
              onClick={() => {
                setUnreadCount(0)
                fetchNotifications()
              }}
              className="text-white/80 hover:text-white transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
        {/* Mobile Navigation */}
        <div className="lg:hidden mb-6 animate-fade-in-up">
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-4 border border-white/20">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full flex items-center justify-center shadow-md animate-pulse-slow">
                <span className="text-blue-600 font-bold text-lg">
                  {user?.name?.charAt(0).toUpperCase()}
                </span>
              </div>
              <div>
                <h3 className="font-medium text-gray-900">{user?.name}</h3>
                <p className="text-sm text-gray-500">{user?.email}</p>
              </div>
            </div>
            
            <div className="grid grid-cols-3 gap-2">
              <button
                onClick={() => setActiveTab('orders')}
                className={`px-3 py-2 rounded-xl transition-all duration-300 text-sm transform hover:scale-105 ${
                  activeTab === 'orders'
                    ? 'bg-gradient-to-r from-blue-50 to-purple-50 text-blue-600 shadow-md border border-blue-200'
                    : 'text-gray-600 hover:bg-gradient-to-r hover:from-gray-50 hover:to-blue-50 hover:text-blue-600'
                }`}
              >
                📦 Pesanan
              </button>
              <button
                onClick={() => setActiveTab('notifications')}
                className={`px-3 py-2 rounded-xl transition-all duration-300 text-sm transform hover:scale-105 relative ${
                  activeTab === 'notifications'
                    ? 'bg-gradient-to-r from-blue-50 to-purple-50 text-blue-600 shadow-md border border-blue-200'
                    : 'text-gray-600 hover:bg-gradient-to-r hover:from-gray-50 hover:to-blue-50 hover:text-blue-600'
                }`}
              >
                🔔 Notifikasi
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center animate-pulse">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </button>
              <button
                onClick={() => setActiveTab('profile')}
                className={`px-3 py-2 rounded-xl transition-all duration-300 text-sm transform hover:scale-105 ${
                  activeTab === 'profile'
                    ? 'bg-gradient-to-r from-blue-50 to-purple-50 text-blue-600 shadow-md border border-blue-200'
                    : 'text-gray-600 hover:bg-gradient-to-r hover:from-gray-50 hover:to-blue-50 hover:text-blue-600'
                }`}
              >
                👤 Profil
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 lg:gap-8">
          {/* Desktop Sidebar */}
          <div className="lg:col-span-1 hidden lg:block animate-fade-in-right">
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-6 border border-white/20 sticky top-24">
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full flex items-center justify-center shadow-lg animate-pulse-slow">
                  <span className="text-blue-600 font-bold text-lg">
                    {user?.name?.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div>
                  <h3 className="font-medium text-gray-900">{user?.name}</h3>
                  <p className="text-sm text-gray-500">{user?.email}</p>
                </div>
              </div>
              
              <nav className="space-y-2">
                <button
                  onClick={() => setActiveTab('orders')}
                  className={`w-full text-left px-3 py-2 rounded-xl transition-all duration-300 transform hover:scale-105 ${
                    activeTab === 'orders'
                      ? 'bg-gradient-to-r from-blue-50 to-purple-50 text-blue-600 shadow-md border border-blue-200'
                      : 'text-gray-600 hover:bg-gradient-to-r hover:from-gray-50 hover:to-blue-50 hover:text-blue-600'
                  }`}
                >
                  📦 Pesanan Saya
                </button>
                <button
                  onClick={() => setActiveTab('notifications')}
                  className={`w-full text-left px-3 py-2 rounded-xl transition-all duration-300 transform hover:scale-105 relative ${
                    activeTab === 'notifications'
                      ? 'bg-gradient-to-r from-blue-50 to-purple-50 text-blue-600 shadow-md border border-blue-200'
                      : 'text-gray-600 hover:bg-gradient-to-r hover:from-gray-50 hover:to-blue-50 hover:text-blue-600'
                  }`}
                >
                  🔔 Notifikasi
                  {unreadCount > 0 && (
                    <span className="absolute top-1 right-2 bg-red-500 text-white text-xs rounded-full px-2 py-1 min-w-[20px] h-5 flex items-center justify-center animate-pulse">
                      {unreadCount > 99 ? '99+' : unreadCount}
                    </span>
                  )}
                </button>
                <button
                  onClick={() => setActiveTab('profile')}
                  className={`w-full text-left px-3 py-2 rounded-xl transition-all duration-300 transform hover:scale-105 ${
                    activeTab === 'profile'
                      ? 'bg-gradient-to-r from-blue-50 to-purple-50 text-blue-600 shadow-md border border-blue-200'
                      : 'text-gray-600 hover:bg-gradient-to-r hover:from-gray-50 hover:to-blue-50 hover:text-blue-600'
                  }`}
                >
                  👤 Profil
                </button>
              </nav>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3 animate-fade-in-left">
            {activeTab === 'orders' && (
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 transform hover:shadow-xl transition-all duration-300">
                <div className="px-4 sm:px-6 py-4 border-b border-gray-200">
                  <h2 className="text-lg font-semibold text-gray-900">Pesanan Saya</h2>
                  <p className="text-sm text-gray-600">Kelola dan pantau status pesanan Anda</p>
                </div>

                <div className="p-4 sm:p-6">
                  {transactions.length === 0 ? (
                    <div className="text-center py-8 sm:py-12">
                      <div className="text-4xl sm:text-6xl mb-4">📦</div>
                      <h3 className="text-lg font-medium text-gray-900 mb-2">
                        Belum Ada Pesanan
                      </h3>
                      <p className="text-gray-600 mb-6">
                        Anda belum melakukan pembelian apapun
                      </p>
                      <Link
                        href="/"
                        className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-6 py-3 rounded-xl font-medium transition-all duration-300 transform hover:scale-105 hover:shadow-lg"
                      >
                        Mulai Belanja
                      </Link>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {transactions.map((transaction, index) => (
                        <div
                          key={transaction.id}
                          className="border border-gray-200 rounded-xl p-4 hover:border-blue-300 hover:shadow-lg transition-all duration-300 transform hover:scale-[1.02] bg-gradient-to-r from-white to-gray-50"
                          style={{
                            animationDelay: `${index * 100}ms`
                          }}
                        >
                          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start mb-3 space-y-2 sm:space-y-0">
                            <div>
                              <h4 className="font-medium text-gray-900">
                                {transaction.product_name}
                              </h4>
                              <p className="text-sm text-gray-500">
                                Order #{transaction.id} • {formatDate(transaction.created_at)}
                              </p>
                            </div>
                            <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium self-start ${getStatusBadge(transaction.status)}`}>
                              {getStatusText(transaction.status)}
                            </span>
                          </div>

                          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center space-y-3 sm:space-y-0">
                            <div className="text-lg font-semibold text-gray-900">
                              {formatCurrency(transaction.amount)}
                            </div>
                            
                            <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-2">
                              {transaction.status === 'approved' && (
                                <button
                                  onClick={() => handleDownload(transaction.id, transaction.download_link || transaction.product_file_url || '#')}
                                  className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white px-4 py-2 rounded-xl text-sm transition-all duration-300 w-full sm:w-auto transform hover:scale-105 hover:shadow-lg"
                                >
                                  📥 Download File
                                </button>
                              )}
                              
                              {transaction.status === 'pending' && (
                                <div className="text-sm text-yellow-600">
                                  ⏳ Menunggu verifikasi pembayaran
                                </div>
                              )}
                              
                              {transaction.status === 'rejected' && (
                                <div className="text-sm text-red-600">
                                  ❌ Pembayaran ditolak, silakan hubungi admin
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeTab === 'notifications' && (
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 transform hover:shadow-xl transition-all duration-300">
                <div className="px-4 sm:px-6 py-4 border-b border-gray-200">
                  <h2 className="text-lg font-semibold text-gray-900">Notifikasi</h2>
                  <p className="text-sm text-gray-600">Update terbaru tentang pesanan Anda</p>
                </div>

                <div className="p-4 sm:p-6">
                  {notifications.length === 0 ? (
                    <div className="text-center py-8 sm:py-12">
                      <div className="text-4xl sm:text-6xl mb-4">🔔</div>
                      <h3 className="text-lg font-medium text-gray-900 mb-2">
                        Tidak Ada Notifikasi
                      </h3>
                      <p className="text-gray-600">
                        Notifikasi tentang pesanan Anda akan muncul di sini
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {notifications.map((notification, index) => (
                        <div
                          key={notification.id}
                          className={`p-4 rounded-xl border-l-4 transition-all duration-300 hover:shadow-md ${
                            notification.type === 'transaction_approved'
                              ? 'border-l-green-500 bg-green-50 hover:bg-green-100'
                              : notification.type === 'transaction_rejected'
                              ? 'border-l-red-500 bg-red-50 hover:bg-red-100'
                              : 'border-l-blue-500 bg-blue-50 hover:bg-blue-100'
                          }`}
                          style={{ 
                            animationDelay: `${index * 100}ms`,
                            animation: 'fadeInUp 0.5s ease-out forwards'
                          }}
                        >
                          <div className="flex items-start space-x-3">
                            <div className="flex-shrink-0 text-2xl">
                              {notification.type === 'transaction_approved' ? '✅' : 
                               notification.type === 'transaction_rejected' ? '❌' : '🔔'}
                            </div>
                            <div className="flex-1 min-w-0">
                              <h4 className="text-sm font-semibold text-gray-900 mb-1">
                                {notification.title}
                              </h4>
                              <p className="text-sm text-gray-700 mb-2">
                                {notification.message}
                              </p>
                              {notification.amount && (
                                <p className="text-sm font-medium text-gray-900 mb-2">
                                  {new Intl.NumberFormat('id-ID', {
                                    style: 'currency',
                                    currency: 'IDR'
                                  }).format(notification.amount)}
                                </p>
                              )}
                              <div className="flex items-center justify-between">
                                <p className="text-xs text-gray-500">
                                  {new Date(notification.created_at).toLocaleDateString('id-ID', {
                                    day: 'numeric',
                                    month: 'long',
                                    year: 'numeric',
                                    hour: '2-digit',
                                    minute: '2-digit'
                                  })}
                                </p>
                                {notification.action_url && (
                                  <Link
                                    href={notification.action_url}
                                    className="text-xs bg-blue-600 text-white px-3 py-1 rounded-lg hover:bg-blue-700 transition-colors"
                                  >
                                    Lihat Detail
                                  </Link>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeTab === 'profile' && (
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 transform hover:shadow-xl transition-all duration-300">
                <div className="px-4 sm:px-6 py-4 border-b border-gray-200">
                  <h2 className="text-lg font-semibold text-gray-900">Profil Saya</h2>
                  <p className="text-sm text-gray-600">Kelola informasi profil Anda</p>
                </div>

                <div className="p-4 sm:p-6">
                  <div className="max-w-md space-y-4 animate-fade-in-up">
                    <div className="animate-slide-up" style={{ animationDelay: '100ms' }}>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Nama Lengkap
                      </label>
                      <input
                        type="text"
                        value={user?.name || ''}
                        disabled
                        className="form-input bg-gradient-to-r from-gray-50 to-blue-50 border-gray-200 rounded-xl"
                      />
                    </div>
                    
                    <div className="animate-slide-up" style={{ animationDelay: '200ms' }}>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Email
                      </label>
                      <input
                        type="email"
                        value={user?.email || ''}
                        disabled
                        className="form-input bg-gradient-to-r from-gray-50 to-blue-50 border-gray-200 rounded-xl"
                      />
                    </div>
                    
                    <div className="animate-slide-up" style={{ animationDelay: '300ms' }}>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Role
                      </label>
                      <input
                        type="text"
                        value={user?.role === 'customer' ? 'Customer' : 'Admin'}
                        disabled
                        className="form-input bg-gradient-to-r from-gray-50 to-blue-50 border-gray-200 rounded-xl"
                      />
                    </div>

                    <div className="pt-4 animate-fade-in" style={{ animationDelay: '400ms' }}>
                      <p className="text-sm text-gray-600">
                        Untuk mengubah informasi profil, silakan hubungi admin.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
