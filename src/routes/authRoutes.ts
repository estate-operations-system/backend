import { Router } from 'express';
import UserController from '../controllers/userController';

const router = Router();

router.get("/auth/telegram", UserController.telegramAuth);
router.post('/register', UserController.register);
router.post('/login', UserController.login);

export default router;