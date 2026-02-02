import express, { Request, Response, NextFunction } from 'express';
import swaggerUi from 'swagger-ui-express';
import { swaggerSpec } from './config/swagger';
import cors from 'cors';
import dotenv from 'dotenv';

import initDatabase from './config/init-db';
import userRoutes from './routes/userRoutes';
import ticketRoutes from './routes/ticketRoutes';

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());
app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.use((req: Request, _res: Response, next: NextFunction) => {
  console.log(`${req.method} ${req.url}`);
  next();
});

app.get('/', (_req, res) => {
  res.json({ message: 'API работает' });
});

app.use('/api/users', userRoutes);
app.use('/api/tickets', ticketRoutes);

app.get('/v3/api-docs', (_, res) => {
  res.json(swaggerSpec)
})

app.use((_req, res) => {
  res.status(404).json({ success: false, error: 'Маршрут не найден' });
});

app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  console.error(err);
  res.status(500).json({ success: false, error: err.message });
});

initDatabase();

export default app;
