'use client'

import { useState } from 'react'
import Image from 'next/image'

interface ImageUploaderProps {
  onUploadSuccess: (imageUrl: string) => void
  currentImageUrl?: string
  className?: string
}

export default function ImageUploader({ onUploadSuccess, currentImageUrl, className = '' }: ImageUploaderProps) {
  const [uploading, setUploading] = useState(false)
  const [previewUrl, setPreviewUrl] = useState<string | null>(currentImageUrl || null)
  const [error, setError] = useState<string | null>(null)

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    // Validasi file
    if (!file.type.startsWith('image/')) {
      setError('File harus berupa gambar (JPG, PNG, GIF, dll.)')
      return
    }

    if (file.size > 5 * 1024 * 1024) { // 5MB
      setError('Ukuran file maksimal 5MB')
      return
    }

    setError(null)
    setUploading(true)

    try {
      // Preview file sebelum upload
      const previewUrl = URL.createObjectURL(file)
      setPreviewUrl(previewUrl)

      // Upload file
      const formData = new FormData()
      formData.append('file', file)

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData
      })

      const result = await response.json()

      if (response.ok) {
        // Set URL final dari Vercel Blob
        setPreviewUrl(result.url)
        onUploadSuccess(result.url)
      } else {
        setError(result.error || 'Gagal mengupload gambar')
        setPreviewUrl(currentImageUrl || null)
      }
    } catch (error) {
      console.error('Upload error:', error)
      setError('Terjadi kesalahan saat mengupload')
      setPreviewUrl(currentImageUrl || null)
    } finally {
      setUploading(false)
    }
  }

  const removeImage = () => {
    setPreviewUrl(null)
    onUploadSuccess('')
    setError(null)
  }

  return (
    <div className={className}>
      <label className="form-label">Gambar Produk</label>
      
      {/* Upload Area */}
      <div className="space-y-4">
        {/* Preview */}
        {previewUrl ? (
          <div className="relative">
            <div className="w-full h-48 bg-gray-100 rounded-lg overflow-hidden border-2 border-gray-200">
              <Image
                src={previewUrl} 
                alt="Preview produk" 
                width={400}
                height={300}
                className="w-full h-full object-cover"
                onError={() => {
                  setError('Gagal memuat preview gambar')
                  setPreviewUrl(null)
                }}
              />
            </div>
            <button
              type="button"
              onClick={removeImage}
              className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white rounded-full p-1 transition-colors"
              title="Hapus gambar"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        ) : (
          <div className="w-full h-48 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center hover:border-gray-400 transition-colors">
            <div className="text-center">
              <svg className="w-12 h-12 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
              <p className="text-gray-500 text-sm">Belum ada gambar dipilih</p>
            </div>
          </div>
        )}

        {/* Upload Button */}
        <div className="flex items-center gap-4">
          <label className={`inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors ${uploading ? 'opacity-50 cursor-not-allowed' : ''}`}>
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
            {uploading ? 'Mengupload...' : 'Pilih Gambar'}
            <input
              type="file"
              accept="image/*"
              onChange={handleFileSelect}
              disabled={uploading}
              className="hidden"
            />
          </label>
          
          {uploading && (
            <div className="flex items-center text-primary-600">
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Upload sedang berlangsung...
            </div>
          )}
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3">
            <div className="flex">
              <svg className="w-5 h-5 text-red-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              <p className="text-sm text-red-600">{error}</p>
            </div>
          </div>
        )}

        {/* Help Text */}
        <p className="text-xs text-gray-500">
          Format yang didukung: JPG, PNG, GIF. Maksimal 5MB.
          <br />
          Rekomendasi: 400x300px atau rasio 4:3 untuk tampilan optimal.
        </p>
      </div>
    </div>
  )
}
