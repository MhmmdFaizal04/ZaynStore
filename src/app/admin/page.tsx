'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import ImageUploader from '@/components/ImageUploader'

interface User {
  id: number
  email: string
  name: string
  role: 'admin' | 'customer'
}

interface Product {
  id: number
  name: string
  description: string
  price: number
  category: string
  file_url?: string
  image_url?: string
  created_at: string
}

interface Transaction {
  id: number
  user_name: string
  user_email: string
  product_name: string
  amount: number
  status: 'pending' | 'approved' | 'rejected'
  payment_proof: string
  created_at: string
}

interface Member {
  id: number
  name: string
  email: string
  role: 'admin' | 'customer'
  created_at: string
  total_transactions: number
  total_spent: number
}

export default function AdminDashboard() {
  const [user, setUser] = useState<User | null>(null)
  const [activeTab, setActiveTab] = useState('dashboard')
  const [products, setProducts] = useState<Product[]>([])
  const [pendingNotifications, setPendingNotifications] = useState(0)
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [members, setMembers] = useState<Member[]>([])
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalTransactions: 0,
    pendingTransactions: 0,
    totalRevenue: 0,
    totalMembers: 0
  })
  const [isAddProductModalOpen, setIsAddProductModalOpen] = useState(false)
  const [isEditProductModalOpen, setIsEditProductModalOpen] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [productForm, setProductForm] = useState({
    name: '',
    description: '',
    price: '',
    category: '',
    file_url: '',
    image_url: ''
  })
  const [deletingProductId, setDeletingProductId] = useState<number | null>(null)
  const [viewingImage, setViewingImage] = useState<string | null>(null)
  const [isChangePasswordModalOpen, setIsChangePasswordModalOpen] = useState(false)
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  })
  const [passwordChangeLoading, setPasswordChangeLoading] = useState(false)
  
  // Announcement states
  const [isAddAnnouncementModalOpen, setIsAddAnnouncementModalOpen] = useState(false)
  const [announcements, setAnnouncements] = useState<any[]>([])
  const [announcementForm, setAnnouncementForm] = useState({
    title: '',
    content: '',
    type: 'board' as 'board' | 'alert'
  })
  
  // Pagination states
  const [transactionPage, setTransactionPage] = useState(1)
  const [memberPage, setMemberPage] = useState(1)
  const itemsPerPage = 10 // Back to 10 items per page

  const router = useRouter()

  // Pagination helper functions
  const getPaginatedData = (data: any[], page: number) => {
    const startIndex = (page - 1) * itemsPerPage
    const endIndex = startIndex + itemsPerPage
    return data.slice(startIndex, endIndex)
  }

  const getTotalPages = (dataLength: number) => {
    return Math.ceil(dataLength / itemsPerPage)
  }

  // Pagination component
  const Pagination = ({ 
    currentPage, 
    totalPages, 
    onPageChange, 
    dataType 
  }: { 
    currentPage: number
    totalPages: number
    onPageChange: (page: number) => void
    dataType: string
  }) => {
    // Generate page numbers for desktop with ellipsis
    const generateDesktopPages = () => {
      const pages = []
      const maxVisiblePages = 5
      
      if (totalPages <= maxVisiblePages + 2) {
        // Show all pages if total is small
        for (let i = 1; i <= totalPages; i++) {
          pages.push(i)
        }
      } else {
        // Always show first page
        pages.push(1)
        
        let startPage = Math.max(2, currentPage - 1)
        let endPage = Math.min(totalPages - 1, currentPage + 1)
        
        // Adjust range to always show 3 middle pages when possible
        if (currentPage <= 3) {
          endPage = Math.min(4, totalPages - 1)
        } else if (currentPage >= totalPages - 2) {
          startPage = Math.max(totalPages - 3, 2)
        }
        
        // Add ellipsis before middle pages if needed
        if (startPage > 2) {
          pages.push('...')
        }
        
        // Add middle pages
        for (let i = startPage; i <= endPage; i++) {
          pages.push(i)
        }
        
        // Add ellipsis after middle pages if needed
        if (endPage < totalPages - 1) {
          pages.push('...')
        }
        
        // Always show last page
        if (totalPages > 1) {
          pages.push(totalPages)
        }
      }
      
      return pages
    }

    // Generate page numbers for mobile (simplified)
    const generateMobilePages = () => {
      const pages = []
      const maxMobilePages = 3
      
      if (totalPages <= maxMobilePages + 2) {
        // Show all pages if total is small
        for (let i = 1; i <= totalPages; i++) {
          pages.push(i)
        }
      } else {
        if (currentPage <= 2) {
          // Show first few pages
          pages.push(1, 2, 3, '...', totalPages)
        } else if (currentPage >= totalPages - 1) {
          // Show last few pages
          pages.push(1, '...', totalPages - 2, totalPages - 1, totalPages)
        } else {
          // Show current page with context
          pages.push(1, '...', currentPage, '...', totalPages)
        }
      }
      
      return pages
    }

    const desktopPages = generateDesktopPages()
    const mobilePages = generateMobilePages()

    if (totalPages <= 1) return null

    return (
      <div className="flex items-center justify-between px-4 py-3 bg-white border-t border-gray-200 sm:px-6">
        {/* Mobile Pagination */}
        <div className="flex justify-between items-center w-full sm:hidden">
          <button
            onClick={() => onPageChange(Math.max(1, currentPage - 1))}
            disabled={currentPage === 1}
            className="relative inline-flex items-center px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <svg className="h-4 w-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
            Prev
          </button>
          
          <div className="flex space-x-1">
            {mobilePages.map((page, index) => (
              page === '...' ? (
                <span key={`ellipsis-${index}`} className="px-2 py-1 text-sm text-gray-500">
                  ...
                </span>
              ) : (
                <button
                  key={page}
                  onClick={() => onPageChange(page as number)}
                  className={`px-3 py-1 text-sm font-medium rounded ${
                    page === currentPage
                      ? 'bg-black text-white'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  {page}
                </button>
              )
            ))}
          </div>
          
          <button
            onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
            disabled={currentPage === totalPages}
            className="relative inline-flex items-center px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Next
            <svg className="h-4 w-4 ml-1" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
            </svg>
          </button>
        </div>

        {/* Desktop Pagination */}
        <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
          <div>
            <p className="text-sm text-gray-700">
              Showing{' '}
              <span className="font-medium">{Math.max(1, (currentPage - 1) * itemsPerPage + 1)}</span> to{' '}
              <span className="font-medium">
                {Math.min(currentPage * itemsPerPage, 
                  dataType === 'transactions' ? transactions.length : members.length)}
              </span>{' '}
              of{' '}
              <span className="font-medium">
                {dataType === 'transactions' ? transactions.length : members.length}
              </span>{' '}
              {dataType}
            </p>
          </div>
          
          <div>
            <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
              <button
                onClick={() => onPageChange(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </button>
              
              {desktopPages.map((page, index) => (
                page === '...' ? (
                  <span key={`ellipsis-${index}`} className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700">
                    ...
                  </span>
                ) : (
                  <button
                    key={page}
                    onClick={() => onPageChange(page as number)}
                    className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                      page === currentPage
                        ? 'z-10 bg-black border-black text-white'
                        : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    {page}
                  </button>
                )
              ))}
              
              <button
                onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
                className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                </svg>
              </button>
            </nav>
          </div>
        </div>
      </div>
    )
  }

  // Helper function untuk mengkonversi URL gambar ke endpoint yang benar
  const getImageUrl = (paymentProof: string) => {
    if (!paymentProof) return ''
    
    // Jika sudah berupa URL lengkap (dari Vercel Blob), gunakan apa adanya
    if (paymentProof.startsWith('http')) {
      return paymentProof
    }
    
    // Jika berupa filename (legacy), gunakan endpoint payment-proof
    return `/api/payment-proof/${encodeURIComponent(paymentProof)}`
  }

  const fetchAnnouncements = useCallback(async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch('/api/announcements', {
        headers: {
          'Authorization': token ? `Bearer ${token}` : ''
        },
        credentials: 'include'
      })
      const data = await response.json()
      
      if (response.ok) {
        setAnnouncements(data.announcements || [])
      }
    } catch (error) {
      console.error('Error fetching announcements:', error)
    }
  }, [])

  const fetchData = useCallback(async () => {
    try {
      setLoading(true)
      
      const token = localStorage.getItem('token')
      const headers = {
        'Authorization': token ? `Bearer ${token}` : ''
      }
      
      // Fetch products
      const productsResponse = await fetch('/api/products', {
        headers,
        credentials: 'include'
      })
      const productsData = await productsResponse.json()
      
      // Fetch all transactions (with large limit to get all data)
      const transactionsResponse = await fetch('/api/transactions?limit=1000', {
        headers,
        credentials: 'include'
      })
      const transactionsData = await transactionsResponse.json()
      
      // Fetch all members (with large limit to get all data)
      const membersResponse = await fetch('/api/members?limit=1000', {
        headers,
        credentials: 'include'
      })
      const membersData = await membersResponse.json()
      
      if (productsResponse.ok) {
        setProducts(productsData.products || [])
      }
      
      if (transactionsResponse.ok) {
        setTransactions(transactionsData.transactions || [])
        
        // Calculate stats
        const totalProducts = productsData.products?.length || 0
        const totalTransactions = transactionsData.transactions?.length || 0
        const pendingTransactions = transactionsData.transactions?.filter(
          (t: Transaction) => t.status === 'pending'
        ).length || 0
        const totalRevenue = transactionsData.transactions?.filter(
          (t: Transaction) => t.status === 'approved'
        ).reduce((sum: number, t: Transaction) => sum + t.amount, 0) || 0
        const totalMembers = membersData.members?.length || 0
        
        // Update pending notifications count
        setPendingNotifications(pendingTransactions)
        
        setStats({
          totalProducts,
          totalTransactions,
          pendingTransactions,
          totalRevenue,
          totalMembers
        })
      }
      
      if (membersResponse.ok) {
        setMembers(membersData.members || [])
      }
      
      // Fetch announcements
      await fetchAnnouncements()
      
      // Reset pagination to first page after data refresh
      setTransactionPage(1)
      setMemberPage(1)
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setLoading(false)
    }
  }, [fetchAnnouncements])

  useEffect(() => {
    // Check if user is logged in and is admin
    const userData = localStorage.getItem('user')
    if (!userData) {
      router.push('/login')
      return
    }

    const parsedUser = JSON.parse(userData)
    if (parsedUser.role !== 'admin') {
      router.push('/')
      return
    }

    setUser(parsedUser)
    fetchData()
  }, [router, fetchData])

  const handleLogout = () => {
    localStorage.removeItem('user')
    localStorage.removeItem('token')
    router.push('/')
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR'
    }).format(price)
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

  const handleProductFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setProductForm({
      ...productForm,
      [e.target.name]: e.target.value
    })
  }

  const handleImageUpload = (imageUrl: string) => {
    setProductForm({
      ...productForm,
      image_url: imageUrl
    })
  }

  const resetProductForm = () => {
    setProductForm({
      name: '',
      description: '',
      price: '',
      category: '',
      file_url: '',
      image_url: ''
    })
    setSelectedProduct(null)
  }

  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault()
    
    console.log('Form data:', productForm)
    
    if (!productForm.name || !productForm.description || !productForm.price || !productForm.category) {
      alert('Nama, deskripsi, harga, dan kategori wajib diisi')
      return
    }

    const price = parseInt(productForm.price)
    if (isNaN(price) || price <= 0) {
      alert('Harga harus berupa angka yang valid dan lebih dari 0')
      return
    }

    try {
      const token = localStorage.getItem('token')
      console.log('Sending request with token:', token ? 'exists' : 'missing')
      
      const response = await fetch('/api/products', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token ? `Bearer ${token}` : ''
        },
        credentials: 'include',
        body: JSON.stringify({
          name: productForm.name,
          description: productForm.description,
          price: price,
          category: productForm.category,
          file_url: productForm.file_url || '',
          image_url: productForm.image_url || ''
        })
      })

      const data = await response.json()
      console.log('Response:', data)

      if (response.ok) {
        alert('Produk berhasil ditambahkan!')
        setIsAddProductModalOpen(false)
        resetProductForm()
        fetchData()
      } else {
        console.error('Add product error:', data)
        alert(data.error || 'Gagal menambahkan produk')
      }
    } catch (error) {
      console.error('Error adding product:', error)
      alert('Terjadi kesalahan saat menambahkan produk')
    }
  }

  const handleEditProduct = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!selectedProduct) {
      alert('Produk tidak dipilih')
      return
    }

    if (!productForm.name || !productForm.description || !productForm.price || !productForm.category) {
      alert('Nama, deskripsi, harga, dan kategori wajib diisi')
      return
    }

    const price = parseInt(productForm.price)
    if (isNaN(price) || price <= 0) {
      alert('Harga harus berupa angka yang valid dan lebih dari 0')
      return
    }

    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`/api/products/${selectedProduct.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token ? `Bearer ${token}` : ''
        },
        credentials: 'include',
        body: JSON.stringify({
          name: productForm.name,
          description: productForm.description,
          price: price,
          category: productForm.category,
          file_url: productForm.file_url || '',
          image_url: productForm.image_url || ''
        })
      })

      const data = await response.json()

      if (response.ok) {
        alert('Produk berhasil diperbarui!')
        setIsEditProductModalOpen(false)
        resetProductForm()
        fetchData()
      } else {
        console.error('Update product error:', data)
        alert(data.error || 'Gagal memperbarui produk')
      }
    } catch (error) {
      console.error('Error editing product:', error)
      alert('Terjadi kesalahan saat memperbarui produk')
    }
  }

  const handleDeleteProduct = async (productId: number) => {
    if (!confirm('Yakin ingin menghapus produk ini?')) return

    try {
      setDeletingProductId(productId)
      const token = localStorage.getItem('token')
      const response = await fetch(`/api/products/${productId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': token ? `Bearer ${token}` : ''
        },
        credentials: 'include'
      })

      const data = await response.json()

      if (response.ok) {
        alert('Produk berhasil dihapus!')
        fetchData()
      } else {
        console.error('Delete product error:', data)
        alert(data.error || 'Gagal menghapus produk')
      }
    } catch (error) {
      console.error('Error deleting product:', error)
      alert('Terjadi kesalahan saat menghapus produk')
    } finally {
      setDeletingProductId(null)
    }
  }

  const openEditModal = (product: Product) => {
    setSelectedProduct(product)
    setProductForm({
      name: product.name,
      description: product.description,
      price: product.price.toString(),
      category: product.category,
      file_url: product.file_url || '',
      image_url: product.image_url || ''
    })
    setIsEditProductModalOpen(true)
  }

  const handleTransactionAction = async (transactionId: number, action: 'approve' | 'reject') => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`/api/transactions/${transactionId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token ? `Bearer ${token}` : ''
        },
        credentials: 'include',
        body: JSON.stringify({
          status: action === 'approve' ? 'approved' : 'rejected'
        })
      })

      const data = await response.json()

      if (response.ok) {
        alert(`Transaksi berhasil ${action === 'approve' ? 'disetujui' : 'ditolak'}!`)
        fetchData()
      } else {
        console.error('Transaction action error:', data)
        alert(data.error || 'Gagal memproses transaksi')
      }
    } catch (error) {
      console.error('Error updating transaction:', error)
      alert('Terjadi kesalahan saat memproses transaksi')
    }
  }

  const handleFixDownloadLinks = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch('/api/fix-download-links', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token ? `Bearer ${token}` : ''
        },
        credentials: 'include'
      })

      const data = await response.json()

      if (response.ok) {
        alert(`Berhasil memperbaiki ${data.count} transaksi yang download linknya belum ada!`)
        fetchData() // Refresh data
      } else {
        console.error('Fix download links error:', data)
        alert(data.error || 'Gagal memperbaiki download links')
      }
    } catch (error) {
      console.error('Error fixing download links:', error)
      alert('Terjadi kesalahan saat memperbaiki download links')
    }
  }

  const handleResetProductSequence = async () => {
    const confirmReset = confirm(
      'Apakah Anda yakin ingin mereset sequence ID produk?\n\n' +
      'Ini akan membuat produk baru memiliki ID yang berurutan dari ID tertinggi yang ada + 1.\n\n' +
      'Proses ini aman dan tidak akan mengubah data yang sudah ada.'
    )
    
    if (!confirmReset) return

    try {
      const token = localStorage.getItem('token')
      const response = await fetch('/api/reset-sequence', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token ? `Bearer ${token}` : ''
        },
        credentials: 'include',
        body: JSON.stringify({
          table: 'products'
        })
      })

      const data = await response.json()

      if (response.ok) {
        alert(`Sequence berhasil direset!\n\nProduk baru akan memiliki ID mulai dari: ${data.next_id}`)
      } else {
        console.error('Reset sequence error:', data)
        alert(data.error || 'Gagal mereset sequence')
      }
    } catch (error) {
      console.error('Error resetting sequence:', error)
      alert('Terjadi kesalahan saat mereset sequence')
    }
  }

  const handleResetTransactionSequence = async () => {
    const confirmReset = confirm(
      'Apakah Anda yakin ingin mereset sequence ID transaksi?\n\n' +
      'Ini akan membuat transaksi baru memiliki ID yang berurutan dari ID tertinggi yang ada + 1.\n\n' +
      'Proses ini aman dan tidak akan mengubah data yang sudah ada.'
    )
    
    if (!confirmReset) return

    try {
      const token = localStorage.getItem('token')
      const response = await fetch('/api/reset-sequence', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token ? `Bearer ${token}` : ''
        },
        credentials: 'include',
        body: JSON.stringify({
          table: 'transactions'
        })
      })

      const data = await response.json()

      if (response.ok) {
        alert(`Sequence berhasil direset!\n\nTransaksi baru akan memiliki ID mulai dari: ${data.next_id}`)
      } else {
        console.error('Reset sequence error:', data)
        alert(data.error || 'Gagal mereset sequence')
      }
    } catch (error) {
      console.error('Error resetting sequence:', error)
      alert('Terjadi kesalahan saat mereset sequence')
    }
  }

  const handleDeleteMember = async (memberId: number, memberName: string) => {
    const confirmDelete = confirm(
      `Apakah Anda yakin ingin menghapus member "${memberName}"?\n\n` +
      'Aksi ini tidak dapat dibatalkan!\n\n' +
      'Catatan: Member yang memiliki transaksi tidak dapat dihapus.'
    )
    
    if (!confirmDelete) return

    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`/api/members?id=${memberId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': token ? `Bearer ${token}` : ''
        },
        credentials: 'include'
      })

      const data = await response.json()

      if (response.ok) {
        alert(`Member "${memberName}" berhasil dihapus!`)
        fetchData() // Refresh data
      } else {
        console.error('Delete member error:', data)
        alert(data.error || 'Gagal menghapus member')
      }
    } catch (error) {
      console.error('Error deleting member:', error)
      alert('Terjadi kesalahan saat menghapus member')
    }
  }

  const handlePasswordFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPasswordForm({
      ...passwordForm,
      [e.target.name]: e.target.value
    })
  }

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      alert('Password baru dan konfirmasi password tidak cocok')
      return
    }

    try {
      setPasswordChangeLoading(true)
      
      const response = await fetch('/api/admin/change-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          currentPassword: passwordForm.currentPassword,
          newPassword: passwordForm.newPassword
        }),
        credentials: 'include'
      })

      const data = await response.json()

      if (response.ok) {
        alert('Password berhasil diubah!')
        setIsChangePasswordModalOpen(false)
        setPasswordForm({
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        })
      } else {
        alert(data.error || 'Gagal mengubah password')
      }
    } catch (error) {
      console.error('Error changing password:', error)
      alert('Terjadi kesalahan saat mengubah password')
    } finally {
      setPasswordChangeLoading(false)
    }
  }

  // Announcement functions
  const handleAnnouncementFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setAnnouncementForm(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const resetAnnouncementForm = () => {
    setAnnouncementForm({
      title: '',
      content: '',
      type: 'board'
    })
  }

  const handleAddAnnouncement = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const token = localStorage.getItem('token')
      const response = await fetch('/api/announcements', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': token ? `Bearer ${token}` : ''
        },
        credentials: 'include',
        body: JSON.stringify(announcementForm)
      })

      const data = await response.json()
      
      if (response.ok) {
        alert('Pengumuman berhasil ditambahkan!')
        setIsAddAnnouncementModalOpen(false)
        resetAnnouncementForm()
        fetchAnnouncements() // Refresh announcements list
      } else {
        alert(data.error || 'Gagal menambahkan pengumuman')
      }
    } catch (error) {
      console.error('Error adding announcement:', error)
      alert('Terjadi kesalahan saat menambahkan pengumuman')
    }
  }

  const handleDeleteAnnouncement = async (announcementId: number) => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`/api/announcements?id=${announcementId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': token ? `Bearer ${token}` : ''
        },
        credentials: 'include'
      })

      const data = await response.json()
      
      if (response.ok) {
        alert('Pengumuman berhasil dihapus!')
        fetchAnnouncements() // Refresh announcements list
      } else {
        alert(data.error || 'Gagal menghapus pengumuman')
      }
    } catch (error) {
      console.error('Error deleting announcement:', error)
      alert('Terjadi kesalahan saat menghapus pengumuman')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-white via-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-black rounded-2xl flex items-center justify-center shadow-lg mb-4 mx-auto border border-gray-200">
            <span className="text-white font-bold text-2xl">Z</span>
          </div>
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-transparent border-t-black border-r-gray-400 mx-auto mb-4"></div>
          <p className="text-black">Loading Admin Dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-gray-50 to-gray-100">
      {/* Header */}
      <header className="bg-white/90 backdrop-blur-sm shadow-sm border-b border-gray-200 sticky top-0 z-50">
        <div className="px-4 sm:px-6 py-3 sm:py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-2 sm:space-x-4">
              <Link href="/" className="flex items-center space-x-2 group">
                <div className="relative">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 bg-black rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300 transform group-hover:scale-110">
                    <span className="text-white font-bold text-lg sm:text-xl">Z</span>
                  </div>
                  <div className="absolute -inset-1 bg-black rounded-xl blur opacity-25 group-hover:opacity-40 transition duration-300"></div>
                </div>
                <span className="text-lg sm:text-xl font-serif font-bold text-black hidden sm:block">
                  ZaynStore Admin
                </span>
                <span className="text-lg font-serif font-bold text-black sm:hidden">
                  Admin
                </span>
              </Link>
            </div>
            <div className="flex items-center space-x-1 sm:space-x-4">
              <button
                onClick={fetchData}
                disabled={loading}
                className="inline-flex items-center px-2 sm:px-4 py-2 bg-black hover:bg-gray-800 text-white rounded-xl transition-all duration-300 disabled:opacity-50 text-xs sm:text-sm shadow-lg hover:shadow-xl transform hover:scale-105"
              >
                <svg className={`w-3 h-3 sm:w-4 sm:h-4 ${loading ? 'animate-spin' : ''} sm:mr-2`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                <span className="hidden sm:inline">{loading ? '🔄 Loading...' : '🚀 Refresh'}</span>
              </button>
              <button
                onClick={() => setIsChangePasswordModalOpen(true)}
                className="inline-flex items-center px-2 sm:px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl transition-all duration-300 text-xs sm:text-sm transform hover:scale-105"
                title="Ubah Password"
              >
                <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m0 0a2 2 0 012 2 2 2 0 01-2 2 2 2 0 01-2-2z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2V9a2 2 0 012-2h4zm6 0V5a2 2 0 00-2-2H9a2 2 0 00-2 2v2" />
                </svg>
                <span className="hidden sm:inline sm:ml-2">Ubah Password</span>
              </button>
              <span className="text-gray-600 text-xs sm:text-sm hidden md:block">Hai, {user?.name}</span>
              <button
                onClick={handleLogout}
                className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-2 sm:px-3 py-1.5 sm:py-2 rounded-xl text-xs sm:text-sm transition-all duration-300 transform hover:scale-105"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="flex flex-col lg:flex-row">
        {/* Mobile Navigation */}
        <div className="lg:hidden bg-white border-b border-gray-200 shadow-sm">
          <div className="px-4 py-4">
            <select
              value={activeTab}
              onChange={(e) => setActiveTab(e.target.value)}
              className="w-full px-4 py-3 bg-white border border-gray-300 text-black rounded-xl focus:ring-2 focus:ring-black focus:border-black text-sm font-medium"
            >
              <option value="dashboard">Dashboard</option>
              <option value="products">Kelola Produk</option>
              <option value="transactions">Transaksi</option>
              <option value="members">Member</option>
              <option value="announcements">Pengumuman</option>
            </select>
          </div>
        </div>

        {/* Sidebar - Desktop Only */}
        <div className="hidden lg:block w-72 bg-white shadow-sm min-h-screen border-r border-gray-200">
          <nav className="p-6">
            <div className="mb-8">
              <h2 className="text-lg font-semibold text-gray-900 mb-2">Admin Panel</h2>
              <p className="text-sm text-gray-500">Manajemen Penjualan Digital</p>
            </div>
            <ul className="space-y-3">
              <li>
                <button
                  onClick={() => setActiveTab('dashboard')}
                  className={`w-full text-left px-4 py-3 rounded-xl transition-all duration-200 flex items-center gap-3 font-medium ${
                    activeTab === 'dashboard'
                      ? 'bg-black text-white shadow-lg'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-black'
                  }`}
                >
                  <div className={`p-2 rounded-lg ${
                    activeTab === 'dashboard' ? 'bg-white/20' : 'bg-gray-100'
                  }`}>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                  </div>
                  <span>Dashboard</span>
                </button>
              </li>
              <li>
                <button
                  onClick={() => setActiveTab('products')}
                  className={`w-full text-left px-4 py-3 rounded-xl transition-all duration-200 flex items-center gap-3 font-medium ${
                    activeTab === 'products'
                      ? 'bg-black text-white shadow-lg'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-black'
                  }`}
                >
                  <div className={`p-2 rounded-lg ${
                    activeTab === 'products' ? 'bg-white/20' : 'bg-gray-100'
                  }`}>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                    </svg>
                  </div>
                  <span>Kelola Produk</span>
                </button>
              </li>
              <li>
                <button
                  onClick={() => setActiveTab('transactions')}
                  className={`w-full text-left px-4 py-3 rounded-xl transition-all duration-200 flex items-center gap-3 font-medium ${
                    activeTab === 'transactions'
                      ? 'bg-black text-white shadow-lg'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-black'
                  }`}
                >
                  <div className={`p-2 rounded-lg ${
                    activeTab === 'transactions' ? 'bg-white/20' : 'bg-gray-100'
                  }`}>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3-3V8a3 3 0 003 3z" />
                    </svg>
                  </div>
                  <div className="flex-1 flex items-center justify-between">
                    <span>Transaksi</span>
                    {pendingNotifications > 0 && (
                      <span className="bg-red-500 text-white text-xs rounded-full px-2 py-1 min-w-[20px] h-5 flex items-center justify-center font-bold">
                        {pendingNotifications}
                      </span>
                    )}
                  </div>
                </button>
              </li>
              <li>
                <button
                  onClick={() => setActiveTab('members')}
                  className={`w-full text-left px-4 py-3 rounded-xl transition-all duration-200 flex items-center gap-3 font-medium ${
                    activeTab === 'members'
                      ? 'bg-black text-white shadow-lg'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-black'
                  }`}
                >
                  <div className={`p-2 rounded-lg ${
                    activeTab === 'members' ? 'bg-white/20' : 'bg-gray-100'
                  }`}>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                    </svg>
                  </div>
                  <span>Member</span>
                </button>
              </li>
              <li>
                <button
                  onClick={() => setActiveTab('announcements')}
                  className={`w-full text-left px-4 py-3 rounded-xl transition-all duration-200 flex items-center gap-3 font-medium ${
                    activeTab === 'announcements'
                      ? 'bg-black text-white shadow-lg'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-black'
                  }`}
                >
                  <div className={`p-2 rounded-lg ${
                    activeTab === 'announcements' ? 'bg-white/20' : 'bg-gray-100'
                  }`}>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 717 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
                    </svg>
                  </div>
                  <span>Pengumuman</span>
                </button>
              </li>
            </ul>
          </nav>
        </div>

        {/* Main Content */}
        <div className="flex-1 p-4 sm:p-6 lg:p-8 bg-gray-50">
          {activeTab === 'dashboard' && (
            <div>
              {/* Dashboard Stats */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 sm:gap-6 mb-6 sm:mb-8">
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6 hover:shadow-md transition-shadow duration-200">
                  <div className="flex items-center">
                    <div className="p-3 bg-gray-100 rounded-xl">
                      <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                      </svg>
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Total Products</p>
                      <p className="text-2xl font-bold text-gray-900">{stats.totalProducts}</p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6 hover:shadow-md transition-shadow duration-200">
                  <div className="flex items-center">
                    <div className="p-3 bg-gray-100 rounded-xl">
                      <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                      </svg>
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Total Transaksi</p>
                      <p className="text-2xl font-bold text-gray-900">{stats.totalTransactions}</p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6">
                  <div className="flex items-center">
                    <div className="p-2 bg-yellow-100 rounded-lg">
                      <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Pending</p>
                      <p className="text-2xl font-bold text-gray-900">{stats.pendingTransactions}</p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6">
                  <div className="flex items-center">
                    <div className="p-2 bg-orange-100 rounded-lg">
                      <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                      </svg>
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Total Member</p>
                      <p className="text-2xl font-bold text-gray-900">{stats.totalMembers}</p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6">
                  <div className="flex items-center">
                    <div className="p-2 bg-purple-100 rounded-lg">
                      <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                      <p className="text-2xl font-bold text-gray-900">{formatPrice(stats.totalRevenue)}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Recent Transactions */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Transaksi Terbaru</h3>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Customer
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Produk
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Amount
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {transactions.slice(0, 5).map((transaction) => (
                        <tr key={transaction.id}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div>
                              <div className="text-sm font-medium text-gray-900">{transaction.user_name}</div>
                              <div className="text-sm text-gray-500">{transaction.user_email}</div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">{transaction.product_name}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">{formatPrice(transaction.amount)}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                              transaction.status === 'approved' ? 'bg-green-100 text-green-800' :
                              transaction.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-red-100 text-red-800'
                            }`}>
                              {transaction.status === 'approved' ? 'Disetujui' :
                               transaction.status === 'pending' ? 'Pending' : 'Ditolak'}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'products' && (
            <div>
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-4 sm:mb-0">Kelola Produk</h2>
                <div className="flex flex-col sm:flex-row gap-2">
                  <button
                    onClick={handleResetProductSequence}
                    className="bg-black hover:bg-gray-800 text-white px-4 py-2 rounded-lg text-sm transition-colors"
                  >
                    Reset ID Sequence
                  </button>
                  <button
                    onClick={() => {
                      resetProductForm()
                      setIsAddProductModalOpen(true)
                    }}
                    className="bg-black hover:bg-gray-800 text-white px-6 py-3 rounded-xl font-medium shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
                  >
                    + Tambah Produk
                  </button>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Produk
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Kategori
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Harga
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Aksi
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {products.map((product) => (
                        <tr key={product.id}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="flex-shrink-0 h-10 w-10">
                                {product.image_url ? (
                                  <Image 
                                    className="h-10 w-10 rounded-lg object-cover" 
                                    src={product.image_url} 
                                    alt={product.name}
                                    width={40}
                                    height={40}
                                  />
                                ) : (
                                  <div className="h-10 w-10 rounded-lg bg-gray-300 flex items-center justify-center">
                                    <svg className="w-6 h-6 text-gray-500" fill="currentColor" viewBox="0 0 20 20">
                                      <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
                                    </svg>
                                  </div>
                                )}
                              </div>
                              <div className="ml-4">
                                <div className="text-sm font-medium text-gray-900">{product.name}</div>
                                <div className="text-sm text-gray-500">{product.description.substring(0, 50)}...</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">{product.category}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">{formatPrice(product.price)}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <div className="flex space-x-2">
                              <button
                                onClick={() => openEditModal(product)}
                                className="text-blue-600 hover:text-blue-900"
                              >
                                Edit
                              </button>
                              <button
                                onClick={() => handleDeleteProduct(product.id)}
                                disabled={deletingProductId === product.id}
                                className="text-red-600 hover:text-red-900 disabled:opacity-50"
                              >
                                {deletingProductId === product.id ? 'Menghapus...' : 'Hapus'}
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'transactions' && (
            <div>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Kelola Transaksi</h2>
                <div className="flex gap-2">
                  <button
                    onClick={handleResetTransactionSequence}
                    className="bg-black hover:bg-gray-800 text-white px-4 py-2 rounded-lg text-sm transition-colors"
                  >
                    Reset ID Sequence
                  </button>
                  <button
                    onClick={handleFixDownloadLinks}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors text-sm"
                  >
                    🔧 Perbaiki Download Links
                  </button>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Customer
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Produk
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Amount
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Bukti Transfer
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Aksi
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {getPaginatedData(transactions, transactionPage).map((transaction) => (
                        <tr key={transaction.id}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div>
                              <div className="text-sm font-medium text-gray-900">{transaction.user_name}</div>
                              <div className="text-sm text-gray-500">{transaction.user_email}</div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">{transaction.product_name}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">{formatPrice(transaction.amount)}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                              transaction.status === 'approved' ? 'bg-green-100 text-green-800' :
                              transaction.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-red-100 text-red-800'
                            }`}>
                              {transaction.status === 'approved' ? 'Disetujui' :
                               transaction.status === 'pending' ? 'Pending' : 'Ditolak'}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {transaction.payment_proof && (
                              <button
                                onClick={() => setViewingImage(getImageUrl(transaction.payment_proof))}
                                className="text-blue-600 hover:text-blue-900 text-sm"
                              >
                                Lihat Bukti
                              </button>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            {transaction.status === 'pending' && (
                              <div className="flex space-x-2">
                                <button
                                  onClick={() => handleTransactionAction(transaction.id, 'approve')}
                                  className="text-green-600 hover:text-green-900"
                                >
                                  Setujui
                                </button>
                                <button
                                  onClick={() => handleTransactionAction(transaction.id, 'reject')}
                                  className="text-red-600 hover:text-red-900"
                                >
                                  Tolak
                                </button>
                              </div>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                
                {transactions.length === 0 && (
                  <div className="text-center py-8">
                    <p className="text-gray-500">Belum ada transaksi</p>
                  </div>
                )}
                
                {/* Transaction Pagination */}
                <Pagination
                  currentPage={transactionPage}
                  totalPages={getTotalPages(transactions.length)}
                  onPageChange={setTransactionPage}
                  dataType="transactions"
                />
              </div>
            </div>
          )}

          {activeTab === 'members' && (
            <div>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Kelola Member</h2>
                <div className="text-sm text-gray-600">
                  Total: {members.length} member
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Member
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Role
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Transaksi
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Total Belanja
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Bergabung
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Aksi
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {getPaginatedData(members, memberPage).map((member) => (
                        <tr key={member.id}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div>
                              <div className="text-sm font-medium text-gray-900">{member.name}</div>
                              <div className="text-sm text-gray-500">{member.email}</div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${
                              member.role === 'admin' 
                                ? 'bg-purple-100 text-purple-800' 
                                : 'bg-blue-100 text-blue-800'
                            }`}>
                              {member.role === 'admin' ? 'Admin' : 'Customer'}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">{member.total_transactions}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">{formatPrice(member.total_spent)}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">{formatDate(member.created_at)}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            {member.role === 'customer' && member.total_transactions === 0 && (
                              <button
                                onClick={() => handleDeleteMember(member.id, member.name)}
                                className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-xs transition-colors"
                              >
                                Hapus
                              </button>
                            )}
                            {member.role === 'admin' && (
                              <span className="text-gray-400 text-xs">Admin</span>
                            )}
                            {member.total_transactions > 0 && (
                              <span className="text-gray-400 text-xs">Ada Transaksi</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                
                {members.length === 0 && (
                  <div className="text-center py-8">
                    <p className="text-gray-500">Belum ada member yang terdaftar</p>
                  </div>
                )}
                
                {/* Member Pagination */}
                <Pagination
                  currentPage={memberPage}
                  totalPages={getTotalPages(members.length)}
                  onPageChange={setMemberPage}
                  dataType="members"
                />
              </div>
            </div>
          )}

          {/* Announcements Tab */}
          {activeTab === 'announcements' && (
            <div className="space-y-6">
              {/* Header Section */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Kelola Pengumuman</h2>
                  <p className="text-gray-600 mt-1">Buat dan kelola pengumuman untuk member</p>
                </div>
                <button 
                  onClick={() => setIsAddAnnouncementModalOpen(true)}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 w-fit"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  Tambah Pengumuman
                </button>
              </div>

              {/* Announcements Table */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
                  <h3 className="text-lg font-medium text-gray-900">Daftar Pengumuman</h3>
                </div>
                
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Judul
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Isi Pengumuman
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Tipe
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Dibuat Oleh
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Tanggal
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Aksi
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {announcements.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                            <div className="flex flex-col items-center">
                              <svg className="w-16 h-16 text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 717 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
                              </svg>
                              <span className="text-lg font-medium">Belum ada pengumuman</span>
                              <span className="text-sm mt-1">Klik tombol &quot;Tambah Pengumuman&quot; untuk membuat pengumuman baru</span>
                            </div>
                          </td>
                        </tr>
                      ) : (
                        announcements.map((announcement) => (
                          <tr key={announcement.id} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm font-medium text-gray-900 max-w-xs truncate">
                                {announcement.title}
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <div className="text-sm text-gray-900 max-w-xs truncate">
                                {announcement.content}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`px-3 py-1 text-xs font-medium rounded-full ${
                                announcement.type === 'alert' 
                                  ? 'bg-orange-100 text-orange-800' 
                                  : 'bg-blue-100 text-blue-800'
                              }`}>
                                {announcement.type === 'alert' ? '🔔 Alert' : '📋 Board'}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-900">
                                {announcement.created_by_name || 'Admin'}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-900">
                                {new Date(announcement.created_at).toLocaleDateString('id-ID', {
                                  year: 'numeric',
                                  month: 'long',
                                  day: 'numeric',
                                  hour: '2-digit',
                                  minute: '2-digit'
                                })}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                              <button
                                onClick={() => {
                                  if (window.confirm('Yakin ingin menghapus pengumuman ini?')) {
                                    handleDeleteAnnouncement(announcement.id)
                                  }
                                }}
                                className="text-red-600 hover:text-red-900 hover:bg-red-50 px-3 py-1 rounded transition-colors"
                              >
                                Hapus
                              </button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Add Product Modal */}
      {isAddProductModalOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setIsAddProductModalOpen(false)
              resetProductForm()
            }
          }}
        >
          <div className="bg-white rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold">Tambah Produk Baru</h2>
                <button
                  type="button"
                  onClick={() => {
                    setIsAddProductModalOpen(false)
                    resetProductForm()
                  }}
                  className="text-gray-400 hover:text-gray-600 text-2xl"
                >
                  ×
                </button>
              </div>
              <form onSubmit={handleAddProduct} className="space-y-4">
                <div>
                  <label className="form-label">Nama Produk</label>
                  <input
                    type="text"
                    name="name"
                    value={productForm.name}
                    onChange={handleProductFormChange}
                    className="form-input"
                    required
                    placeholder="Masukkan nama produk"
                  />
                </div>
                <div>
                  <label className="form-label">Deskripsi</label>
                  <textarea
                    name="description"
                    value={productForm.description}
                    onChange={handleProductFormChange}
                    className="form-input"
                    rows={3}
                    required
                    placeholder="Masukkan deskripsi produk"
                  />
                </div>
                <div>
                  <label className="form-label">Harga</label>
                  <input
                    type="number"
                    name="price"
                    value={productForm.price}
                    onChange={handleProductFormChange}
                    className="form-input"
                    required
                    min="0"
                    step="1000"
                    placeholder="Masukkan harga produk"
                  />
                </div>
                <div>
                  <label className="form-label">Kategori</label>
                  <select
                    name="category"
                    value={productForm.category}
                    onChange={handleProductFormChange}
                    className="form-input"
                    required
                  >
                    <option value="">Pilih Kategori</option>
                    <option value="Web Template">Web Template</option>
                    <option value="UI Kit">UI Kit</option>
                    <option value="Logo">Logo</option>
                    <option value="Icon">Icon</option>
                    <option value="Photo">Photo</option>
                    <option value="Video">Video</option>
                    <option value="Audio">Audio</option>
                    <option value="Document">Document</option>
                  </select>
                </div>
                <div>
                  <label className="form-label">URL File (opsional)</label>
                  <input
                    type="url"
                    name="file_url"
                    value={productForm.file_url}
                    onChange={handleProductFormChange}
                    className="form-input"
                    placeholder="https://example.com/file.zip"
                  />
                </div>
                <div>
                  <ImageUploader onUploadSuccess={handleImageUpload} currentImageUrl={productForm.image_url} />
                </div>
                <div className="flex justify-end space-x-4 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setIsAddProductModalOpen(false)
                      resetProductForm()
                    }}
                    className="btn-secondary"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="btn-primary"
                  >
                    Tambah Produk
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Edit Product Modal */}
      {isEditProductModalOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setIsEditProductModalOpen(false)
              resetProductForm()
            }
          }}
        >
          <div className="bg-white rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold">Edit Produk</h2>
                <button
                  type="button"
                  onClick={() => {
                    setIsEditProductModalOpen(false)
                    resetProductForm()
                  }}
                  className="text-gray-400 hover:text-gray-600 text-2xl"
                >
                  ×
                </button>
              </div>
              <form onSubmit={handleEditProduct} className="space-y-4">
                <div>
                  <label className="form-label">Nama Produk</label>
                  <input
                    type="text"
                    name="name"
                    value={productForm.name}
                    onChange={handleProductFormChange}
                    className="form-input"
                    required
                    placeholder="Masukkan nama produk"
                  />
                </div>
                <div>
                  <label className="form-label">Deskripsi</label>
                  <textarea
                    name="description"
                    value={productForm.description}
                    onChange={handleProductFormChange}
                    className="form-input"
                    rows={3}
                    required
                    placeholder="Masukkan deskripsi produk"
                  />
                </div>
                <div>
                  <label className="form-label">Harga</label>
                  <input
                    type="number"
                    name="price"
                    value={productForm.price}
                    onChange={handleProductFormChange}
                    className="form-input"
                    required
                    min="0"
                    step="1000"
                    placeholder="Masukkan harga produk"
                  />
                </div>
                <div>
                  <label className="form-label">Kategori</label>
                  <select
                    name="category"
                    value={productForm.category}
                    onChange={handleProductFormChange}
                    className="form-input"
                    required
                  >
                    <option value="">Pilih Kategori</option>
                    <option value="Web Template">Web Template</option>
                    <option value="UI Kit">UI Kit</option>
                    <option value="Logo">Logo</option>
                    <option value="Icon">Icon</option>
                    <option value="Photo">Photo</option>
                    <option value="Video">Video</option>
                    <option value="Audio">Audio</option>
                    <option value="Document">Document</option>
                  </select>
                </div>
                <div>
                  <label className="form-label">URL File (opsional)</label>
                  <input
                    type="url"
                    name="file_url"
                    value={productForm.file_url}
                    onChange={handleProductFormChange}
                    className="form-input"
                    placeholder="https://example.com/file.zip"
                  />
                </div>
                <div>
                  <ImageUploader onUploadSuccess={handleImageUpload} currentImageUrl={productForm.image_url} />
                </div>
                <div className="flex justify-end space-x-4 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setIsEditProductModalOpen(false)
                      resetProductForm()
                    }}
                    className="btn-secondary"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="btn-primary"
                  >
                    Update Produk
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Image Viewer Modal */}
      {viewingImage && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
          <div className="relative max-w-4xl max-h-full">
            <button
              onClick={() => setViewingImage(null)}
              className="absolute top-4 right-4 text-white hover:text-gray-300 z-10"
            >
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <div className="bg-white rounded-lg p-4">
              {viewingImage.toLowerCase().includes('.pdf') ? (
                <div className="text-center p-8">
                  <svg className="w-16 h-16 mx-auto text-red-500 mb-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
                  </svg>
                  <p className="text-gray-600 mb-4">File PDF</p>
                  <a 
                    href={viewingImage} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="btn-primary"
                  >
                    Download PDF
                  </a>
                </div>
              ) : (
                <div className="relative w-full max-w-4xl max-h-[70vh]">
                  <Image 
                    src={viewingImage} 
                    alt="Bukti Transfer" 
                    width={800}
                    height={600}
                    className="max-w-full max-h-[70vh] object-contain rounded-lg"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none'
                      const errorDiv = e.currentTarget.nextElementSibling as HTMLElement
                      if (errorDiv) {
                        errorDiv.style.display = 'block'
                      }
                    }}
                  />
                </div>
              )}
              <div style={{display: 'none'}} className="p-8 bg-gray-100 rounded-lg">
                <svg className="w-16 h-16 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.664-.833-2.464 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
                <p className="text-gray-600 mb-4">Gagal memuat gambar</p>
                <p className="text-sm text-gray-500">File: {viewingImage}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Announcement Modal */}
      {isAddAnnouncementModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gray-50">
              <div className="flex items-center">
                <div className="bg-blue-600 p-2 rounded-lg mr-3">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 717 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
                  </svg>
                </div>
                <h2 className="text-xl font-bold text-gray-900">Tambah Pengumuman Baru</h2>
              </div>
              <button
                onClick={() => {
                  setIsAddAnnouncementModalOpen(false)
                  resetAnnouncementForm()
                }}
                className="text-gray-400 hover:text-gray-600 transition-colors p-2 hover:bg-gray-100 rounded-lg"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
              <form onSubmit={handleAddAnnouncement} className="space-y-6">
                <div>
                  <label htmlFor="title" className="block text-sm font-semibold text-gray-700 mb-2">
                    Judul Pengumuman <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="title"
                    name="title"
                    value={announcementForm.title}
                    onChange={handleAnnouncementFormChange}
                    placeholder="Masukkan judul pengumuman yang menarik..."
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    required
                  />
                </div>
                
                <div>
                  <label htmlFor="content" className="block text-sm font-semibold text-gray-700 mb-2">
                    Isi Pengumuman <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    id="content"
                    name="content"
                    rows={6}
                    value={announcementForm.content}
                    onChange={handleAnnouncementFormChange}
                    placeholder="Tulis detail pengumuman di sini..."
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none"
                    required
                  />
                  <p className="text-xs text-gray-500 mt-2">
                    Pastikan pengumuman jelas dan mudah dipahami oleh semua pengguna.
                  </p>
                </div>

                <div>
                  <label htmlFor="type" className="block text-sm font-semibold text-gray-700 mb-2">
                    Tipe Pengumuman
                  </label>
                  <select
                    id="type"
                    name="type"
                    value={announcementForm.type}
                    onChange={handleAnnouncementFormChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  >
                    <option value="board">📋 Papan Informasi</option>
                    <option value="alert">🔔 Alert Pop-up</option>
                  </select>
                  <div className="mt-3 p-4 bg-gray-50 rounded-lg">
                    <div className="text-sm text-gray-600 space-y-2">
                      <div className="flex items-start">
                        <span className="text-blue-600 font-medium w-20">Board:</span>
                        <span>Ditampilkan di halaman utama untuk semua pengunjung yang login</span>
                      </div>
                      <div className="flex items-start">
                        <span className="text-orange-600 font-medium w-20">Alert:</span>
                        <span>Muncul sebagai notifikasi pop-up saat member login atau mengunjungi situs</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Form Actions */}
                <div className="flex items-center justify-end space-x-3 pt-4 border-t border-gray-200">
                  <button
                    type="button"
                    onClick={() => {
                      setIsAddAnnouncementModalOpen(false)
                      resetAnnouncementForm()
                    }}
                    className="px-6 py-2.5 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 font-medium transition-colors"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition-colors flex items-center"
                  >
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                    Publikasikan
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Change Password Modal */}
      {isChangePasswordModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg w-full max-w-md">
            <div className="p-6">
              <h2 className="text-xl font-bold mb-4">Ubah Password Admin</h2>
              <form onSubmit={handleChangePassword} className="space-y-4">
                <div>
                  <label className="form-label">Password Lama</label>
                  <input
                    type="password"
                    name="currentPassword"
                    value={passwordForm.currentPassword}
                    onChange={handlePasswordFormChange}
                    className="form-input"
                    required
                    autoComplete="current-password"
                  />
                </div>
                <div>
                  <label className="form-label">Password Baru</label>
                  <input
                    type="password"
                    name="newPassword"
                    value={passwordForm.newPassword}
                    onChange={handlePasswordFormChange}
                    className="form-input"
                    required
                    autoComplete="new-password"
                  />
                </div>
                <div>
                  <label className="form-label">Konfirmasi Password Baru</label>
                  <input
                    type="password"
                    name="confirmPassword"
                    value={passwordForm.confirmPassword}
                    onChange={handlePasswordFormChange}
                    className="form-input"
                    required
                    autoComplete="new-password"
                  />
                </div>
                <div className="flex justify-end space-x-4 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setIsChangePasswordModalOpen(false)
                      setPasswordForm({
                        currentPassword: '',
                        newPassword: '',
                        confirmPassword: ''
                      })
                    }}
                    className="btn-secondary"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    disabled={passwordChangeLoading}
                    className="btn-primary disabled:opacity-50"
                  >
                    {passwordChangeLoading ? 'Mengubah...' : 'Ubah Password'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
