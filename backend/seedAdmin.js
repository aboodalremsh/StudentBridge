const bcrypt = require('bcryptjs');
const { pool } = require('./config/db');

async function seedAdmins() {
  try {
    const admins = [
      { email: 'admin1@gmail.com', password: 'admin123' },
    ];

    for (const admin of admins) {
      const [existing] = await pool.query(
        'SELECT id FROM users WHERE email = ?',
        [admin.email]
      );

      if (existing.length > 0) {
        console.log(`⚠️ Exists: ${admin.email}`);
        continue;
      }

      const hashed = await bcrypt.hash(admin.password, 10);

      await pool.query(
        'INSERT INTO users (email, password_hash, role) VALUES (?, ?, ?)',
        [admin.email, hashed, 'admin']
      );

      console.log(`✅ Created: ${admin.email}`);
    }

    console.log('🎉 All admins processed');
    process.exit(0);

  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

seedAdmins();