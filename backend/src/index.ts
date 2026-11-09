import 'dotenv/config';
import 'express-async-errors';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import multer from 'multer';
import authRouter from './routes/auth';
import userRouter from './routes/user';
import documentsRouter from './routes/documents';
import meetingsRouter from './routes/meetings';
import adminRouter from './routes/admin';
import { publicRouter, adminRouter as scholarshipsAdmin } from './routes/scholarships';

const app = express();
app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));
app.use(cors({ origin: process.env.CORS_ORIGIN }));
app.use(express.json({ limit: '200kb' }));

app.get('/api/health', (_req, res) => res.json({ ok: true }));
app.use('/api/auth', authRouter);
app.use('/api/scholarships', publicRouter);
app.use('/api/user', userRouter);
app.use('/api/documents', documentsRouter);
app.use('/api/meetings', meetingsRouter);
app.use('/api/admin/scholarships', scholarshipsAdmin);
app.use('/api/admin', adminRouter);

app.use((err: Error & { status?: number }, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  if (err instanceof multer.MulterError) {
    return res.status(400).json({ error: err.code === 'LIMIT_FILE_SIZE' ? 'حجم فایل نباید بیشتر از ۵ مگابایت باشد' : 'خطا در آپلود فایل' });
  }
  const status = err.status || 500;
  if (status >= 500) console.error(err);
  res.status(status).json({ error: status < 500 ? err.message : 'خطای سرور' });
});

const port = Number(process.env.PORT) || 4000;
app.listen(port, () => console.log(`API روی پورت ${port}`));
