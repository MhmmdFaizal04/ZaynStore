# Digital Store - Platform Penjualan File Digital

Platform modern untuk penjualan file digital menggunakan Next.js, Tailwind CSS, Vercel Postgres, dan Vercel Blob dengan fitur upload gambar terintegrasi.

## 🚀 Fitur Utama

### Untuk Pelanggan
- **Registrasi & Login** - Sistem autentikasi dengan JWT
- **Katalog Produk** - Jelajahi berbagai file digital dengan gambar preview
- **Detail Produk** - Informasi lengkap dan preview visual produk
- **Checkout QRIS** - Pembayaran mudah dengan scan QRIS
- **Upload Bukti Bayar** - Sistem verifikasi pembayaran manual
- **Download Otomatis** - Link download dikirim setelah verifikasi

### Untuk Admin
- **Dashboard Admin** - Kelola produk dan transaksi dengan JWT authentication
- **Upload Gambar Produk** - Upload gambar langsung ke Vercel Blob via form
- **Manajemen Produk** - Tambah, edit, hapus produk dengan preview gambar
- **Change Password** - Ubah password admin via UI atau API endpoint
- **Verifikasi Pembayaran** - Review dan approve transaksi
- **File Management** - Upload file produk ke Vercel Blob storage

## 🛠 Teknologi yang Digunakan

- **Frontend**: Next.js 14 + TypeScript
- **Styling**: Tailwind CSS dengan komponen responsive
- **Database**: Vercel Postgres (Neon)
- **File Storage**: Vercel Blob (images + files)
- **Image Upload**: Next.js Image component dengan optimasi
- **Authentication**: JWT + bcryptjs dengan Edge Runtime middleware
- **Forms**: Real-time validation dan loading states
- **Deployment**: Vercel dengan SSR dan static optimization

## 🎨 Fitur Upload Gambar

### ImageUploader Component
- ✅ **Drag & Drop**: Upload gambar dengan preview real-time
- ✅ **Validation**: Format JPG/PNG/GIF, max 5MB
- ✅ **Auto Upload**: Langsung upload ke Vercel Blob
- ✅ **Error Handling**: Feedback visual untuk errors
- ✅ **Loading States**: Progress indicator selama upload

### Admin Forms
- **Add Product**: Form dengan ImageUploader terintegrasi
- **Edit Product**: Preview gambar existing + option replace
- **Table Preview**: Thumbnail gambar di admin table
- **Responsive**: Mobile-friendly upload interface

## 📦 Quick Start

1. **Clone & Install**
   ```bash
   git clone <repository-url>
   cd jualan
   npm install
   ```

2. **Environment Setup**
   Copy `.env` to `.env.local` dan isi:
   ```env
   POSTGRES_URL="your-postgres-connection-string"
   BLOB_READ_WRITE_TOKEN="your-vercel-blob-token"
   JWT_SECRET="your-secure-jwt-secret-minimum-32-characters"
   NEXT_PUBLIC_APP_URL="http://localhost:3000"
   ```

3. **Development**
   ```bash
   npm run dev
   # Visit http://localhost:3000/api/init to setup database
   ```

4. **Default Admin Login**
   - Email: `admin@digitalstore.com`
   - Password: `admin123`

## 🗄 Database Schema

### Users Table
```sql
- id (SERIAL PRIMARY KEY)
- email (VARCHAR UNIQUE)
- name (VARCHAR)
- password (VARCHAR)
- role (admin/customer)
- created_at, updated_at
```

### Products Table
```sql
- id (SERIAL PRIMARY KEY)
- name (VARCHAR)
- description (TEXT)
- price (INTEGER)
- image_url (TEXT)
- file_url (TEXT)
- category (VARCHAR)
- created_at, updated_at
```

### Transactions Table
```sql
- id (SERIAL PRIMARY KEY)
- user_id (FK to users)
- product_id (FK to products)
- amount (INTEGER)
- status (pending/approved/rejected)
- payment_proof (TEXT)
- download_link (TEXT)
- created_at, updated_at
```

## 📝 API Endpoints

### Authentication
- `POST /api/auth/login` - Login user
- `POST /api/auth/register` - Register user

