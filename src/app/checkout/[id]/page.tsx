'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { formatCurrency } from '@/lib/utils'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import { useAuth } from '@/contexts/AuthContext'

interface Product {
  id: number
  name: string
  description: string
  price: number
  image_url?: string
  category: string
}

export default function CheckoutPage({ params }: { params: { id: string } }) {
  const [product, setProduct] = useState<Product | null>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [paymentProof, setPaymentProof] = useState<File | null>(null)
  const { user, isAuthenticated, loading: authLoading, token } = useAuth()
  const router = useRouter()

  const fetchProduct = useCallback(async () => {
    try {
      const response = await fetch(`/api/products/${params.id}`)
      const data = await response.json()

      if (response.ok) {
        setProduct(data.product)
      } else {
        setError(data.error)
      }
    } catch (error) {
      setError('Terjadi kesalahan saat memuat produk')
    } finally {
      setLoading(false)
    }
  }, [params.id])

  useEffect(() => {
    // Check if user is authenticated
    if (!authLoading && !isAuthenticated) {
      router.push('/login')
      return
    }

    if (isAuthenticated) {
      // Fetch product details
      fetchProduct()
    }
  }, [params.id, isAuthenticated, authLoading, router, fetchProduct])

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      // Validate file type (image only)
      if (!file.type.startsWith('image/')) {
        setError('File harus berupa gambar')
        return
      }
      
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setError('Ukuran file maksimal 5MB')
        return
      }
      
      setPaymentProof(file)
      setError('')
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!paymentProof) {
      setError('Silakan upload bukti pembayaran')
      return
    }

    if (!user) {
      setError('User tidak terautentikasi')
      return
    }

    setSubmitting(true)
    setError('')

    try {
      // Upload payment proof file first
      const formData = new FormData()
      formData.append('file', paymentProof)
      
      const uploadResponse = await fetch('/api/upload', {
        method: 'POST',
        body: formData
      })
      
      if (!uploadResponse.ok) {
        const uploadError = await uploadResponse.json()
        setError(uploadError.error || 'Gagal mengupload bukti pembayaran')
        return
      }
      
      const uploadResult = await uploadResponse.json()
      const paymentProofUrl = uploadResult.url // Gunakan URL Blob, bukan filename

      // Prepare headers with authentication
      const headers: HeadersInit = {
        'Content-Type': 'application/json'
      }

      // Add token to Authorization header if available
      if (token) {
        headers['Authorization'] = `Bearer ${token}`
      }

      const response = await fetch('/api/transactions', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          product_id: product?.id,
          amount: product?.price,
          payment_proof: paymentProofUrl
        }),
        credentials: 'include' // Include cookies for httpOnly JWT
      })

      const data = await response.json()

      if (response.ok) {
        setSuccess(true)
      } else {
        setError(data.error)
      }
    } catch (error) {
      setError('Terjadi kesalahan. Silakan coba lagi.')
    } finally {
      setSubmitting(false)
    }
  }

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-2xl mx-auto text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black mx-auto"></div>
            <p className="mt-4 text-gray-600">Memuat data checkout...</p>
          </div>
        </div>
        <Footer />
      </div>
    )
  }

  if (error && !product) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="container mx-auto px-4 py-16 text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Terjadi Kesalahan</h1>
          <p className="text-gray-600 mb-8">{error}</p>
          <Link href="/" className="btn-primary">
            Kembali ke Beranda
          </Link>
        </div>
        <Footer />
      </div>
    )
  }

  if (success) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-2xl mx-auto text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-8 h-8 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            </div>
            <h1 className="text-3xl font-serif font-bold text-gray-900 mb-4">
              Pesanan Berhasil Dibuat!
            </h1>
            <p className="text-gray-600 mb-8">
              Terima kasih atas pesanan Anda. Kami akan memverifikasi pembayaran dalam 1x24 jam. 
              Link download akan dikirimkan ke email Anda setelah pembayaran dikonfirmasi.
            </p>
            <div className="space-y-4">
              <Link href="/profile?tab=orders" className="btn-primary">
                Lihat Status Pesanan
              </Link>
              <Link href="/" className="btn-secondary block">
                Kembali ke Beranda
              </Link>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-serif font-bold text-gray-900 mb-8 text-center">
            Checkout Produk
          </h1>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Product Summary */}
            <div className="card">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Ringkasan Pesanan</h2>
              
              {product && (
                <div className="space-y-4">
                  <div className="flex space-x-4">
                    <div className="w-20 h-20 bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden">
                      {product.image_url ? (
                        <Image 
                          src={product.image_url} 
                          alt={product.name}
                          width={80}
                          height={80}
                          className="w-full h-full object-cover rounded-lg"
                        />
                      ) : (
                        <svg className="w-8 h-8 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
                        </svg>
                      )}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900">{product.name}</h3>
                      <p className="text-sm text-gray-500">{product.category}</p>
                      <p className="text-lg font-bold text-black mt-1">
                        {formatCurrency(product.price)}
                      </p>
                    </div>
                  </div>

                  <div className="border-t border-gray-200 pt-4">
                    <div className="flex justify-between items-center text-lg font-semibold">
                      <span>Total Pembayaran:</span>
                      <span className="text-black">{formatCurrency(product.price)}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Payment Form */}
            <div className="card">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Pembayaran</h2>

              {/* QRIS Code */}
              <div className="mb-6">
                <h3 className="font-medium text-gray-900 mb-3 flex items-center">
                  <svg className="w-5 h-5 mr-2 text-black" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z" />
                  </svg>
                  Scan QRIS untuk Pembayaran
                </h3>
                
                <div className="bg-gradient-to-br from-gray-50 to-gray-100 border-2 border-gray-200 rounded-xl p-6 text-center">
                  {/* QRIS Image */}
                  <div className="w-64 h-64 bg-white border-2 border-gray-200 rounded-xl mx-auto mb-4 flex items-center justify-center shadow-lg overflow-hidden">
                    {process.env.NEXT_PUBLIC_QRIS_IMAGE_URL ? (
                      <Image 
                        src={process.env.NEXT_PUBLIC_QRIS_IMAGE_URL}
                        alt="QRIS Code"
                        width={256}
                        height={256}
                        className="w-full h-full object-contain rounded-xl"
                        onError={(e) => {
                          console.error('QRIS image failed to load:', process.env.NEXT_PUBLIC_QRIS_IMAGE_URL);
                          e.currentTarget.style.display = 'none';
                          const fallback = e.currentTarget.nextElementSibling as HTMLElement;
                          if (fallback) fallback.style.display = 'flex';
                        }}
                      />
                    ) : null}
                    <div 
                      className="flex flex-col items-center justify-center text-gray-400"
                      style={{display: process.env.NEXT_PUBLIC_QRIS_IMAGE_URL ? 'none' : 'flex'}}
                    >
                      <svg className="w-16 h-16 mb-4" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z" />
                      </svg>
                      <p className="text-sm text-center">QRIS Code<br />akan ditampilkan di sini</p>
                    </div>
                  </div>
                  
                  {/* Merchant Info */}
                  <div className="space-y-2">
                    <p className="text-lg font-bold text-gray-900">
                      {process.env.NEXT_PUBLIC_MERCHANT_NAME || 'Digital Store'}
                    </p>
                    <p className="text-sm text-gray-600">
                      {process.env.NEXT_PUBLIC_PAYMENT_INFO || 'Scan dengan aplikasi mobile banking atau e-wallet Anda'}
                    </p>
                    <div className="bg-white rounded-lg px-4 py-2 inline-block">
                      <p className="text-2xl font-bold text-black">
                        {product && formatCurrency(product.price)}
                      </p>
                    </div>
                  </div>

                  {/* Payment Instructions */}
                  <div className="mt-4 text-left bg-white rounded-lg p-4">
                    <h4 className="font-medium text-gray-900 mb-2">Cara Pembayaran:</h4>
                    <ol className="text-sm text-gray-600 space-y-1">
                      <li>1. Buka aplikasi mobile banking atau e-wallet</li>
                      <li>2. Pilih menu scan QR/QRIS</li>
                      <li>3. Scan QR code di atas</li>
                      <li>4. Masukkan nominal: <span className="font-bold">{product && formatCurrency(product.price)}</span></li>
                      <li>5. Konfirmasi pembayaran</li>
                      <li>6. Screenshot bukti pembayaran</li>
                      <li>7. Upload bukti di form bawah ini</li>
                    </ol>
                  </div>
                </div>
              </div>

              {/* Upload Payment Proof */}
              <form onSubmit={handleSubmit} className="space-y-6">
                {error && (
                  <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg">
                    {error}
                  </div>
                )}

                <div>
                  <label className="form-label">
                    Upload Bukti Pembayaran *
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    required
                    className="form-input file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-gray-50 file:text-black hover:file:bg-gray-100"
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    Format: JPG, PNG, atau GIF. Maksimal 5MB.
                  </p>
                  {paymentProof && (
                    <p className="mt-2 text-sm text-green-600">
                      ✓ File terpilih: {paymentProof.name}
                    </p>
                  )}
                </div>

                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                  <h4 className="font-medium text-gray-900 mb-2">Petunjuk Pembayaran:</h4>
                  <ol className="text-sm text-gray-800 space-y-1">
                    <li>1. Scan QRIS code di atas menggunakan aplikasi mobile banking</li>
                    <li>2. Pastikan nominal pembayaran sesuai dengan total pesanan</li>
                    <li>3. Jika Nominal Pembayaran Lebih Atau Kurang Maka Di Anggap Hangus, SNK Berlaku</li>
                    <li>4. Lakukan pembayaran dan simpan bukti transaksi</li>
                    <li>5. Upload screenshot bukti pembayaran di form ini</li>
                    <li>6. Kami akan memverifikasi dalam 1x24 jam</li>
                  </ol>
                </div>

                <button
                  type="submit"
                  disabled={submitting || !paymentProof}
                  className="w-full btn-primary py-3 text-lg font-semibold disabled:opacity-50"
                >
                  {submitting ? 'Memproses...' : 'Konfirmasi Pembayaran'}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  )
}
