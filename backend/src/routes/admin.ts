import { Router } from 'express';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { ResultSetHeader, RowDataPacket } from 'mysql2';
import fs from 'fs/promises';
import path from 'path';
import { pool } from '../db';
import { requireAdmin } from '../auth';
import { UPLOAD_DIR } from './documents';

const router = Router();
router.use(requireAdmin);

router.get('/stats', async (_req, res) => {
  const [[s]] = await pool.query<RowDataPacket[]>(`SELECT
    (SELECT COUNT(*) FROM users WHERE role = 'user') AS users,
    (SELECT COUNT(*) FROM users WHERE role = 'user' AND created_at > UTC_TIMESTAMP() - INTERVAL 7 DAY) AS new_users,
    (SELECT COUNT(*) FROM scholarships WHERE is_published = 1) AS scholarships,
    (SELECT COUNT(*) FROM documents WHERE status = 'pending') AS pending_documents,
    (SELECT COUNT(*) FROM meeting_slots WHERE status = 'booked' AND starts_at > UTC_TIMESTAMP()) AS upcoming_meetings,
    (SELECT COUNT(*) FROM users WHERE referred_by IS NOT NULL) AS referred_users`);
  res.json(s);
});

/* ---------- کاربران ---------- */
router.get('/users', async (req, res) => {
  const q = String(req.query.q || '').trim();
  const [rows] = await pool.query<RowDataPacket[]>(
    `SELECT u.id, u.name, u.email, u.role, u.created_at,
       (SELECT COUNT(*) FROM documents d WHERE d.user_id = u.id) AS documents,
       (SELECT COUNT(*) FROM users r WHERE r.referred_by = u.id) AS referrals
     FROM users u ${q ? 'WHERE u.name LIKE ? OR u.email LIKE ?' : ''}
     ORDER BY u.created_at DESC LIMIT 500`,
    q ? [`%${q}%`, `%${q}%`] : []);
  res.json(rows);
});

router.get('/users/:id(\\d+)', async (req, res) => {
  const [u] = await pool.query<RowDataPacket[]>('SELECT id, name, email, role, referral_code, created_at FROM users WHERE id = ?', [req.params.id]);
  if (!u[0]) return res.status(404).json({ error: 'کاربر پیدا نشد' });
  const [p] = await pool.query<RowDataPacket[]>('SELECT * FROM profiles WHERE user_id = ?', [req.params.id]);
  const [d] = await pool.query<RowDataPacket[]>(
    'SELECT id, type, original_name, size, status, admin_note, created_at FROM documents WHERE user_id = ? ORDER BY created_at DESC', [req.params.id]);
  res.json({ user: u[0], profile: p[0] ?? null, documents: d });
});

router.patch('/users/:id(\\d+)', async (req, res) => {
  const parsed = z.object({
    name: z.string().trim().min(2).max(100),
    email: z.string().trim().toLowerCase().email().max(255),
    password: z.string().min(8).max(100).optional(),
  }).safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: 'نام، ایمیل یا رمز عبور نامعتبر است؛ رمز تازه باید حداقل ۸ حرف باشد' });

  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    const [users] = await connection.query<RowDataPacket[]>(
      "SELECT id FROM users WHERE id = ? AND role = 'user' FOR UPDATE",
      [req.params.id]
    );
    if (!users[0]) {
      await connection.rollback();
      return res.status(404).json({ error: 'کاربر پیدا نشد یا حساب ادمین قابل ویرایش نیست' });
    }

    if (parsed.data.password) {
      await connection.query(
        'UPDATE users SET name = ?, email = ?, password_hash = ? WHERE id = ?',
        [parsed.data.name, parsed.data.email, await bcrypt.hash(parsed.data.password, 12), req.params.id]
      );
    } else {
      await connection.query(
        'UPDATE users SET name = ?, email = ? WHERE id = ?',
        [parsed.data.name, parsed.data.email, req.params.id]
      );
    }
    await connection.commit();
    res.json({ ok: true });
  } catch (error) {
    await connection.rollback();
    if ((error as { code?: string }).code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ error: 'این ایمیل قبلاً برای حساب دیگری ثبت شده است' });
    }
    throw error;
  } finally {
    connection.release();
  }
});

