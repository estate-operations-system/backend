import { Router } from 'express';
import TicketController from '../controllers/ticketController';

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Tickets
 *   description: Управление заявками ТСЖ
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
 *         category:
 *           type: string
 *         description:
 *           type: string
 *         address:
 *           type: string
 *         status:
 *           type: string
 *         resident_id:
 *           type: integer
 *         created_at:
 *           type: string
 *           format: date-time
 *       required:
 *         - id
 *         - category
 *         - address
 *         - status
 *         - resident_id
 * 
 *     TicketCreate:
 *       type: object
 *       properties:
 *         category:
 *           type: string
 *         description:
 *           type: string
 *         address:
 *           type: string
 *         status:
 *           type: string
 *         resident_id:
 *           type: integer
 *       required:
 *         - category
 *         - address
 *         - status
 *         - resident_id
 * 
 *     TicketUpdate:
 *       type: object
 *       properties:
 *         category:
 *           type: string
 *         description:
 *           type: string
 *         address:
 *           type: string
 *         status:
 *           type: string
 */

/**
 * @swagger
 * /api/tickets:
 *   post:
 *     summary: Создать новую заявку
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
 *       400:
 *         description: Неверные данные
 *       500:
 *         description: Ошибка сервера
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
 *       500:
 *         description: Ошибка сервера
 */
router.get('/', TicketController.getAllTickets);

/**
 * @swagger
 * /api/tickets/{id}:
 *   get:
 *     summary: Получить заявку по ID
 *     tags: [Tickets]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Заявка найдена
 *       404:
 *         description: Заявка не найдена
 *       500:
 *         description: Ошибка сервера
 */
router.get('/:id', TicketController.getTicketById);

/**
 * @swagger
 * /api/tickets/{id}:
 *   put:
 *     summary: Обновить заявку
 *     tags: [Tickets]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/TicketUpdate'
 *     responses:
 *       200:
 *         description: Заявка обновлена
 *       404:
 *         description: Заявка не найдена
 *       500:
 *         description: Ошибка сервера
 */
router.put('/:id', TicketController.updateTicket);

/**
 * @swagger
 * /api/tickets/{id}:
 *   delete:
 *     summary: Удалить заявку
 *     tags: [Tickets]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Заявка удалена
 *       404:
 *         description: Заявка не найдена
 *       500:
 *         description: Ошибка сервера
 */
router.delete('/:id', TicketController.deleteTicket);

export default router;
