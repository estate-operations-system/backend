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
 * components:
 *   schemas:
 *     Ticket:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           example: 1
 *         title:
 *           type: string
 *           example: "Проблема с логином"
 *         description:
 *           type: string
 *           example: "Не могу войти в аккаунт"
 *         status:
 *           type: string
 *           example: "open"
 *           enum: [open, in_progress, closed]
 *         created_at:
 *           type: string
 *           format: date-time
 *           example: "2024-01-15T10:30:00Z"
 *         updated_at:
 *           type: string
 *           format: date-time
 *           example: "2024-01-15T11:30:00Z"
 *       required:
 *         - id
 *         - title
 *         - status
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
router.get('/:id', TicketController.getTicketById);

export default router;
