# JWT Authentication Implementation

## Overview
Aplikasi ini sekarang menggunakan JWT (JSON Web Tokens) untuk authentication yang aman, cocok untuk deployment di Vercel public.

## Features
- **Secure JWT Authentication**: Token disimpan dalam httpOnly cookies
- **Dual Token Storage**: Fallback menggunakan localStorage untuk development
- **Role-based Access Control**: Admin dan customer memiliki akses berbeda
- **Protected Routes**: Middleware melindungi route sensitive
- **Auto Token Verification**: Token diverifikasi otomatis di setiap request

## JWT Configuration

### Environment Variables
```bash
# JWT Secret - Harus aman dan minimal 32 karakter
JWT_SECRET="8f9a2b5c7d1e3f4a6b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a"
```

## Authentication Flow

### 1. Login Process
1. User submit credentials di `/login`
2. Server verify password dengan bcryptjs
3. Server generate JWT token dengan payload: `{ userId, email, role }`
4. Token disimpan dalam:
   - **httpOnly cookie** (primary, secure)
   - **localStorage** (fallback untuk development)

### 2. Token Verification
- Setiap request ke protected routes diverifikasi oleh middleware
- Token dapat diambil dari:
  - Authorization header: `Bearer <token>`
  - httpOnly cookie: `auth-token`

### 3. Logout Process
- Clear httpOnly cookie
- Clear localStorage token
- Redirect ke login page

## Protected Routes

### User Routes (Require Authentication)
- `/checkout/*` - Halaman checkout
- `/profile/*` - Halaman profile user

### Admin Routes (Require Admin Role)
- `/admin/*` - Dashboard admin

## API Authentication

### Protected Endpoints
- `POST /api/transactions` - Require user authentication
- `GET /api/transactions` - Filter berdasarkan user role
- `PUT /api/transactions/[id]` - Require admin
- `POST /api/products` - Require admin
- `PUT /api/products/[id]` - Require admin
- `DELETE /api/products/[id]` - Require admin

### Usage Examples

#### Client-side dengan AuthContext
```typescript
import { useAuth } from '@/contexts/AuthContext'

function MyComponent() {
  const { user, isAuthenticated, isAdmin, login, logout } = useAuth()
  
  if (!isAuthenticated) {
    return <div>Please login</div>
  }
  
  return <div>Welcome {user?.name}</div>
}
```

#### API Request dengan Token
```typescript
// Automatic dengan AuthContext
const response = await fetch('/api/transactions', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}` // Optional fallback
  },
  body: JSON.stringify(data),
  credentials: 'include' // Include cookies
})
```

## Security Features

### 1. Token Security
- **httpOnly cookies**: Tidak dapat diakses JavaScript, aman dari XSS
- **Secure flag**: Hanya dikirim via HTTPS di production
- **SameSite**: Perlindungan CSRF attack
- **Expiration**: Token expire dalam 7 hari

### 2. Role-based Access
- Admin: Full access ke semua fitur
- Customer: Hanya akses ke transaksi mereka sendiri

### 3. Middleware Protection
- Automatic redirect ke login untuk route yang membutuhkan auth
- Role verification untuk admin routes

## Development vs Production

### Development (localhost)
- Token disimpan di localStorage sebagai fallback
- Secure flag disabled untuk cookies
- Detailed error messages

### Production (Vercel)
- Token hanya dalam httpOnly cookies
- Secure flag enabled
- Minimal error exposure

## Migration dari localStorage

Sistem lama yang menggunakan localStorage masih supported sebagai fallback:
- Existing users akan otomatis migrate ke JWT system
- AuthContext handle backward compatibility
- Gradual migration tanpa disruption

## Deployment Checklist

### 1. Environment Variables
Pastikan `.env.production` berisi:
```bash
JWT_SECRET="your-secure-secret-key"
```

### 2. Vercel Configuration
- JWT_SECRET harus di-set di Vercel dashboard
- Secret harus sama di development dan production

### 3. Security Verification
- [x] JWT Secret minimal 32 karakter
- [x] httpOnly cookies enabled
- [x] Secure flag untuk production
- [x] SameSite protection
- [x] Role-based access control
- [x] Protected API endpoints

## Testing

### Login Test
```bash
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@digitalstore.com","password":"admin123"}' \
  -c cookies.txt
```

### Protected API Test
```bash
curl -X GET http://localhost:3001/api/auth/me \
  -b cookies.txt
```

### Logout Test
```bash
curl -X POST http://localhost:3001/api/auth/logout \
  -b cookies.txt
```

## Troubleshooting

### Common Issues

1. **"Authentication required" error**
   - Check if JWT_SECRET is set
   - Verify token tidak expired
   - Pastikan cookies dikirim

2. **"Admin access required" error**
   - Verify user role = 'admin'
   - Check token payload

3. **Token tidak tersimpan**
   - Check cookie settings
   - Verify domain/path configuration

### Debug Commands
```typescript
// Check current user
console.log(getCurrentUser(request))

// Verify token manually
console.log(verifyToken(token))
```

## Next Steps

1. **Email Integration**: JWT dapat integrate dengan email verification
2. **Refresh Tokens**: Implement refresh token untuk security yang lebih baik
3. **Rate Limiting**: Add rate limiting untuk login attempts
4. **Audit Logging**: Track authentication events

---

**Status**: ✅ Production Ready untuk Vercel Deployment
