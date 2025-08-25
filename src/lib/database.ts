import { sql } from '@vercel/postgres'

export async function initDatabase() {
  try {
    console.log('Starting database initialization...')
    
    // Create users table
    await sql`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        name VARCHAR(255) NOT NULL,
        password VARCHAR(255) NOT NULL,
        role VARCHAR(10) DEFAULT 'customer' CHECK (role IN ('admin', 'customer')),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `
    console.log('Users table created successfully')

    // Create products table
    await sql`
      CREATE TABLE IF NOT EXISTS products (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        price INTEGER NOT NULL,
        image_url TEXT,
        file_url TEXT NOT NULL,
        category VARCHAR(100),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `
    console.log('Products table created successfully')

    // Create transactions table
    await sql`
      CREATE TABLE IF NOT EXISTS transactions (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id),
        product_id INTEGER REFERENCES products(id),
        amount INTEGER NOT NULL,
        status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
        payment_proof TEXT,
        download_link TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `
    console.log('Transactions table created successfully')

    // Create notifications table
    await sql`
      CREATE TABLE IF NOT EXISTS notifications (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id),
        type VARCHAR(50) NOT NULL,
        title VARCHAR(255) NOT NULL,
        message TEXT NOT NULL,
        data JSONB,
        read BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `
    console.log('Notifications table created successfully')

    // Create announcements table
    await sql`
      CREATE TABLE IF NOT EXISTS announcements (
        id SERIAL PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        content TEXT NOT NULL,
        type VARCHAR(20) DEFAULT 'board' CHECK (type IN ('board', 'alert')),
        created_by INTEGER REFERENCES users(id),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `

    // Add type column to existing announcements table if it doesn't exist
    try {
      await sql`
        ALTER TABLE announcements 
        ADD COLUMN IF NOT EXISTS type VARCHAR(20) DEFAULT 'board'
      `
      await sql`
        ALTER TABLE announcements 
        ADD CONSTRAINT announcements_type_check 
        CHECK (type IN ('board', 'alert'))
      `
    } catch (error) {
      // Column might already exist, ignore the error
      console.log('Type column might already exist:', error)
    }
    
    console.log('Announcements table created successfully')

    console.log('Database tables created successfully')
    return { success: true, message: 'Database initialized successfully' }
  } catch (error) {
    console.error('Error creating database tables:', error)
    throw error
  }
}

