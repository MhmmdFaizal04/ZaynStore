// Script untuk reset password admin via database
// Jalankan di terminal dengan: node reset-admin-password.js

const bcrypt = require('bcryptjs');

async function generateHashedPassword() {
  const newPassword = 'admin123'; // Ganti dengan password baru
  const hashedPassword = await bcrypt.hash(newPassword, 12);
  
  console.log('='.repeat(50));
  console.log('🔐 RESET PASSWORD ADMIN');
  console.log('='.repeat(50));
  console.log('Password baru:', newPassword);
  console.log('Hashed password:', hashedPassword);
  console.log('='.repeat(50));
  console.log('SQL Query untuk update:');
  console.log(`UPDATE users SET password = '${hashedPassword}' WHERE email = 'admin@digitalstore.com';`);
  console.log('='.repeat(50));
}

generateHashedPassword().catch(console.error);
