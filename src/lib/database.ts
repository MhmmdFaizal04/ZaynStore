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

    console.log('Database seeded successfully')
    return { success: true, message: 'Database seeded successfully' }
  } catch (error) {
    console.error('Error seeding database:', error)
    throw error
  }
}
