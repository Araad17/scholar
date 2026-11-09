import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import crypto from 'crypto';
import { z } from 'zod';
import { ResultSetHeader, RowDataPacket } from 'mysql2';
import { pool } from '../db';
import { requireAuth } from '../auth';

export const UPLOAD_DIR = path.resolve(process.env.UPLOAD_DIR || './uploads');
fs.mkdirSync(UPLOAD_DIR, { recursive: true });

const EXT: Record<string, string> = { 'application/pdf': '.pdf', 'image/jpeg': '.jpg', 'image/png': '.png' };
const MAGIC: Record<string, string> = { 'application/pdf': '25504446', 'image/jpeg': 'ffd8ff', 'image/png': '89504e47' };
const badReq = (m: string) => Object.assign(new Error(m), { status: 400 });

const upload = multer({
  storage: multer.diskStorage({
    destination: UPLOAD_DIR,
    filename: (_r, f, cb) => cb(null, crypto.randomUUID() + (EXT[f.mimetype] || '')),
  }),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_r, f, cb) => (EXT[f.mimetype] ? cb(null, true) : cb(badReq('فقط فایل PDF، JPG یا PNG مجاز است'))),
});

const typeSchema = z.enum(['passport', 'tazkira', 'transcript', 'certificate', 'cv', 'language', 'recommendation', 'other']);
const router = Router();
router.use(requireAuth);

router.get('/', async (req, res) => {
  const [rows] = await pool.query<RowDataPacket[]>(
    'SELECT id, type, original_name, mime, size, status, admin_note, created_at FROM documents WHERE user_id = ? ORDER BY created_at DESC',
    [req.auth!.id]
  );
  res.json(rows);
});

router.post('/', upload.single('file'), async (req, res) => {
  const file = req.file;
  if (!file) return res.status(400).json({ error: 'فایلی انتخاب نشده است' });
  const reject = (m: string) => { fs.unlink(file.path, () => {}); return res.status(400).json({ error: m }); };

  const type = typeSchema.safeParse(req.body.type);
  if (!type.success) return reject('نوع مدرک نامعتبر است');

  const head = fs.readFileSync(file.path).subarray(0, 4).toString('hex');
  if (!head.startsWith(MAGIC[file.mimetype])) return reject('محتوای فایل با نوع آن مطابقت ندارد');

  const [[{ c }]] = await pool.query<RowDataPacket[]>('SELECT COUNT(*) AS c FROM documents WHERE user_id = ?', [req.auth!.id]);
  if (Number(c) >= 30) return reject('حداکثر ۳۰ مدرک می‌توانید آپلود کنید');

  const original = Buffer.from(file.originalname, 'latin1').toString('utf8').slice(0, 255);
  const [r] = await pool.query<ResultSetHeader>(
    'INSERT INTO documents (user_id, type, original_name, stored_name, mime, size) VALUES (?,?,?,?,?,?)',
    [req.auth!.id, type.data, original, file.filename, file.mimetype, file.size]
  );
  res.status(201).json({ id: r.insertId });
});

router.delete('/:id(\\d+)', async (req, res) => {
  const [rows] = await pool.query<RowDataPacket[]>('SELECT stored_name FROM documents WHERE id = ? AND user_id = ?', [req.params.id, req.auth!.id]);
  if (!rows[0]) return res.status(404).json({ error: 'مدرک پیدا نشد' });
  await pool.query('DELETE FROM documents WHERE id = ?', [req.params.id]);
  fs.unlink(path.join(UPLOAD_DIR, rows[0].stored_name), () => {});
  res.status(204).end();
});

// مشاهده فایل: فقط صاحب مدرک یا ادمین
router.get('/:id(\\d+)/file', async (req, res) => {
  const [rows] = await pool.query<RowDataPacket[]>('SELECT user_id, stored_name, mime FROM documents WHERE id = ?', [req.params.id]);
  const d = rows[0];
  if (!d || (d.user_id !== req.auth!.id && req.auth!.role !== 'admin')) return res.status(404).json({ error: 'مدرک پیدا نشد' });
  res.type(d.mime).sendFile(path.join(UPLOAD_DIR, d.stored_name));
});

export default router;
