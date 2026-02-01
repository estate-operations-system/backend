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
 *           example: 1
 *         category:
 *           type: string
 *           example: "Сантехника"
 *         description:
 *           type: string
 *           example: "Протекает кран на кухне"
 *         address:
 *           type: string
 *           example: "ул. Ленина, 10, кв. 25"
 *         status:
 *           type: string
 *           example: "open"
 *         resident_id:
 *           type: integer
 *           example: 123
 *         created_at:
 *           type: string
 *           format: date-time
 *           example: "2024-01-15T10:30:00Z"
 *     TicketCreate:
 *       type: object
 *       required:
 *         - category
 *         - description
 *         - resident_id
 *       properties:
 *         category:
 *           type: string
 *           example: "Сантехника"
 *         description:
 *           type: string
 *           example: "Протекает кран на кухне"
 *         address:
 *           type: string
 *           example: "ул. Ленина, 10, кв. 25"
 *         resident_id:
 *           type: integer
 *           example: 123
 *     TicketUpdate:
 *       type: object
 *       properties:
 *         category:
 *           type: string
 *           example: "Сантехника"
 *         description:
 *           type: string
 *           example: "Протекает кран на кухне"
 *         address:
 *           type: string
 *           example: "ул. Ленина, 10, кв. 25"
 *         status:
 *           type: string
 *           example: "in_progress"
 * 
 *   responses:
 *     NotFound:
 *       description: Ресурс не найден
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               success:
 *                 type: boolean
 *                 example: false
 *               error:
 *                 type: string
 *                 example: "Заявка не найдена"
 *     BadRequest:
 *       description: Неверные параметры запроса
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               success:
 *                 type: boolean
 *                 example: false
 *               error:
 *                 type: string
 *                 example: "category, description и resident_id обязательны"
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
 *         description: Заявка успешно создана
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Ticket'
 *       400:
 *         $ref: '#/components/responses/BadRequest'
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
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Ticket'
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
 *         description: ID заявки
 *     responses:
 *       200:
 *         description: Заявка найдена
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Ticket'
 *       400:
 *         description: Неверный ID
 *       404:
 *         $ref: '#/components/responses/NotFound'
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
 *         description: ID заявки
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/TicketUpdate'
 *     responses:
 *       200:
 *         description: Заявка успешно обновлена
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Ticket'
 *                 message:
 *                   type: string
 *                   example: "Заявка успешно обновлена"
 *       400:
 *         description: Неверные данные
 *       404:
 *         $ref: '#/components/responses/NotFound'
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
 *         description: ID заявки
 *     responses:
 *       200:
 *         description: Заявка успешно удалена
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Заявка успешно удалена"
 *       400:
 *         description: Неверный ID
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       500:
 *         description: Ошибка сервера
 */
router.delete('/:id', TicketController.deleteTicket);

export default router;
