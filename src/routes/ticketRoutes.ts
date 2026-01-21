import { Router, Request, Response } from 'express';
import TicketController from '../controllers/ticketController';
import pool from '../config/database';

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Tickets
 *   description: Управление заявками
 */

/**
 * @swagger
 * /api/tickets:
 *   post:
 *     summary: Создать заявку
 *     tags: [Tickets]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/TicketCreate'
 *     responses:
 *       201:
 *         description: Заявка создана
 */
router.post('/', TicketController.createTicket);

/**
 * @swagger
 * /api/tickets:
 *   get:
 *     summary: Получить список всех заявок
 *     tags: [Tickets]
 *     responses:
 *       200:
 *         description: Список заявок
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Ticket'
 */
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
