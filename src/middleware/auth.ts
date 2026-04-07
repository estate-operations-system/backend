import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { JWT_SECRET } from '../app';

export function requireAuth(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    console.log('❌ No token provided');
    return res.status(401).json({ success: false, error: 'Unauthorized. Please log in first.' });
  }

  jwt.verify(token, JWT_SECRET, (err: any, user: any) => {
    if (err) {
      console.log('❌ Invalid token');
      return res.status(403).json({ success: false, error: 'Invalid token' });
    }
    (req as any).user = user;
    console.log('✅ User authenticated via JWT:', user.userId);
    return next();
  });
}
