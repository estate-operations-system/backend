import { Request, Response } from 'express';
import User from '../models/userModel';
import { sendLoginCode } from '../services/telegramService';

class UserController {
  static async createUser(req: Request, res: Response) {
    try {
      const { name, telegram_id, telegram_username, password } = req.body;

      if (!name || !telegram_id) {
        return res.status(400).json({ success: false, error: 'Имя и telegram_id обязательны' });
      }

      const user = await User.findByTelegramId(telegram_id);
      if (user) {
        return res.status(409).json({ success: false, error: 'Пользователь с таким telegram id уже существует' });
      }

      const newUser = await User.create({ 
        name, 
        telegram_id, 
        telegram_username, 
        password 
      });

      res.json({ success: true, message: 'Пользователь создан', data: newUser });
    } catch (error: any) {
      console.error('Ошибка при создании пользователя:', error);
      res.status(500).json({ success: false, error: 'Ошибка сервера при создании пользователя' });
    }
  }

  static async getAllUsers(req: Request, res: Response) {
    try {
      const users = await User.findAll();
      res.json({success: true, count: users.length, data: users});
    } catch (error) {
      console.error('Ошибка при получении пользователей:', error);
      res.status(500).json({success: false, error: 'Ошибка сервера при получении пользователей' });
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
      console.error('Ошибка при получении пользователя по id:', error);
      res.status(500).json({ success: false, error: 'Ошибка сервера при получении пользователя по id' });
    }
  }

  static async getUserByTelegramId(req: Request, res: Response) {
    try {
      const user = await User.findByTelegramId(Number(req.params.telegramId));
      if (!user) {
        return res.status(404).json({ message: '`Пользователь не найден`' });
      }
      res.json({ success: true, data: user });
    } catch (error) {
      console.error('Ошибка при получении пользователя по telegram_id:', error);
      res.status(500).json({ message: 'Ошибка сервера при получении пользователя по telegram_id' });
    }
  }

  static async updateUser(req: Request, res: Response) {
    try {
      const { name, telegram_id, telegram_username, password } = req.body;

      const user = await User.findById(parseInt(req.params.id, 10));
      if (!user) {
        return res.status(404).json({success: false, error: 'Пользователь не найден' });
      }

      const updatedUser = await User.update(parseInt(req.params.id, 10), { name, telegram_id, telegram_username, password });

      res.json({ success: true, message: 'Пользователь обновлен', data: updatedUser });
    } catch (error) {
      console.error('Ошибка при обновлении пользователя:', error);
      res.status(500).json({ success: false, error: 'Ошибка сервера при обновлении пользователя' });
    }
  }

  static async deleteUser(req: Request, res: Response) {
    try {
      const user = await User.findById(parseInt(req.params.id, 10));
      if (!user) {
        return res.status(404).json({success: false, error: 'Пользователь не найден'});
      }

      const deletedUser = await User.delete(parseInt(req.params.id, 10));

      res.json({ success: true, message: 'Пользователь удален', data: deletedUser});
    } catch (error) {
      console.error('Ошибка при удалении пользователя:', error);
      res.status(500).json({ success: false, error: 'Ошибка сервера при удалении пользователя' });
    }
  }

  static async register(req: Request, res: Response) {
    try {
      const { name, telegram_id, telegram_username, password } = req.body;

      const existingUser = await User.findByTelegramId(telegram_id);
      if (existingUser) {
        return res.status(409).json({ success: false, error: 'Пользователь с таким telegram id уже существует' });
      }

      const user = await User.create({
        name, 
        telegram_id, 
        telegram_username, 
        password
      });

      res.status(201).json({
        success: true,
        data: user
      });

    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Ошибка регистрации' });
    }
  }

  static async login(req: Request, res: Response) {
    try {
      const { name, telegram_id, telegram_username, password } = req.body;

      if (!telegram_id || !password) {
        return res.status(400).json({
          success: false,
          error: 'telegram_id и password обязательны'
        });
      }

      const user = await User.findByTelegramId(Number(telegram_id));

      if (!user) {
        return res.status(404).json({
          success: false,
          error: 'Пользователь не найден'
        });
      }

      if (user.password !== password) {
        return res.status(401).json({
          success: false,
          error: 'Неверный пароль'
        });
      }

      return res.json({
        success: true,
        message: 'Вход выполнен успешно',
        data: {
          id: user.id,
          name: user.name,
          telegram_username: user.telegram_username
        }
      });

    } catch (error) {
      console.error('Ошибка авторизации:', error);

      res.status(500).json({
        success: false,
        error: 'Ошибка сервера'
      });
    }
  }
}

export default UserController;
