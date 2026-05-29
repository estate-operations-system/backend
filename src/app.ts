import express, { Request, Response, NextFunction } from 'express';
import swaggerUi from 'swagger-ui-express';
import { swaggerSpec } from './config/swagger';
import cors from 'cors';
import dotenv from 'dotenv';

import initDatabase from './config/init-db';
import userRoutes from './routes/userRoutes';
import ticketRoutes from './routes/ticketRoutes';
import vehicleParkingRoutes from './routes/vehicleParkingRoutes';
import authRoutes from './routes/authRoutes';
import { verifyToken } from './utils/tokenUtils';

dotenv.config();

const app = express();

app.use(
  cors({
    origin: [
      'http://localhost:3000',
      'http://localhost:3001',
      'http://localhost:8000',
      `http://estate-operations.ru`,
      'https://woolstapling-johnson-synergistically.ngrok-free.dev',
      /\.ngrok-free\.dev$/,
      /\.onrender\.com$/,
    ],
    credentials: true,
  })
);
app.use(express.json());
app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.use((req: Request, _res: Response, next: NextFunction) => {
  console.log(`${req.method} ${req.url}`);
  next();
});

export const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

export function authenticateToken(req: Request, res: Response, next: NextFunction) {
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
      console.log('Bot token auth accepted');
      return next();
    }

    console.log('Invalid bot token');
    return res.status(403).json({ success: false, error: 'Invalid bot token' });
  }

  if (!token) {
    return res.status(401).json({ success: false, error: 'Access token required' });
  }

  const user = verifyToken(token);
  if (!user) {
    console.log('JWT verify error: Invalid or expired token');
    return res.status(401).json({ success: false, error: 'Invalid or expired token' });
  }

  (req as any).user = user;
  console.log('JWT verified, user:', user);
  next();
}

app.get('/', (_req, res) => {
  res.json({ message: 'API работает' });
});

app.use('/api', authRoutes);
app.use('/api/users', authenticateToken, userRoutes);
app.use('/api/tickets', authenticateToken, ticketRoutes);
app.use('/api/vehicle-parking', authenticateToken, vehicleParkingRoutes);

app.get('/v3/api-docs', (_, res) => {
  res.json(swaggerSpec);
});

app.use((_req, res) => {
  res.status(404).json({ success: false, error: 'Маршрут не найден' });
});

app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  console.error(err);
  res.status(500).json({ success: false, error: err.message });
});

initDatabase();

export default app;