router.delete('/users/:id(\\d+)', async (req, res) => {
  const connection = await pool.getConnection();
  let storedNames: string[] = [];
  try {
    await connection.beginTransaction();
    const [users] = await connection.query<RowDataPacket[]>(
      "SELECT id FROM users WHERE id = ? AND role = 'user' FOR UPDATE",
      [req.params.id]
    );
    if (!users[0]) {
      await connection.rollback();
      return res.status(404).json({ error: 'کاربر پیدا نشد یا حساب ادمین قابل حذف نیست' });
    }
    const [documents] = await connection.query<RowDataPacket[]>(
      'SELECT stored_name FROM documents WHERE user_id = ?',
      [req.params.id]
    );
    storedNames = documents.map((document) => String(document.stored_name));
    await connection.query('DELETE FROM users WHERE id = ?', [req.params.id]);
    await connection.commit();
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }

  let cleanupFailed = false;
  await Promise.all(storedNames.map(async (storedName) => {
    if (path.basename(storedName) !== storedName) {
      cleanupFailed = true;
      console.error(`Refusing to remove invalid uploaded file path for deleted user ${req.params.id}`);
      return;
    }
    try {
      await fs.unlink(path.join(UPLOAD_DIR, storedName));
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code !== 'ENOENT') {
        cleanupFailed = true;
        console.error(`Failed to remove uploaded document for deleted user ${req.params.id}`, error);
      }
    }
  }));
  res.json({
    ok: true,
    warning: cleanupFailed ? 'حساب حذف شد، اما پاک‌سازی برخی فایل‌های مدارک ناموفق بود.' : undefined,
  });
});

/* ---------- بررسی مدارک ---------- */
router.get('/documents', async (req, res) => {
  const status = String(req.query.status || '');
  const ok = ['pending', 'approved', 'rejected'].includes(status);
  const [rows] = await pool.query<RowDataPacket[]>(
    `SELECT d.id, d.type, d.original_name, d.size, d.status, d.admin_note, d.created_at, u.name AS user_name, u.email AS user_email
     FROM documents d JOIN users u ON u.id = d.user_id ${ok ? 'WHERE d.status = ?' : ''}
     ORDER BY d.created_at DESC LIMIT 300`, ok ? [status] : []);
  res.json(rows);
});

router.patch('/documents/:id(\\d+)', async (req, res) => {
  const p = z.object({ status: z.enum(['pending', 'approved', 'rejected']), admin_note: z.string().max(500).nullish() }).safeParse(req.body);
  if (!p.success) return res.status(400).json({ error: 'اطلاعات نامعتبر است' });
  const [r] = await pool.query<ResultSetHeader>('UPDATE documents SET status = ?, admin_note = ? WHERE id = ?',
    [p.data.status, p.data.admin_note?.trim() || null, req.params.id]);
  if (!r.affectedRows) return res.status(404).json({ error: 'مدرک پیدا نشد' });
  res.json({ ok: true });
});

/* ---------- جلسات ---------- */
router.get('/meetings', async (_req, res) => {
  const [rows] = await pool.query<RowDataPacket[]>(
    `SELECT m.id, m.starts_at, m.duration_min, m.meeting_link, m.status, m.topic, u.name AS user_name, u.email AS user_email
     FROM meeting_slots m LEFT JOIN users u ON u.id = m.booked_by ORDER BY m.starts_at DESC LIMIT 300`);
  res.json(rows);
});

router.post('/meetings', async (req, res) => {
  const p = z.object({
    starts_at: z.string().datetime(),
    duration_min: z.number().int().min(10).max(240),
    meeting_link: z.string().url().max(1000).or(z.literal('')).default(''),
  }).safeParse(req.body);
  if (!p.success) return res.status(400).json({ error: 'اطلاعات نامعتبر است' });
  const when = new Date(p.data.starts_at);
  if (when.getTime() < Date.now()) return res.status(400).json({ error: 'زمان باید در آینده باشد' });
  const [r] = await pool.query<ResultSetHeader>('INSERT INTO meeting_slots (starts_at, duration_min, meeting_link) VALUES (?,?,?)',
    [when, p.data.duration_min, p.data.meeting_link]);
  res.status(201).json({ id: r.insertId });
});

router.patch('/meetings/:id(\\d+)', async (req, res) => {
  const p = z.object({
    status: z.enum(['completed', 'cancelled']).optional(),
    meeting_link: z.string().url().max(1000).or(z.literal('')).optional(),
  }).safeParse(req.body);
  if (!p.success) return res.status(400).json({ error: 'اطلاعات نامعتبر است' });
  const [r] = await pool.query<ResultSetHeader>(
    'UPDATE meeting_slots SET status = COALESCE(?, status), meeting_link = COALESCE(?, meeting_link) WHERE id = ?',
    [p.data.status ?? null, p.data.meeting_link ?? null, req.params.id]);
  if (!r.affectedRows) return res.status(404).json({ error: 'پیدا نشد' });
  res.json({ ok: true });
});

router.delete('/meetings/:id(\\d+)', async (req, res) => {
  await pool.query('DELETE FROM meeting_slots WHERE id = ?', [req.params.id]);
  res.status(204).end();
});

export default router;
