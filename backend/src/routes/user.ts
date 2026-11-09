import { Router } from 'express';
import { z } from 'zod';
import { RowDataPacket } from 'mysql2';
import { pool } from '../db';
import { requireAuth } from '../auth';

const router = Router();
router.use(requireAuth);

const str = (max: number) => z.string().max(max).nullish().transform((v) => (v ?? '').trim() || null);
const nul = <T extends z.ZodTypeAny>(s: T) => s.nullish().transform((v) => v ?? null);

const profileSchema = z.object({
  phone: str(30),
  gender: nul(z.enum(['male', 'female'])),
  date_of_birth: nul(z.string().regex(/^\d{4}-\d{2}-\d{2}$/)),
  province: str(100),
  education_level: nul(z.enum(['highschool', 'bachelor', 'master', 'phd'])),
  institution: str(200),
  field_of_study: str(200),
  gpa: nul(z.number().min(0).max(100)),
  english_level: nul(z.enum(['none', 'basic', 'intermediate', 'advanced'])),
  target_countries: str(300),
  bio: str(2000),
});
const COLS = Object.keys(profileSchema.shape) as (keyof z.infer<typeof profileSchema>)[];
const REQUIRED_FOR_COMPLETION = ['phone', 'date_of_birth', 'province', 'education_level', 'institution', 'field_of_study', 'english_level', 'target_countries'];

async function getProfile(userId: number) {
  const [rows] = await pool.query<RowDataPacket[]>('SELECT * FROM profiles WHERE user_id = ?', [userId]);
  return rows[0] ?? Object.fromEntries(COLS.map((c) => [c, null]));
}
const completion = (p: Record<string, unknown>) =>
  Math.round((REQUIRED_FOR_COMPLETION.filter((k) => p[k] !== null && p[k] !== '').length / REQUIRED_FOR_COMPLETION.length) * 100);

router.get('/profile', async (req, res) => {
  const p = await getProfile(req.auth!.id);
  res.json({ ...p, completion: completion(p) });
});

router.put('/profile', async (req, res) => {
  const parsed = profileSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: 'اطلاعات نامعتبر است', details: parsed.error.flatten() });
  const d = parsed.data;
  await pool.query(
    `INSERT INTO profiles (user_id, ${COLS.join(',')}) VALUES (?, ${COLS.map(() => '?').join(',')})
     ON DUPLICATE KEY UPDATE ${COLS.map((c) => `${c} = VALUES(${c})`).join(',')}`,
    [req.auth!.id, ...COLS.map((c) => d[c])]
  );
  res.json({ ...d, completion: completion(d) });
});

router.get('/home', async (req, res) => {
  const uid = req.auth!.id;
  const profile = await getProfile(uid);

  const [docRows] = await pool.query<RowDataPacket[]>('SELECT status, COUNT(*) AS c FROM documents WHERE user_id = ? GROUP BY status', [uid]);
  const documents = { pending: 0, approved: 0, rejected: 0, total: 0 };
  for (const r of docRows) { documents[r.status as 'pending' | 'approved' | 'rejected'] = Number(r.c); documents.total += Number(r.c); }

  const [meet] = await pool.query<RowDataPacket[]>(
    `SELECT id, starts_at, duration_min, topic, meeting_link FROM meeting_slots
     WHERE booked_by = ? AND status = 'booked' AND starts_at > UTC_TIMESTAMP() ORDER BY starts_at LIMIT 1`, [uid]);
  const [[ref]] = await pool.query<RowDataPacket[]>('SELECT COUNT(*) AS c FROM users WHERE referred_by = ?', [uid]);
  const [closing] = await pool.query<RowDataPacket[]>(
    `SELECT id, title, country, deadline FROM scholarships
     WHERE is_published = 1 AND deadline >= CURDATE() ORDER BY deadline ASC LIMIT 4`);

  res.json({ completion: completion(profile), documents, next_meeting: meet[0] ?? null, referrals: Number(ref.c), closing_soon: closing });
});

router.get('/referrals', async (req, res) => {
  const uid = req.auth!.id;
  const [[me]] = await pool.query<RowDataPacket[]>('SELECT referral_code FROM users WHERE id = ?', [uid]);
  const [rows] = await pool.query<RowDataPacket[]>(
    'SELECT name, created_at FROM users WHERE referred_by = ? ORDER BY created_at DESC', [uid]);
  res.json({
    code: me.referral_code,
    total: rows.length,
    items: rows.map((r) => ({ name: String(r.name).split(' ')[0], created_at: r.created_at })),
  });
});

export default router;