export async function seedDatabase() {
  try {
    console.log('Starting database seeding...')
    
    // Check if admin user exists
    const adminExists = await sql`
      SELECT id FROM users WHERE email = 'admin@digitalstore.com'
    `

    if (adminExists.rows.length === 0) {
      // Create admin user
      const bcrypt = require('bcryptjs')
      const hashedPassword = await bcrypt.hash('admin123', 12)
      
      await sql`
        INSERT INTO users (email, name, password, role)
        VALUES ('admin@digitalstore.com', 'Administrator', ${hashedPassword}, 'admin')
      `
      console.log('Admin user created successfully')
    } else {
      console.log('Admin user already exists')
    }

    // Check if products exist
    const productsExist = await sql`SELECT COUNT(*) as count FROM products`
    
    if (parseInt(productsExist.rows[0].count) === 0) {
      console.log('Inserting sample products...')
      // Insert sample products
      const sampleProducts = [
        {
          name: 'Template Website E-commerce',
          description: 'Template lengkap untuk website toko online dengan fitur shopping cart, payment gateway, dan admin panel',
          price: 299000,
          category: 'Template',
          file_url: 'https://example.com/files/ecommerce-template.zip',
          image_url: '/images/products/template-ecommerce.svg'
        },
        {
          name: 'Source Code Aplikasi PHP',
          description: 'Source code lengkap aplikasi web menggunakan PHP dengan database MySQL dan framework modern',
          price: 450000,
          category: 'Source Code',
          file_url: 'https://example.com/files/php-app.zip',
          image_url: '/images/products/php-source-code.svg'
        },
        {
          name: 'Tutorial Complete Web Development',
          description: 'E-book lengkap belajar web development dari dasar hingga mahir dengan 50+ contoh project',
          price: 150000,
          category: 'E-book',
          file_url: 'https://example.com/files/web-tutorial.pdf',
          image_url: '/images/products/tutorial-ebook.svg'
        },
        {
          name: 'UI Kit Mobile App',
          description: 'Kumpulan komponen UI untuk aplikasi mobile dengan design system yang konsisten',
          price: 200000,
          category: 'UI Kit',
          file_url: 'https://example.com/files/ui-kit-mobile.zip',
          image_url: '/images/products/template-ecommerce.svg'
        },
        {
          name: 'Logo Pack Startup',
          description: '50+ logo siap pakai untuk startup dan bisnis modern dalam format AI, PNG, dan SVG',
          price: 100000,
          category: 'Logo',
          file_url: 'https://example.com/files/logo-pack.zip',
          image_url: '/images/products/php-source-code.svg'
        },
        {
          name: 'Icon Set Business',
          description: '500+ icon business dalam format SVG dan PNG untuk berbagai kebutuhan desain',
          price: 75000,
          category: 'Icon',
          file_url: 'https://example.com/files/icon-set.zip',
          image_url: '/images/products/tutorial-ebook.svg'
        },
        {
          name: 'Stock Photos Pack',
          description: '100+ foto stock berkualitas tinggi untuk website dan marketing material',
          price: 120000,
          category: 'Photo',
          file_url: 'https://example.com/files/stock-photos.zip',
          image_url: '/images/products/template-ecommerce.svg'
        }
      ]

      for (const product of sampleProducts) {
        await sql`
          INSERT INTO products (name, description, price, category, file_url, image_url)
          VALUES (${product.name}, ${product.description}, ${product.price}, ${product.category}, ${product.file_url}, ${product.image_url})
        `
      }
      console.log('Sample products inserted successfully')
    } else {
      console.log('Products already exist')
    }

    // Check if test customer exists
    const testCustomerExists = await sql`
      SELECT id FROM users WHERE email = 'customer@test.com'
    `

    let testCustomerId: number

    if (testCustomerExists.rows.length === 0) {
      // Create test customer
      const bcrypt = require('bcryptjs')
      const hashedPassword = await bcrypt.hash('customer123', 12)
      
      const testCustomer = await sql`
        INSERT INTO users (email, name, password, role)
        VALUES ('customer@test.com', 'Test Customer', ${hashedPassword}, 'customer')
        RETURNING id
      `
      testCustomerId = testCustomer.rows[0].id
      console.log('Test customer created successfully')
    } else {
      testCustomerId = testCustomerExists.rows[0].id
      console.log('Test customer already exists')
    }

    // Check if transactions exist
    const transactionsExist = await sql`SELECT COUNT(*) as count FROM transactions`
    
    if (parseInt(transactionsExist.rows[0].count) === 0) {
      console.log('Inserting sample transactions...')
      
      // Get products for transactions
      const products = await sql`SELECT id, price FROM products LIMIT 5`
      
      if (products.rows.length > 0) {
        const sampleTransactions = [
          {
            user_id: testCustomerId,
            product_id: products.rows[0].id,
            amount: products.rows[0].price,
            status: 'pending',
            payment_proof: 'payment_proof_1.jpg'
          },
          {
            user_id: testCustomerId,
            product_id: products.rows[1].id,
            amount: products.rows[1].price,
            status: 'approved',
            payment_proof: 'payment_proof_2.jpg'
          },
          {
            user_id: testCustomerId,
            product_id: products.rows[2].id,
            amount: products.rows[2].price,
            status: 'rejected',
            payment_proof: 'payment_proof_3.jpg'
          },
          {
            user_id: testCustomerId,
            product_id: products.rows[3].id,
            amount: products.rows[3].price,
            status: 'pending',
            payment_proof: 'payment_proof_4.jpg'
          }
        ]

        for (const transaction of sampleTransactions) {
          await sql`
            INSERT INTO transactions (user_id, product_id, amount, status, payment_proof)
            VALUES (${transaction.user_id}, ${transaction.product_id}, ${transaction.amount}, ${transaction.status}, ${transaction.payment_proof})
          `
        }
        console.log('Sample transactions inserted successfully')
      }
    } else {
      console.log('Transactions already exist')
    }

    // Check if notifications exist
    const notificationsExist = await sql`SELECT COUNT(*) as count FROM notifications`
    
    if (parseInt(notificationsExist.rows[0].count) === 0) {
      console.log('Inserting sample notifications...')
      
      // Get admin and customer IDs
      const adminUser = await sql`SELECT id FROM users WHERE role = 'admin' LIMIT 1`
      const customerUser = await sql`SELECT id FROM users WHERE email = 'customer@test.com' LIMIT 1`
      
      if (adminUser.rows.length > 0 && customerUser.rows.length > 0) {
        const adminId = adminUser.rows[0].id
        const customerId = customerUser.rows[0].id
        
        // Get some products for notification data
        const products = await sql`SELECT id, name FROM products LIMIT 3`
        
        const sampleNotifications = [
          {
            user_id: customerId,
            type: 'transaction_approved',
            title: 'Pesanan Disetujui!',
            message: `Pesanan ${products.rows[0].name} telah disetujui. Silakan download file Anda.`,
            data: JSON.stringify({
              transactionId: 1,
              productName: products.rows[0].name
            }),
            read: false
          },
          {
            user_id: customerId,
            type: 'transaction_rejected',
            title: 'Pesanan Ditolak',
            message: `Pesanan ${products.rows[1].name} ditolak. Silakan hubungi admin untuk informasi lebih lanjut.`,
            data: JSON.stringify({
              transactionId: 2,
              productName: products.rows[1].name
            }),
            read: false
          },
          {
            user_id: adminId,
            type: 'pending_transaction',
            title: 'Pesanan Baru Menunggu Persetujuan',
            message: `Test Customer memesan ${products.rows[2].name}`,
            data: JSON.stringify({
              transactionId: 3,
              productName: products.rows[2].name,
              customerName: 'Test Customer',
              amount: 299000
            }),
            read: false
          }
        ]

        for (const notification of sampleNotifications) {
          await sql`
            INSERT INTO notifications (user_id, type, title, message, data, read)
            VALUES (${notification.user_id}, ${notification.type}, ${notification.title}, ${notification.message}, ${notification.data}, ${notification.read})
          `
        }
        console.log('Sample notifications inserted successfully')
      }
    } else {
      console.log('Notifications already exist')
    }

    // Check if announcements exist
    const announcementsExist = await sql`SELECT COUNT(*) as count FROM announcements`
    
    if (parseInt(announcementsExist.rows[0].count) === 0) {
      console.log('Inserting sample announcements...')
      
      // Get admin ID
      const adminUser = await sql`SELECT id FROM users WHERE role = 'admin' LIMIT 1`
      
      if (adminUser.rows.length > 0) {
        const adminId = adminUser.rows[0].id
        
        const sampleAnnouncements = [
          {
            title: 'Selamat Datang di Zayn Store!',
            content: 'Terima kasih telah bergabung dengan Zayn Store. Nikmati koleksi produk digital premium kami dengan kualitas terbaik dan harga terjangkau.',
            type: 'alert',
            created_by: adminId
          },
          {
            title: 'Update Sistem Pembayaran',
            content: 'Kami telah mengupdate sistem pembayaran untuk memberikan pengalaman yang lebih baik. Semua transaksi sekarang diproses lebih cepat dan aman.',
            type: 'board',
            created_by: adminId
          },
          {
            title: 'Promo Spesial Bulan Ini',
            content: 'Dapatkan diskon 20% untuk semua template website! Promo berlaku hingga akhir bulan. Jangan lewatkan kesempatan emas ini!',
            type: 'board',
            created_by: adminId
          }
        ]

        for (const announcement of sampleAnnouncements) {
          await sql`
            INSERT INTO announcements (title, content, type, created_by)
            VALUES (${announcement.title}, ${announcement.content}, ${announcement.type}, ${announcement.created_by})
          `
        }
        console.log('Sample announcements inserted successfully')
      }
    } else {
      console.log('Announcements already exist')
    }

    console.log('Database seeded successfully')
    return { success: true, message: 'Database seeded successfully' }
  } catch (error) {
    console.error('Error seeding database:', error)
    throw error
  }
}
