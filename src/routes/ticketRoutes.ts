import { Router, Request, Response } from 'express';
import TicketController from '../controllers/ticketController';
import pool from '../config/database';

const router = Router();

router.post('/', TicketController.createTicket);

router.get('/', async (_req: Request, res: Response) => {
  try {
    const result = await pool.query('SELECT * FROM tickets');
    res.json(result.rows);
  } catch (error) {
    console.error('Ошибка при получении заявок:', error);
    res.status(500).json({ success: false, error: 'Ошибка сервера' });
  }
});

export default router;
