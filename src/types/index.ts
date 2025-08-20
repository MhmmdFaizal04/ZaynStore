export interface User {
  id: number
  email: string
  name: string
  role: 'admin' | 'customer'
  created_at: Date
  updated_at: Date
}

export interface Product {
  id: number
  name: string
  description: string
  price: number
  image_url?: string
  file_url: string
  category: string
  created_at: Date
  updated_at: Date
}

export interface Transaction {
  id: number
  user_id: number
  product_id: number
  amount: number
  status: 'pending' | 'approved' | 'rejected'
  payment_proof?: string
  download_link?: string
  created_at: Date
  updated_at: Date
  user?: User
  product?: Product
}

export interface LoginCredentials {
  email: string
  password: string
}

export interface RegisterData {
  name: string
  email: string
  password: string
}

export interface ProductFormData {
  name: string
  description: string
  price: number
  category: string
  image?: File
  file: File
}
