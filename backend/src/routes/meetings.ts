import { Router } from 'express';
import { z } from 'zod';
import { ResultSetHeader, RowDataPacket } from 'mysql2';
import { pool } from '../db';
import { requireAuth } from '../auth';

const router = Router();
router.use(requireAuth);

router.get('/open', async (_req, res) => {
  const [rows] = await pool.query<RowDataPacket[]>(
    `SELECT id, starts_at, duration_min FROM meeting_slots
     WHERE status = 'open' AND starts_at > UTC_TIMESTAMP() ORDER BY starts_at LIMIT 100`);
  res.json(rows);
});

router.get('/mine', async (req, res) => {
  const [rows] = await pool.query<RowDataPacket[]>(
    `SELECT id, starts_at, duration_min, meeting_link, status, topic FROM meeting_slots
     WHERE booked_by = ? ORDER BY starts_at DESC`, [req.auth!.id]);
  res.json(rows);
});

router.post('/:id(\\d+)/book', async (req, res) => {
  const p = z.object({ topic: z.string().trim().min(3).max(300) }).safeParse(req.body);
  if (!p.success) return res.status(400).json({ error: 'موضوع جلسه را بنویسید (حداقل ۳ حرف)' });

  const [[{ c }]] = await pool.query<RowDataPacket[]>(
    `SELECT COUNT(*) AS c FROM meeting_slots WHERE booked_by = ? AND status = 'booked' AND starts_at > UTC_TIMESTAMP()`, [req.auth!.id]);
  if (Number(c) >= 2) return res.status(400).json({ error: 'حداکثر دو جلسه فعال می‌توانید داشته باشید' });

  const [r] = await pool.query<ResultSetHeader>(
    `UPDATE meeting_slots SET booked_by = ?, topic = ?, status = 'booked'
     WHERE id = ? AND status = 'open' AND starts_at > UTC_TIMESTAMP()`,
    [req.auth!.id, p.data.topic, req.params.id]);
  if (!r.affectedRows) return res.status(409).json({ error: 'این زمان دیگر در دسترس نیست' });
  res.json({ ok: true });
});

router.post('/:id(\\d+)/cancel', async (req, res) => {
  const [r] = await pool.query<ResultSetHeader>(
    `UPDATE meeting_slots SET booked_by = NULL, topic = NULL, status = 'open'
     WHERE id = ? AND booked_by = ? AND status = 'booked' AND starts_at > UTC_TIMESTAMP()`,
    [req.params.id, req.auth!.id]);
  if (!r.affectedRows) return res.status(404).json({ error: 'جلسه قابل لغو نیست' });
  res.json({ ok: true });
});

export default router;
