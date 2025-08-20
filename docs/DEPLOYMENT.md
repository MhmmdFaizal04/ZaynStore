# Deployment Guide

## Environment Variables Required for Vercel

Tambahkan environment variables berikut di Vercel Dashboard:

```bash
# Database Configuration - Vercel Postgres (Neon)
POSTGRES_URL=postgres://neondb_owner:npg_PkGQeSAoM50g@ep-mute-credit-adnstcdv-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require

# Blob Storage - Vercel Blob
BLOB_READ_WRITE_TOKEN=vercel_blob_rw_DL5AzJdRGAwTZJmI_4Pg11XAUATWDGQsD5DUgLgIpJYmDxL

# Payment Configuration - QRIS (Opsional)
NEXT_PUBLIC_QRIS_IMAGE_URL=https://your-blob-url/qris-code.png
NEXT_PUBLIC_MERCHANT_NAME=Digital Store
NEXT_PUBLIC_PAYMENT_INFO=Scan QRIS di atas dan upload bukti pembayaran

# Email Configuration - Nodemailer (Opsional)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
EMAIL_FROM=Digital Store <noreply@digitalstore.com>

# Application Settings
NEXT_PUBLIC_APP_URL=https://your-app-name.vercel.app
```

## Setup QRIS Manual

### 1. Persiapan QRIS:
- Siapkan gambar QRIS statis dari bank/e-wallet Anda
- Format: PNG atau JPG, ukuran maksimal 5MB
- Pastikan QR code terlihat jelas dan dapat discan

### 2. Upload QRIS:
1. Login ke admin dashboard
2. Pilih tab "Pengaturan"
3. Upload gambar QRIS melalui form yang tersedia
4. Copy URL yang dihasilkan
5. Set environment variable `NEXT_PUBLIC_QRIS_IMAGE_URL` di Vercel
6. Deploy ulang aplikasi

### 3. Kustomisasi Info:
- `NEXT_PUBLIC_MERCHANT_NAME`: Nama toko Anda
- `NEXT_PUBLIC_PAYMENT_INFO`: Instruksi pembayaran custom

## Langkah Deploy

1. **Install Vercel CLI**:
   ```bash
   npm i -g vercel
   ```

2. **Login ke Vercel**:
   ```bash
   vercel login
   ```

3. **Deploy**:
   ```bash
   vercel --prod
   ```

## Post-Deploy Checklist

- [ ] Database tables sudah dibuat via `/api/init`
- [ ] Admin user sudah diregistrasi
- [ ] Upload gambar berfungsi dengan Blob Storage
- [ ] Email notification (jika dikonfigurasi)
- [ ] SSL certificate aktif
- [ ] Domain custom (opsional)

## Features Ready for Production

✅ **Authentication System**
- Login/Register dengan bcrypt
- Role-based access (admin/user)
- Session management dengan localStorage

✅ **Product Management**
- CRUD operations via admin dashboard
- Image upload untuk produk
- Kategori dan pricing

✅ **Transaction System**
- Checkout flow lengkap
- Payment proof upload ke Vercel Blob
- Admin approval/rejection system
- Email notifications

✅ **File Storage**
- Vercel Blob untuk payment proofs
- CDN global untuk fast access
- Secure file handling

✅ **Database**
- Vercel Postgres (Neon) production-ready
- Proper indexing dan relations
- Connection pooling

✅ **UI/UX**
- Responsive design
- Modern SVG icons
- Loading states
- Error handling

## Architecture Overview

```
Frontend (Next.js 14)
├── Pages: /, /products, /admin, /profile
├── API Routes: /api/auth, /api/products, /api/transactions
└── Components: Header, Footer, ProductGrid

Backend
├── Database: Vercel Postgres (Neon)
├── File Storage: Vercel Blob
├── Email: Nodemailer
└── Authentication: bcryptjs

Deployment
└── Vercel (CDN + Serverless Functions)
```
