import { Request, Response, NextFunction } from 'express';

export function requireAuth(req: Request, res: Response, next: NextFunction) {
  if (req.session?.userId) {
    return next();
  }

  res.status(401).json({ success: false, error: 'Unauthorized. Please log in first.' });
}
