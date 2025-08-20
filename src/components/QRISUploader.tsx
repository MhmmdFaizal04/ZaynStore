import { useState } from 'react'

interface QRISUploaderProps {
  onUploadComplete: (url: string) => void
}

export default function QRISUploader({ onUploadComplete }: QRISUploaderProps) {
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('File harus berupa gambar')
      return
    }

    // Validate file size (max 2MB for QR codes)
    if (file.size > 2 * 1024 * 1024) {
      setError('Ukuran file maksimal 2MB')
      return
    }

    setUploading(true)
    setError('')

    try {
      const formData = new FormData()
      formData.append('file', file)

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Gagal mengupload QRIS')
      }

      const result = await response.json()
      onUploadComplete(result.url)
      
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Terjadi kesalahan')
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="space-y-4">
      <div>
        <label className="form-label">Upload QRIS Code</label>
        <input
          type="file"
          accept="image/*"
          onChange={handleUpload}
          disabled={uploading}
          className="form-input file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-primary-50 file:text-primary-700 hover:file:bg-primary-100"
        />
        <p className="mt-1 text-xs text-gray-500">
          Upload gambar QRIS statis Anda. Format: JPG, PNG. Maksimal 2MB.
        </p>
      </div>

      {uploading && (
        <div className="flex items-center text-blue-600">
          <svg className="animate-spin -ml-1 mr-3 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          Mengupload QRIS...
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}
    </div>
  )
}
