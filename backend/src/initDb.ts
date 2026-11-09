import 'dotenv/config';
import fs from 'fs';
import path from 'path';
import mysql from 'mysql2/promise';

(async () => {
  const sql = fs.readFileSync(path.join(__dirname, '../sql/schema.sql'), 'utf8');
  const conn = await mysql.createConnection({ uri: process.env.DATABASE_URL, multipleStatements: true });
  await conn.query(sql);
  console.log('✔ جدول‌ها ساخته شدند');
  await conn.end();
})();
