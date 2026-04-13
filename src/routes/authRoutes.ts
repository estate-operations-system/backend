import { Router } from 'express';
import UserController from '../controllers/userController';
import { authenticateToken } from '../app';

const router = Router();

/**
 * @swagger
 * /api/auth/telegram:
 *   get:
 *     summary: Проверка Telegram авторизации через query-параметры
 *     tags: [Auth]
 *     parameters:
 *       - in: query
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: Telegram ID пользователя
 *       - in: query
 *         name: first_name
 *         schema:
 *           type: string
 *       - in: query
 *         name: last_name
 *         schema:
 *           type: string
 *       - in: query
 *         name: username
 *         schema:
 *           type: string
 *       - in: query
 *         name: auth_date
 *         schema:
 *           type: string
 *         required: true
 *       - in: query
 *         name: hash
 *         schema:
 *           type: string
 *         required: true
 *     responses:
 *       200:
 *         description: Успешная Telegram авторизация
 *       403:
 *         description: Неверный Telegram auth hash
 */
router.get('/auth/telegram', UserController.telegramAuth);

/**
 * @swagger
 * /api/auth/telegram:
 *   post:
 *     summary: Проверка Telegram авторизации через POST тело запроса
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               id:
 *                 type: string
 *               first_name:
 *                 type: string
 *               last_name:
 *                 type: string
 *               username:
 *                 type: string
 *               photo_url:
 *                 type: string
 *               auth_date:
 *                 type: string
 *               hash:
 *                 type: string
 *             required:
 *               - id
 *               - auth_date
 *               - hash
 *     responses:
 *       200:
 *         description: Успешная Telegram авторизация и получение JWT токена
 *       403:
 *         description: Неверный Telegram auth hash
 */
router.post('/auth/telegram', UserController.telegramAuthPost);

/**
 * @swagger
 * /api/auth/status:
 *   get:
 *     summary: Проверить статус авторизации по JWT
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Статус авторизации
 *       401:
 *         description: Access token required
 *       403:
 *         description: Invalid token
 */
router.get('/auth/status', authenticateToken, UserController.authStatus);

/**
 * @swagger
 * /api/auth/logout:
 *   post:
 *     summary: Выйти из системы
 *     tags: [Auth]
 *     responses:
 *       200:
 *         description: Успешный выход
 */
router.post('/auth/logout', UserController.logout);

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: Зарегистрировать нового пользователя
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               telegram_id:
 *                 type: string
 *               telegram_username:
 *                 type: string
 *               password:
 *                 type: string
 *             required:
 *               - name
 *               - telegram_id
 *     responses:
 *       201:
 *         description: Пользователь зарегистрирован
 *       409:
 *         description: Пользователь уже существует
 */
router.post('/auth/register', UserController.register);

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Войти с помощью telegram_id и пароля
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               telegram_id:
 *                 type: string
 *               password:
 *                 type: string
 *             required:
 *               - telegram_id
 *               - password
 *     responses:
 *       200:
 *         description: Вход выполнен успешно
 *       400:
 *         description: telegram_id и password обязательны
 *       401:
 *         description: Неверный пароль
 *       404:
 *         description: Пользователь не найден
 */
router.post('/auth/login', UserController.login);

export default router;
