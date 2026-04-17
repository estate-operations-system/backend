import 'express-session';
import 'express';

declare module 'express-session' {
  interface SessionData {
    userId: number;
  }
}

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
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