### Products
- `GET /api/products` - Get all products
- `GET /api/products/[id]` - Get product detail
- `POST /api/products` - Create product (admin)
- `PUT /api/products/[id]` - Update product (admin)
- `DELETE /api/products/[id]` - Delete product (admin)

### Transactions
- `GET /api/transactions` - Get transactions
- `POST /api/transactions` - Create transaction

### Database
- `POST /api/init` - Initialize database & seed data

## 👤 Default Admin Account

Setelah inisialisasi database, gunakan akun admin default:
- **Email**: admin@digitalstore.com
- **Password**: admin123

## 🚀 Deployment ke Vercel

1. **Push ke GitHub**
   ```bash
   git add .
   git commit -m "Initial commit"
   git push origin main
   ```

2. **Deploy ke Vercel**
   - Import project dari GitHub
   - Setup environment variables
   - Deploy

3. **Setup Database**
   - Buat Vercel Postgres database
   - Update environment variables
   - Akses `/api/init` untuk setup

## 📱 Responsive Design

Website ini fully responsive dengan breakpoints:
- Mobile: < 640px
- Tablet: 640px - 1024px  
- Desktop: > 1024px

## 🔐 Security Features

- JWT authentication dengan httpOnly cookies
- Password hashing dengan bcryptjs
- Role-based access control (admin/customer)
- Edge Runtime compatible middleware
- File type validation untuk upload
- SQL injection protection
- Input sanitization
- Secure file storage dengan Vercel Blob

## 🚀 Deployment

### Quick Deploy ke Vercel

1. **Setup Repository**
```bash
git add .
git commit -m "Ready for deployment"
git push origin main
```

2. **Deploy ke Vercel**
- Import project dari GitHub
- Configure environment variables (lihat `.env.example`)
- Deploy

3. **Initialize Database**
- Kunjungi `https://your-app.vercel.app/api/init`
- Database tables akan dibuat otomatis

4. **Default Admin Login**
- Email: `admin@digitalstore.com`
- Password: `admin123`

### Environment Variables Required

```bash
# Database (Vercel Postgres)
POSTGRES_URL="postgresql://..."
POSTGRES_URL_NON_POOLING="postgresql://..."

# File Storage (Vercel Blob)
BLOB_READ_WRITE_TOKEN="your-blob-token"

# Authentication
JWT_SECRET="your-jwt-secret-min-32-chars"

# App Configuration
NEXT_PUBLIC_APP_URL="https://your-app.vercel.app"

# Payment (QRIS)
NEXT_PUBLIC_QRIS_IMAGE_URL="your-qris-image-url"
NEXT_PUBLIC_MERCHANT_NAME="Your Store Name"
NEXT_PUBLIC_PAYMENT_INFO="Payment instructions"
```

📝 **Lihat `DEPLOYMENT-GUIDE.md` untuk panduan lengkap deployment.**

## ✅ Ready for Production

### Deployment Checklist
- [x] **Build Success**: Production build tested and optimized
- [x] **Security**: JWT authentication with httpOnly cookies
- [x] **File Upload**: Integrated Vercel Blob storage system
- [x] **Database**: Vercel Postgres with proper schema
- [x] **Admin Tools**: Password management and product upload
- [x] **Environment**: Template configuration for secure deployment
- [x] **Documentation**: Complete deployment guide included

### Post-Deployment Steps
1. **Initialize Database**: Visit `/api/init` after deployment
2. **Change Admin Password**: Login and update default password
3. **Upload QRIS**: Add your payment QR code via admin panel
4. **Test Features**: Verify upload, checkout, and download functionality

## 🎯 Sample Products

Database akan di-seed dengan 5 produk sample:
1. Template Website E-commerce (Rp 150,000)
2. UI Kit Mobile App (Rp 200,000)
3. Logo Pack Startup (Rp 100,000)
4. Icon Set Business (Rp 75,000)
5. Stock Photos Pack (Rp 120,000)

## 🤝 Contributing

1. Fork repository
2. Create feature branch
3. Commit changes
4. Push to branch
5. Create Pull Request

## 📄 License

MIT License - lihat file LICENSE untuk detail.

## 🆘 Support

Untuk bantuan teknis atau pertanyaan:
- Email: support@digitalstore.com
- GitHub Issues: [Link ke issues]

---

**Digital Store** - Platform penjualan file digital modern dan terpercaya 🚀
