import { Router } from 'express';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { z } from 'zod';
import rateLimit from 'express-rate-limit';
import { ResultSetHeader, RowDataPacket } from 'mysql2';
import { pool } from '../db';
import { requireAuth, signToken } from '../auth';

const router = Router();
const limiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 30 });

router.post('/register', limiter, async (req, res) => {
  const p = z.object({
    name: z.string().trim().min(2).max(100),
    email: z.string().trim().toLowerCase().email().max(255),
    password: z.string().min(8).max(100),
    ref: z.string().trim().max(12).optional(),
  }).safeParse(req.body);
  if (!p.success) return res.status(400).json({ error: 'اطلاعات نامعتبر است (رمز عبور حداقل ۸ حرف)' });
  const { name, email, password, ref } = p.data;

  const [exists] = await pool.query<RowDataPacket[]>('SELECT id FROM users WHERE email = ?', [email]);
  if (exists[0]) return res.status(409).json({ error: 'این ایمیل قبلاً ثبت شده است' });

  let referredBy: number | null = null;
  if (ref) {
    const [r] = await pool.query<RowDataPacket[]>('SELECT id FROM users WHERE referral_code = ?', [ref.toUpperCase()]);
    referredBy = r[0]?.id ?? null;
  }

  try {
    const [result] = await pool.query<ResultSetHeader>(
      'INSERT INTO users (name, email, password_hash, role, referral_code, referred_by) VALUES (?,?,?,?,?,?)',
      [name, email, await bcrypt.hash(password, 12), 'user', crypto.randomBytes(5).toString('hex').toUpperCase(), referredBy]
    );
    const user = { id: result.insertId, name, email, role: 'user' as const };
    res.status(201).json({ token: signToken(user), user });
  } catch (e) {
    if ((e as { code?: string }).code === 'ER_DUP_ENTRY') return res.status(409).json({ error: 'این ایمیل قبلاً ثبت شده است' });
    throw e;
  }
});

router.post('/login', limiter, async (req, res) => {
  const p = z.object({ email: z.string().trim().toLowerCase().email(), password: z.string().min(1) }).safeParse(req.body);
  if (!p.success) return res.status(400).json({ error: 'اطلاعات نامعتبر است' });

  const [rows] = await pool.query<RowDataPacket[]>('SELECT id, name, email, role, password_hash FROM users WHERE email = ?', [p.data.email]);
  const u = rows[0];
  if (!u || !(await bcrypt.compare(p.data.password, u.password_hash))) {
    return res.status(401).json({ error: 'ایمیل یا رمز عبور اشتباه است' });
  }
  const user = { id: u.id, name: u.name, email: u.email, role: u.role };
  res.json({ token: signToken(user), user });
});

router.get('/me', requireAuth, async (req, res) => {
  const [rows] = await pool.query<RowDataPacket[]>('SELECT id, name, email, role FROM users WHERE id = ?', [req.auth!.id]);
  if (!rows[0]) return res.status(401).json({ error: 'حساب پیدا نشد' });
  res.json(rows[0]);
});

export default router;
