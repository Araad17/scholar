import 'dotenv/config';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { pool } from './db';

(async () => {
  const email = process.env.ADMIN_EMAIL!;
  const hash = await bcrypt.hash(process.env.ADMIN_PASSWORD!, 12);
  await pool.query(
    `INSERT INTO users (name, email, password_hash, role, referral_code) VALUES (?, ?, ?, 'admin', ?)
     ON DUPLICATE KEY UPDATE password_hash = VALUES(password_hash), role = 'admin'`,
    [process.env.ADMIN_NAME || 'Admin', email, hash, crypto.randomBytes(5).toString('hex').toUpperCase()]
  );
  console.log('✔ ادمین ساخته شد:', email);
  await pool.end();
})();
