# Digital Store - Deployment Guide

## Persiapan Deployment

### 1. Environment Variables yang Diperlukan

Pastikan Anda sudah mengatur environment variables berikut di Vercel:

```bash
# Database
POSTGRES_URL="postgresql://username:password@hostname:port/database?sslmode=require"
POSTGRES_PRISMA_URL="postgresql://username:password@hostname:port/database?sslmode=require&pgbouncer=true&connect_timeout=15"
POSTGRES_URL_NON_POOLING="postgresql://username:password@hostname:port/database?sslmode=require"
POSTGRES_USER="username"
POSTGRES_HOST="hostname"
POSTGRES_PASSWORD="password"
POSTGRES_DATABASE="database"

# Blob Storage
BLOB_READ_WRITE_TOKEN="your-vercel-blob-token"

# JWT Secret
JWT_SECRET="your-super-secret-jwt-key-min-32-chars"

# Next.js
NEXT_PUBLIC_BASE_URL="https://your-app.vercel.app"
```

### 2. Database Setup

Aplikasi ini menggunakan Vercel Postgres. Database tables akan dibuat otomatis saat pertama kali mengakses `/api/init`.

**Tables yang dibuat:**
- `users` (untuk authentication)
- `products` (untuk produk digital)
- `transactions` (untuk transaksi)

### 3. File Upload Setup

Aplikasi menggunakan Vercel Blob untuk menyimpan:
- File produk digital
- Bukti pembayaran
- Gambar produk

### 4. Admin Account

**Default admin account:**
- Email: `admin@digitalstore.com`
- Password: `admin123`
- Role: `admin`

Setelah deployment, Anda bisa login menggunakan kredensial ini dan mengubah password.

## Steps Deployment

### 1. Push ke GitHub
```bash
git add .
git commit -m "Ready for deployment"
git push origin main
```

### 2. Deploy ke Vercel
1. Buka [vercel.com](https://vercel.com)
2. Connect GitHub repository
3. Configure environment variables
4. Deploy

### 3. Initialize Database
Setelah deployment berhasil:
1. Kunjungi `https://your-app.vercel.app/api/init`
2. Database tables akan dibuat otomatis
3. Admin user akan dibuat

### 4. Test Authentication
1. Kunjungi `https://your-app.vercel.app/login`
2. Login dengan admin credentials
3. Akses admin dashboard di `https://your-app.vercel.app/admin`

## Security Features

### 1. JWT Authentication
- Secure httpOnly cookies in production
- Token expiration (7 days)
- Role-based access control

### 2. Middleware Protection
- Route protection untuk `/admin`, `/profile`, `/checkout`
- Edge Runtime compatible
- Automatic redirect ke login page

### 3. Password Security
- Bcrypt hashing untuk password
- Secure password validation

## Production Considerations

### 1. Cookie Configuration
- `secure: true` in production
- `sameSite: 'lax'` untuk cross-origin requests
- `httpOnly: true` untuk security

### 2. Environment Variables
- Gunakan strong JWT secret (min 32 characters)
- Database credentials yang secure
- Proper CORS configuration

### 3. File Storage
- Vercel Blob dengan proper access controls
- File validation untuk upload
- Secure file serving

## Troubleshooting

### 1. Authentication Issues
Jika middleware tidak bekerja dengan cookies:
- Check environment variables
- Verify cookie domain/path
- Check browser developer tools

### 2. Database Connection
- Verify Postgres connection string
- Check database permissions
- Run `/api/init` untuk setup tables

### 3. File Upload Issues
- Check Blob storage token
- Verify file size limits
- Check CORS configuration

## Post-Deployment Tasks

1. **Change Admin Password**
2. **Configure File Upload Limits**
3. **Setup Email Notifications** (optional)
4. **Configure Payment Gateway** (if needed)
5. **Setup Monitoring and Analytics**

## Support

Untuk issues atau pertanyaan terkait deployment, check:
- Vercel documentation
- GitHub repository issues
- Application logs di Vercel dashboard
