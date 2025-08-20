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
  download_link?: string
  created_at: string
}

export default function ProfilePage() {
  const [user, setUser] = useState<User | null>(null)
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('orders')
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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Memuat data...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-3 sm:py-4">
            <div className="flex items-center space-x-2 sm:space-x-4">
              <Link href="/" className="flex items-center space-x-2">
                <div className="w-7 h-7 sm:w-8 sm:h-8 bg-primary-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-lg sm:text-xl">D</span>
                </div>
                <span className="text-lg sm:text-xl font-serif font-bold text-gray-900 hidden sm:block">
                  Digital Store
                </span>
                <span className="text-lg font-serif font-bold text-gray-900 sm:hidden">
                  Store
                </span>
              </Link>
            </div>
            <div className="flex items-center space-x-2 sm:space-x-4">
              <span className="text-gray-600 text-sm sm:text-base hidden md:block">Halo, {user?.name}</span>
              <span className="text-gray-600 text-sm md:hidden">Hi, {user?.name?.split(' ')[0]}</span>
              <button
                onClick={handleLogout}
                className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-2 sm:px-4 py-1.5 sm:py-2 rounded-lg transition-colors text-sm sm:text-base"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
        {/* Mobile Navigation */}
        <div className="lg:hidden mb-6">
          <div className="bg-white rounded-lg shadow-sm p-4">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                <span className="text-primary-600 font-bold text-lg">
                  {user?.name?.charAt(0).toUpperCase()}
                </span>
              </div>
              <div>
                <h3 className="font-medium text-gray-900">{user?.name}</h3>
                <p className="text-sm text-gray-500">{user?.email}</p>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => setActiveTab('orders')}
                className={`px-3 py-2 rounded-lg transition-colors text-sm ${
                  activeTab === 'orders'
                    ? 'bg-primary-50 text-primary-600'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                📦 Pesanan
              </button>
              <button
                onClick={() => setActiveTab('profile')}
                className={`px-3 py-2 rounded-lg transition-colors text-sm ${
                  activeTab === 'profile'
                    ? 'bg-primary-50 text-primary-600'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                👤 Profil
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 lg:gap-8">
          {/* Desktop Sidebar */}
          <div className="lg:col-span-1 hidden lg:block">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center">
                  <span className="text-primary-600 font-bold text-lg">
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
                  className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${
                    activeTab === 'orders'
                      ? 'bg-primary-50 text-primary-600'
                      : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  📦 Pesanan Saya
                </button>
                <button
                  onClick={() => setActiveTab('profile')}
                  className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${
                    activeTab === 'profile'
                      ? 'bg-primary-50 text-primary-600'
                      : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  👤 Profil
                </button>
              </nav>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {activeTab === 'orders' && (
              <div className="bg-white rounded-lg shadow-sm">
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
                        className="btn-primary"
                      >
                        Mulai Belanja
                      </Link>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {transactions.map((transaction) => (
                        <div
                          key={transaction.id}
                          className="border border-gray-200 rounded-lg p-4 hover:border-gray-300 transition-colors"
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
                              {transaction.status === 'approved' && transaction.download_link && (
                                <button
                                  onClick={() => handleDownload(transaction.id, transaction.download_link!)}
                                  className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm transition-colors w-full sm:w-auto"
                                >
                                  📥 Download
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

                          {transaction.status === 'approved' && !transaction.download_link && (
                            <div className="mt-2 text-sm text-blue-600">
                              ✅ Pembayaran disetujui. Link download sedang diproses...
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeTab === 'profile' && (
              <div className="bg-white rounded-lg shadow-sm">
                <div className="px-4 sm:px-6 py-4 border-b border-gray-200">
                  <h2 className="text-lg font-semibold text-gray-900">Profil Saya</h2>
                  <p className="text-sm text-gray-600">Kelola informasi profil Anda</p>
                </div>

                <div className="p-4 sm:p-6">
                  <div className="max-w-md space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Nama Lengkap
                      </label>
                      <input
                        type="text"
                        value={user?.name || ''}
                        disabled
                        className="form-input bg-gray-50"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Email
                      </label>
                      <input
                        type="email"
                        value={user?.email || ''}
                        disabled
                        className="form-input bg-gray-50"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Role
                      </label>
                      <input
                        type="text"
                        value={user?.role === 'customer' ? 'Customer' : 'Admin'}
                        disabled
                        className="form-input bg-gray-50"
                      />
                    </div>

                    <div className="pt-4">
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
