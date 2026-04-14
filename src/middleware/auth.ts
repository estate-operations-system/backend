import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../utils/tokenUtils';

export function requireAuth(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  const botTokenHeader = req.headers['x-bot-token'] || req.headers['bot-token'];
  const botToken =
    typeof botTokenHeader === 'string'
      ? botTokenHeader
      : Array.isArray(botTokenHeader)
        ? botTokenHeader[0]
        : undefined;

  if (botToken) {
    if (botToken === process.env.BOT_TOKEN) {
      console.log('✅ Bot token auth accepted');
      return next();
    }

    console.log('❌ Invalid bot token');
    return res.status(403).json({ success: false, error: 'Invalid bot token' });
  }

  if (!token) {
    console.log('❌ No token provided');
    return res.status(401).json({ success: false, error: 'Unauthorized. Please log in first.' });
  }

  const user = verifyToken(token);
  if (!user) {
    console.log('❌ Invalid token');
    return res.status(403).json({ success: false, error: 'Invalid token' });
  }

  (req as any).user = user;
  console.log('✅ User authenticated via JWT:', user.userId);
  return next();
}
