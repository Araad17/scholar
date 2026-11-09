import { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';

export type Role = 'user' | 'admin';
export interface AuthUser { id: number; role: Role }

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express { interface Request { auth?: AuthUser } }
}

export function signToken(u: AuthUser) {
  return jwt.sign({ sub: u.id, role: u.role }, process.env.JWT_SECRET!, { expiresIn: '7d' });
}

export function requireAuth(req: Request, res: Response, next: NextFunction) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : '';
  try {
    const p = jwt.verify(token, process.env.JWT_SECRET!) as jwt.JwtPayload;
    req.auth = { id: Number(p.sub), role: p.role as Role };
    next();
  } catch {
    res.status(401).json({ error: 'لطفاً وارد حساب خود شوید' });
  }
}

export function requireAdmin(req: Request, res: Response, next: NextFunction) {
  requireAuth(req, res, () => {
    if (req.auth?.role === 'admin') next();
    else res.status(403).json({ error: 'دسترسی غیرمجاز' });
  });
}
