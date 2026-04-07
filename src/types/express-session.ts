import 'express-session';
import 'express';

declare module 'express-session' {
  interface SessionData {
    userId: number;
  }
}

declare global {
  namespace Express {
    interface Request {
      user?: {
        userId: number;
        telegram_id: number;
        iat: number;
        exp: number;
      };
    }
  }
}
