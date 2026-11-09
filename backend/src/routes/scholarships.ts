import { Router } from 'express';
import { z } from 'zod';
import { ResultSetHeader, RowDataPacket } from 'mysql2';
import { pool } from '../db';
import { requireAdmin } from '../auth';

const publicRouter = Router();
const adminRouter = Router();
adminRouter.use(requireAdmin);

const PAGE_SIZE = 12;

const schema = z.object({
  title: z.string().min(3).max(300),
  country: z.string().min(2).max(100),
  level: z.enum(['bachelor', 'master', 'phd', 'other']),
  funding: z.enum(['full', 'partial']),
  deadline: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).nullable().optional(),
  description: z.string().min(10),
  eligibility: z.string().default(''),
  apply_url: z.string().url().max(1000),
  source_name: z.string().min(2).max(150),
  source_url: z.string().url().max(1000).or(z.literal('')).default(''),
  is_published: z.boolean().default(true),
});

/* ---------- عمومی ---------- */
publicRouter.get('/', async (req, res) => {
  const { q, country, level, funding, open } = req.query as Record<string, string | undefined>;
  const page = Math.max(1, parseInt((req.query.page as string) || '1', 10) || 1);

  const where: string[] = ['is_published = 1'];
  const params: unknown[] = [];

  if (q) { where.push('(title LIKE ? OR description LIKE ? OR source_name LIKE ?)'); params.push(`%${q}%`, `%${q}%`, `%${q}%`); }
  if (country) { where.push('country = ?'); params.push(country); }
  if (level) { where.push('level = ?'); params.push(level); }
  if (funding) { where.push('funding = ?'); params.push(funding); }
  if (open === '1') where.push('(deadline IS NULL OR deadline >= CURDATE())');

  const whereSql = where.join(' AND ');
  const [[{ c }]] = await pool.query<RowDataPacket[]>(`SELECT COUNT(*) AS c FROM scholarships WHERE ${whereSql}`, params);
  const total = Number(c);

  const [rows] = await pool.query<RowDataPacket[]>(
    `SELECT id, title, country, level, funding, deadline, source_name, LEFT(description, 180) AS excerpt
     FROM scholarships WHERE ${whereSql}
     ORDER BY (deadline IS NULL OR deadline >= CURDATE()) DESC, (deadline IS NULL) ASC, deadline ASC, created_at DESC
     LIMIT ${PAGE_SIZE} OFFSET ${(page - 1) * PAGE_SIZE}`,
    params
  );
  res.json({ items: rows, total, page, pages: Math.max(1, Math.ceil(total / PAGE_SIZE)) });
});

publicRouter.get('/countries', async (_req, res) => {
  const [rows] = await pool.query<RowDataPacket[]>('SELECT DISTINCT country FROM scholarships WHERE is_published = 1 ORDER BY country');
  res.json(rows.map((r) => r.country));
});

publicRouter.get('/:id(\\d+)', async (req, res) => {
  const [rows] = await pool.query<RowDataPacket[]>('SELECT * FROM scholarships WHERE id = ? AND is_published = 1', [req.params.id]);
  if (!rows[0]) return res.status(404).json({ error: 'بورسیه پیدا نشد' });
  res.json(rows[0]);
});

/* ---------- ادمین ---------- */
adminRouter.get('/', async (_req, res) => {
  const [rows] = await pool.query<RowDataPacket[]>(
    'SELECT id, title, country, level, deadline, source_name, is_published, created_at FROM scholarships ORDER BY created_at DESC'
  );
  res.json(rows);
});

adminRouter.get('/:id(\\d+)', async (req, res) => {
  const [rows] = await pool.query<RowDataPacket[]>('SELECT * FROM scholarships WHERE id = ?', [req.params.id]);
  if (!rows[0]) return res.status(404).json({ error: 'پیدا نشد' });
  res.json(rows[0]);
});

adminRouter.post('/', async (req, res) => {
  const p = schema.safeParse(req.body);
  if (!p.success) return res.status(400).json({ error: 'اطلاعات نامعتبر است', details: p.error.flatten() });
  const d = p.data;
  const [result] = await pool.query<ResultSetHeader>(
    `INSERT INTO scholarships (title,country,level,funding,deadline,description,eligibility,apply_url,source_name,source_url,is_published)
     VALUES (?,?,?,?,?,?,?,?,?,?,?)`,
    [d.title, d.country, d.level, d.funding, d.deadline || null, d.description, d.eligibility, d.apply_url, d.source_name, d.source_url, d.is_published ? 1 : 0]
  );
  res.status(201).json({ id: result.insertId });
});

adminRouter.put('/:id(\\d+)', async (req, res) => {
  const p = schema.safeParse(req.body);
  if (!p.success) return res.status(400).json({ error: 'اطلاعات نامعتبر است', details: p.error.flatten() });
  const d = p.data;
  const [result] = await pool.query<ResultSetHeader>(
    `UPDATE scholarships SET title=?,country=?,level=?,funding=?,deadline=?,description=?,eligibility=?,
       apply_url=?,source_name=?,source_url=?,is_published=? WHERE id=?`,
    [d.title, d.country, d.level, d.funding, d.deadline || null, d.description, d.eligibility, d.apply_url, d.source_name, d.source_url, d.is_published ? 1 : 0, req.params.id]
  );
  if (!result.affectedRows) return res.status(404).json({ error: 'پیدا نشد' });
  res.json({ id: Number(req.params.id) });
});

adminRouter.delete('/:id(\\d+)', async (req, res) => {
  await pool.query('DELETE FROM scholarships WHERE id = ?', [req.params.id]);
  res.status(204).end();
});

export { publicRouter, adminRouter };
