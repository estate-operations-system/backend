import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import User from '../models/userModel';

class UserController {
  static async getAllUsers(req: Request, res: Response) {
    try {
      const users = await User.findAll();
      res.json({
        success: true,
        count: users.length,
        data: users
      });
    } catch (error) {
      console.error('Ошибка при получении пользователей:', error);
      res.status(500).json({
        success: false,
        error: 'Ошибка сервера'
      });
    }
  }

  static async getUserById(req: Request, res: Response) {
    try {
      const user = await User.findById(parseInt(req.params.id, 10));
      if (!user) {
        return res.status(404).json({ success: false, error: 'Пользователь не найден' });
      }
      res.json({ success: true, data: user });
    } catch (error) {
      console.error('Ошибка при получении пользователя:', error);
      res.status(500).json({ success: false, error: 'Ошибка сервера' });
    }
  }

  static async createUser(req: Request, res: Response) {
    try {
      const { name, telegram_id, telegram_username, password } = req.body;
      if (!name || !telegram_id) {
        return res.status(400).json({ success: false, error: 'Имя и telegram_id обязательны' });
      }
      const existingUser = await User.findByTelegramId(telegram_id);
      if (existingUser) {
        return res.status(409).json({ success: false, error: 'Пользователь с таким telegram id уже существует' });
      }
      // TODO: add hashing later
      // const password_hash = await bcrypt.hash(password, 10);
      const newUser = await User.create({ name, telegram_id, telegram_username, password });
      res.status(201).json({ success: true, message: 'Пользователь создан', data: newUser });
    } catch (error: any) {
      console.error('Ошибка при создании пользователя:', error);

      if (error.code === '23505') { 
        return res.status(409).json({ success: false, error: 'Пользователь с таким email уже существует' });
      }
      console.log('Ошибка при создании пользователя:', error);
      res.status(500).json({ success: false, error: 'Ошибка сервера' });
    }
  }

  static async updateUser(req: Request, res: Response) {
    try {
      const { name, email, password, age } = req.body;

      if (!name || !email) {
        return res.status(400).json({ success: false, error: 'Имя и email обязательны' });
      }
      // const password_hash = await bcrypt.hash(password, 10);

      const updatedUser = await User.update(parseInt(req.params.id, 10), { name, email, password, age });
      if (!updatedUser) {
        return res.status(404).json({ success: false, error: 'Пользователь не найден' });
      }

      res.json({ success: true, message: 'Пользователь обновлен', data: updatedUser });
    } catch (error) {
      console.error('Ошибка при обновлении пользователя:', error);
      res.status(500).json({ success: false, error: 'Ошибка сервера' });
    }
  }

  static async getByTelegramId(req: Request, res: Response) {
    try {
      const telegramId = Number(req.params.telegramId);

      if (Number.isNaN(telegramId)) {
        return res.status(400).json({ message: 'Invalid telegram_id' });
      }

      const user = await User.findByTelegramId(telegramId);

      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      res.json({ success: true, data: user });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Server error' });
    }
  }

  static async deleteUser(req: Request, res: Response) {
    try {
      const deletedUser = await User.delete(parseInt(req.params.id, 10));
      if (!deletedUser) {
        return res.status(404).json({ success: false, error: 'Пользователь не найден' });
      }
      res.json({ success: true, message: 'Пользователь удален' });
    } catch (error) {
      console.error('Ошибка при удалении пользователя:', error);
      res.status(500).json({ success: false, error: 'Ошибка сервера' });
    }
  }

  static async getUsersPaginated(req: Request, res: Response) {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const offset = (page - 1) * limit;

      const users = await User.findWithPagination(limit, offset);
      const total = await User.count();
      const totalPages = Math.ceil(total / limit);

      res.json({ success: true, page, limit, total, totalPages, data: users });
    } catch (error) {
      console.error('Ошибка при пагинации:', error);
      res.status(500).json({ success: false, error: 'Ошибка сервера' });
    }
  }
}

export default UserController;
