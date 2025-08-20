import { NextRequest, NextResponse } from 'next/server'
import { sql } from '@vercel/postgres'
import { verifyPassword } from '@/lib/utils'
import { signToken } from '@/lib/jwt'

// Force dynamic rendering for this API route
export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const contentType = request.headers.get('content-type')
    let requestData
    
    if (contentType?.includes('application/json')) {
      const body = await request.text()
      
      try {
        requestData = JSON.parse(body)
      } catch (e) {
        return NextResponse.json(
          { error: 'Invalid JSON in request body' },
          { status: 400 }
        )
      }
    } else {
      // Handle form data
      const formData = await request.formData()
      requestData = {
        email: formData.get('email') as string,
        password: formData.get('password') as string,
        redirect: formData.get('redirect') as string
      }
    }
    
    const { email, password, redirect } = requestData

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email dan password harus diisi' },
        { status: 400 }
      )
    }

    // Find user by email
    const result = await sql`
      SELECT id, email, name, password, role 
      FROM users 
      WHERE email = ${email}
    `

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: 'Email atau password salah' },
        { status: 401 }
      )
    }

    const user = result.rows[0]

    // Verify password
    const isValidPassword = await verifyPassword(password, user.password)

    if (!isValidPassword) {
      return NextResponse.json(
        { error: 'Email atau password salah' },
        { status: 401 }
      )
    }

    // Generate JWT token
    const token = signToken({
      userId: user.id,
      email: user.email,
      role: user.role
    })

    // Return user data (without password) and token
    const { password: _, ...userWithoutPassword } = user

    // Check if this is a form submission that needs redirect
    if (redirect) {
      
      // Create HTML page with JavaScript redirect after cookie is set
      const redirectHtml = `
<!DOCTYPE html>
<html>
<head>
    <title>Redirecting...</title>
    <meta http-equiv="refresh" content="5;url=${redirect}">
</head>
<body>
    <div style="display: flex; justify-content: center; align-items: center; height: 100vh; font-family: Arial, sans-serif;">
        <div style="text-align: center;">
            <h2>Login Berhasil!</h2>
            <p>Mengalihkan ke dashboard admin...</p>
            <p><a href="${redirect}">Klik disini jika tidak teralihkan otomatis</a></p>
            <script>
                setTimeout(function() {
                    window.location.href = '${redirect}';
                }, 3000);
            </script>
        </div>
    </div>
</body>
</html>`
      
      const response = new NextResponse(redirectHtml, {
        status: 200,
        headers: {
          'Content-Type': 'text/html'
        }
      })
      
      // Set httpOnly cookie
      response.cookies.set('auth-token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 7 * 24 * 60 * 60,
        path: '/'
      })
      
      return response
    }

    // Create JSON response for API calls
    const response = NextResponse.json({
      message: 'Login berhasil',
      user: userWithoutPassword,
      token // Also send token in response for localStorage fallback
    })

    // Set httpOnly cookie for security
    response.cookies.set('auth-token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production', // Secure only in production
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60, // 7 days
      path: '/'
    })

    return response

  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json(
      { error: 'Terjadi kesalahan server' },
      { status: 500 }
    )
  }
}
