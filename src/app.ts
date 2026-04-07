import express, { Request, Response, NextFunction } from 'express';
import swaggerUi from 'swagger-ui-express';
import { swaggerSpec } from './config/swagger';
import cors from 'cors';
import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';

import initDatabase from './config/init-db';
import userRoutes from './routes/userRoutes';
import ticketRoutes from './routes/ticketRoutes';
import vehicleParkingRoutes from './routes/vehicleParkingRoutes';
import authRoutes from './routes/authRoutes';

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
      /\.onrender\.com$/
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

// JWT Middleware
export const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

export function authenticateToken(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ success: false, error: 'Access token required' });
  }

  jwt.verify(token, JWT_SECRET, (err: any, user: any) => {
    if (err) {
      return res.status(403).json({ success: false, error: 'Invalid token' });
    }
    (req as any).user = user;
    next();
  });
}

app.get('/', (_req, res) => {
  res.json({ message: 'API работает' });
});

app.use('/api', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/tickets', ticketRoutes);
app.use('/api/vehicle-parking', vehicleParkingRoutes);

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
