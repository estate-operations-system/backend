import { Router } from 'express';
import UserController from '../controllers/userController';
import { authenticateToken } from '../app';

const router = Router();

router.get('/auth/telegram', UserController.telegramAuth);
router.post('/auth/telegram', UserController.telegramAuthPost);
router.get('/auth/status', authenticateToken, UserController.authStatus);
router.post('/auth/logout', UserController.logout);
router.post('/register', UserController.register);
router.post('/login', UserController.login);

export default router;
