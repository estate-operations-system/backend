import { Request, Response } from 'express';
import User from '../models/userModel';
import crypto from 'crypto';
import { TelegramAuthData } from '../types/telegramData';

function checkTelegramAuth(data: any, botToken: string): boolean {
  const { hash, ...fields } = data;

  const decodedFields: Record<string, string> = {};
  Object.keys(fields).forEach((key) => {
    decodedFields[key] = decodeURIComponent(fields[key] ?? '');
  });

  const dataCheckString = Object.keys(decodedFields)
    .sort()
    .map((key) => `${key}=${decodedFields[key]}`)
    .join('\n');

  const secretKey = crypto.createHash('sha256').update(botToken).digest();

  const hmac = crypto.createHmac('sha256', secretKey).update(dataCheckString).digest('hex');

  return hmac === hash;
}

class UserController {
  static async createUser(req: Request, res: Response) {
    try {
      const { name, telegram_id, telegram_username, password } = req.body;

      if (!name || !telegram_id) {
        return res.status(400).json({ success: false, error: 'Имя и telegram_id обязательны' });
      }

      const user = await User.findByTelegramId(telegram_id);
      if (user) {
        return res
          .status(409)
          .json({ success: false, error: 'Пользователь с таким telegram id уже существует' });
      }

      const newUser = await User.create({
        name,
        telegram_id,
        telegram_username,
        password,
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
      res.json({ success: true, count: users.length, data: users });
    } catch (error) {
      console.error('Ошибка при получении пользователей:', error);
      res.status(500).json({ success: false, error: 'Ошибка сервера при получении пользователей' });
    }
  }

  static async getUserById(req: Request, res: Response) {
    try {
      let userId: number | undefined;

      if (req.params.id === 'me') {
        userId = Number(req.session?.userId);
      } else if (req.params.id) {
        userId = parseInt(req.params.id, 10);
      }

      if (!userId) {
        return res.status(401).json({ success: false, error: 'Пользователь не найден по id' });
      }

      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({ success: false, error: 'Пользователь не найден' });
      }
      res.json({ success: true, data: user });
    } catch (error) {
      console.error('Ошибка при получении пользователя по id:', error);
      res
        .status(500)
        .json({ success: false, error: 'Ошибка сервера при получении пользователя по id' });
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
        return res.status(404).json({ success: false, error: 'Пользователь не найден' });
      }

      const updatedUser = await User.update(parseInt(req.params.id, 10), {
        name,
        telegram_id,
        telegram_username,
        password,
      });

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
        return res.status(404).json({ success: false, error: 'Пользователь не найден' });
      }

      const deletedUser = await User.delete(parseInt(req.params.id, 10));

      res.json({ success: true, message: 'Пользователь удален', data: deletedUser });
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
        return res
          .status(409)
          .json({ success: false, error: 'Пользователь с таким telegram id уже существует' });
      }

      const user = await User.create({
        name,
        telegram_id,
        telegram_username,
        password,
      });

      req.session.userId = Number(user.id);

      res.status(201).json({
        success: true,
        data: user,
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Ошибка регистрации' });
    }
  }

  static async login(req: Request, res: Response) {
    try {
      const { telegram_id, password } = req.body;

      if (!telegram_id || !password) {
        return res.status(400).json({
          success: false,
          error: 'telegram_id и password обязательны',
        });
      }

      const user = await User.findByTelegramId(Number(telegram_id));

      if (!user) {
        return res.status(404).json({
          success: false,
          error: 'Пользователь не найден',
        });
      }

      if (user.password !== password) {
        return res.status(401).json({
          success: false,
          error: 'Неверный пароль',
        });
      }

      req.session.userId = Number(user.id);

      return res.json({
        success: true,
        message: 'Вход выполнен успешно',
        data: {
          id: user.id,
          name: user.name,
          telegram_username: user.telegram_username,
        },
      });
    } catch (error) {
      console.error('Ошибка авторизации:', error);

      res.status(500).json({
        success: false,
        error: 'Ошибка сервера',
      });
    }
  }

  static async authStatus(req: Request, res: Response) {
    try {
      const userId = req.session?.userId;
      if (!userId) {
        return res.json({ success: true, authenticated: false });
      }

      const user = await User.findById(userId);
      if (!user) {
        req.session.destroy(() => undefined);
        return res.json({ success: true, authenticated: false });
      }

      return res.json({
        success: true,
        authenticated: true,
        data: {
          id: user.id,
          name: user.name,
          telegram_id: user.telegram_id,
          telegram_username: user.telegram_username,
        },
      });
    } catch (error) {
      console.error('Ошибка при проверке статуса авторизации:', error);
      res.status(500).json({ success: false, error: 'Ошибка сервера' });
    }
  }

  static async logout(req: Request, res: Response) {
    try {
      if (!req.session) {
        return res.json({ success: true, authenticated: false });
      }

      req.session.destroy((err) => {
        if (err) {
          console.error('Ошибка при выходе:', err);
          return res.status(500).json({ success: false, error: 'Ошибка выхода' });
        }

        res.clearCookie('connect.sid');
        return res.json({ success: true, authenticated: false });
      });
    } catch (error) {
      console.error('Ошибка при выходе:', error);
      res.status(500).json({ success: false, error: 'Ошибка сервера' });
    }
  }

  static async telegramAuth(req: Request, res: Response) {
    const data = req.query as unknown as TelegramAuthData;

    const formattedData = {
      id: String(data.id),
      first_name: String(data.first_name ?? ''),
      last_name: String(data.last_name ?? ''),
      username: String(data.username ?? ''),
      photo_url: String(data.photo_url ?? ''),
      auth_date: String(data.auth_date),
      hash: String(data.hash),
    };

    const isValid = checkTelegramAuth(formattedData, process.env.BOT_TOKEN!);

    if (!isValid) {
      return res.status(403).json({ error: 'Invalid telegram auth' });
    }

    let user = await User.findByTelegramId(Number(data.id));

    if (!user) {
      user = await User.create({
        name: data.first_name + data.last_name,
        telegram_id: data.id,
        telegram_username: data.username || null,
        password: null,
      });
    }

    req.session.userId = Number(user.id);

    res.json({
      success: true,
      authenticated: true,
      data: {
        id: user.id,
        name: user.name,
        telegram_id: user.telegram_id,
        telegram_username: user.telegram_username,
      },
    });
  }
}

export default UserController;
