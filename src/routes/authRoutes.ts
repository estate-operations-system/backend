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

/**
 * @swagger
 * /api/auth/refresh:
 *   post:
 *     summary: Обновить access token используя refresh token
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               refreshToken:
 *                 type: string
 *                 description: Refresh token полученный при логине
 *             required:
 *               - refreshToken
 *     responses:
 *       200:
 *         description: Новая пара токенов
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 token:
 *                   type: string
 *                 refreshToken:
 *                   type: string
 *       400:
 *         description: Refresh token обязателен
 *       401:
 *         description: Невалидный или истекший refresh token
 */
router.post('/auth/refresh', UserController.refreshToken);


/**
 * @swagger
 * /api/auth/send-registration-code:
 *   post:
 *     summary: Отправить код подтверждения для регистрации через email (без Telegram)
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 description: Email адрес пользователя
 *               name:
 *                 type: string
 *                 description: Имя пользователя
 *             required:
 *               - email
 *               - name
 *     responses:
 *       200:
 *         description: Код отправлен на email
 *       400:
 *         description: Обязательные поля отсутствуют
 *       409:
 *         description: Пользователь с таким email уже существует
 */
router.post('/auth/send-registration-code', UserController.sendRegistrationCode);

/**
 * @swagger
 * /api/auth/verify-registration-code:
 *   post:
 *     summary: Проверить код подтверждения и выполнить регистрацию через email
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               code:
 *                 type: string
 *                 description: 6-значный код подтверждения
 *               name:
 *                 type: string
 *                 description: Имя пользователя
 *             required:
 *               - email
 *               - code
 *               - name
 *     responses:
 *       200:
 *         description: Регистрация выполнена успешно
 *       400:
 *         description: Неверный или истекший код
 *       409:
 *         description: Пользователь уже существует
 */
router.post('/auth/verify-registration-code', UserController.verifyRegistrationCode);

/**
 * @swagger
 * /api/auth/send-login-code:
 *   post:
 *     summary: Отправить код подтверждения для авторизации через email
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 description: Email адрес пользователя
 *             required:
 *               - email
 *     responses:
 *       200:
 *         description: Код отправлен на email
 *       404:
 *         description: Пользователь с таким email не найден
 */
router.post('/auth/send-login-code', UserController.sendLoginCode);

/**
 * @swagger
 * /api/auth/verify-login-code:
 *   post:
 *     summary: Проверить код подтверждения и выполнить авторизацию через email
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               code:
 *                 type: string
 *                 description: 6-значный код подтверждения
 *             required:
 *               - email
 *               - code
 *     responses:
 *       200:
 *         description: Авторизация выполнена успешно
 *       400:
 *         description: Неверный или истекший код
 *       404:
 *         description: Пользователь не найден
 */
router.post('/auth/verify-login-code', UserController.verifyLoginCode);

/**
 * @swagger
 * /api/auth/dev-token:
 *   get:
 *     summary: "[DEV ONLY] Получить тестовый JWT токен"
 *     tags: [Auth]
 *     description: Только для разработки и тестирования. НЕ ИСПОЛЬЗУЙТЕ В PRODUCTION!
 *     parameters:
 *       - in: query
 *         name: userId
 *         schema:
 *           type: integer
 *           default: 1
 *         description: ID пользователя для токена
 *       - in: query
 *         name: role
 *         schema:
 *           type: string
 *           default: admin
 *         description: Роль пользователя
 *     responses:
 *       200:
 *         description: Успешно получен тестовый токен
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 token:
 *                   type: string
 *                 refreshToken:
 *                   type: string
 *       403:
 *         description: Только доступно в development режиме
 */
if (process.env.NODE_ENV === 'development') {
  router.get('/auth/dev-token', (req, res) => {
    const { generateTokens } = require('../utils/tokenUtils');
    
    const userId = parseInt(req.query.userId as string) || 1;
    const role = (req.query.role as string) || 'admin';
    
    const { token, refreshToken } = generateTokens({
      userId,
      role,
      telegram_id: 'dev-user'
    });
    
    res.json({
      success: true,
      message: 'DEV TOKEN - Only for testing!',
      token,
      refreshToken,
      payload: { userId, role }
    });
  });
}

export default router;
