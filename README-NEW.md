# Digital Store - Platform Penjualan File Digital

Platform modern untuk penjualan file digital menggunakan Next.js, Tailwind CSS, Vercel Postgres, dan Vercel Blob.

## 🚀 Fitur Utama

### Untuk Pelanggan
- **Registrasi & Login** - Sistem autentikasi dengan bcrypt
- **Katalog Produk** - Browse dan search produk digital
- **Detail Produk** - Informasi lengkap dengan preview
- **Checkout System** - Pembayaran dengan upload bukti transfer
- **Profile Management** - Lihat riwayat pembelian

### Untuk Admin
- **Dashboard Modern** - Interface admin dengan SVG icons
- **Manajemen Produk** - CRUD operations lengkap
- **Verifikasi Transaksi** - Review bukti pembayaran dengan image viewer
- **Statistics Overview** - Monitoring penjualan real-time

## 🛠 Tech Stack

- **Frontend**: Next.js 14 + TypeScript + Tailwind CSS
- **Database**: Vercel Postgres (Neon)
- **File Storage**: Vercel Blob Storage
- **Email**: Nodemailer
- **Authentication**: bcryptjs
- **Deployment**: Vercel

## 📦 Quick Start

1. **Clone & Install**
   ```bash
   git clone <repository-url>
   cd jualan
   npm install
   ```

2. **Environment Setup**
   ```bash
   cp .env.production .env.local
   # Edit .env.local with your credentials
   ```

3. **Initialize Database**
   ```bash
   npm run dev
   # Visit http://localhost:3000/api/init
   ```

4. **Admin Access**
   - Email: admin@digitalstore.com
   - Password: admin123

## 🗄 Database Schema

```sql
-- Users: Authentication & roles
-- Products: Digital products catalog  
-- Transactions: Purchase & payment tracking
```

## 📱 Production Ready

✅ **Performance**
- Static generation where possible
- Image optimization with Sharp
- Vercel Edge Functions

✅ **Security**
- Password hashing
- Input validation
- Secure file upload to Blob Storage
- SQL injection protection

✅ **User Experience**  
- Responsive design (mobile-first)
- Loading states & error handling
- Real-time form validation
- Modern UI with hover effects

✅ **Admin Features**
- Modern dashboard with statistics
- Image viewer for payment proofs
- Bulk operations
- Real-time data updates

## 🚀 Deploy to Vercel

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod
```

See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed instructions.

## 📄 License

MIT License

---

**Ready for Production** 🚀 Modern digital marketplace with secure payment system.
