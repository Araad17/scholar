import mysql from 'mysql2/promise';

export const pool = mysql.createPool({
  uri: process.env.DATABASE_URL,
  charset: 'utf8mb4',
  timezone: 'Z',
  decimalNumbers: true,
  dateStrings: ['DATE'], // ستون DATE به شکل YYYY-MM-DD برمی‌گردد
  typeCast: (field, next) => (field.type === 'TINY' && field.length === 1 ? field.string() === '1' : next()),
});

// همه زمان‌ها در دیتابیس به وقت UTC ذخیره می‌شوند
pool.pool.on('connection', (c) => { c.query("SET time_zone = '+00:00'"); });
