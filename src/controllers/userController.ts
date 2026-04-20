import { Request, Response } from 'express';
import User from '../models/userModel';
import VerificationCodeModel from '../models/verificationCodeModel';
import crypto from 'crypto';
import { TelegramAuthData } from '../types/telegramData';
import { generateTokens } from '../utils/tokenUtils';
import EmailService from '../utils/emailService';
import { UserRole } from '../types/User';

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
        userId = (req as any).user?.userId ?? Number(req.session?.userId);
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
        // email не указываем для обычной регистрации
      });

      if (!user.id) {
        return res.status(500).json({ error: 'Ошибка при создании пользователя' });
      }

      const { token, refreshToken } = generateTokens({
        userId: user.id,
        telegram_id: user.telegram_id ?? undefined,
        role: user.role,
      });

      res.status(201).json({
        success: true,
        message: 'Регистрация выполнена успешно',
        token,
        refreshToken,
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

      const { token, refreshToken } = generateTokens({
        userId: user.id,
        telegram_id: user.telegram_id,
        role: user.role,
      });

      return res.json({
        success: true,
        message: 'Вход выполнен успешно',
        token,
        refreshToken,
        data: {
          id: user.id,
          name: user.name,
          telegram_username: user.telegram_username,
          role: user.role,
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
      const user = (req as any).user;
      if (!user) {
        console.log('No user in token');
        return res.json({ success: true, authenticated: false });
      }

      const dbUser = await User.findById(user.userId);
      if (!dbUser) {
        console.log('User not found:', user.userId);
        return res.json({ success: true, authenticated: false });
      }

      console.log('User authenticated:', dbUser.id);
      res.json({
        success: true,
        authenticated: true,
        data: {
          id: dbUser.id,
          name: dbUser.name,
          telegram_id: dbUser.telegram_id,
          telegram_username: dbUser.telegram_username,
          role: dbUser.role,
        },
      });
    } catch (error) {
      console.error('Auth status error:', error);
      res.status(500).json({ success: false, error: 'Server error' });
    }
  }

  static async logout(req: Request, res: Response) {
    try {
      // Для JWT logout происходит на клиенте (удаление токена)
      // Здесь просто возвращаем успех
      res.json({ success: true, authenticated: false });
    } catch (error) {
      console.error('Logout error:', error);
      res.status(500).json({ success: false, error: 'Server error' });
    }
  }

  static async refreshToken(req: Request, res: Response) {
    try {
      const { refreshToken } = req.body;

      if (!refreshToken) {
        return res.status(400).json({
          success: false,
          error: 'Refresh token is required',
        });
      }

      const { refreshAccessToken } = await import('../utils/tokenUtils');
      const tokens = refreshAccessToken(refreshToken);

      if (!tokens) {
        return res.status(401).json({
          success: false,
          error: 'Invalid or expired refresh token',
        });
      }

      res.json({
        success: true,
        token: tokens.token,
        refreshToken: tokens.refreshToken,
      });
    } catch (error) {
      console.error('Token refresh error:', error);
      res.status(500).json({ success: false, error: 'Server error' });
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
        name: (data.first_name || '') + ' ' + (data.last_name || ''),
        telegram_id: data.id,
        telegram_username: data.username || null,
        password: null,
        // email не указываем для Telegram пользователей
      });
    }

    const { token, refreshToken } = generateTokens({
      userId: user.id,
      telegram_id: user.telegram_id,
      role: user.role,
    });

    res.json({
      success: true,
      authenticated: true,
      token,
      refreshToken,
      data: {
        id: user.id,
        name: user.name,
        telegram_id: user.telegram_id,
        telegram_username: user.telegram_username,
        role: user.role,
      },
    });
  }

  static async telegramAuthPost(req: Request, res: Response) {
    console.log('Telegram auth POST:', {
      body: req.body,
      origin: req.headers.origin,
    });

    const data = req.body as TelegramAuthData;

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
      console.log('Invalid telegram auth');
      return res.status(403).json({ error: 'Invalid telegram auth' });
    }

    let user = await User.findByTelegramId(Number(data.id));

    if (!user) {
      user = await User.create({
        name: (data.first_name || '') + ' ' + (data.last_name || ''),
        telegram_id: data.id,
        telegram_username: data.username || null,
        password: null,
        // email не указываем для Telegram пользователей
      });
      console.log('Created new user:', user.id);
    }

    const { token, refreshToken } = generateTokens({
      userId: user.id,
      telegram_id: user.telegram_id,
      role: user.role,
    });

    console.log('Generated JWT token for user:', user.id);

    res.json({
      success: true,
      authenticated: true,
      token,
      refreshToken,
      data: {
        id: user.id,
        name: user.name,
        telegram_id: user.telegram_id,
        telegram_username: user.telegram_username,
        role: user.role,
      },
    });
  }

  // Email authentication methods
  static async sendVerificationCode(req: Request, res: Response) {
    try {
      const { email, telegram_id, name } = req.body;

      if (!email || !telegram_id || !name) {
        return res.status(400).json({
          success: false,
          error: 'Email, telegram_id и name обязательны'
        });
      }

      // Проверяем, существует ли уже пользователь с таким email
      const existingUser = await User.findByEmail(email);
      if (existingUser) {
        return res.status(409).json({
          success: false,
          error: 'Пользователь с таким email уже существует'
        });
      }

      const code = Math.floor(100000 + Math.random() * 900000).toString();
      const expiresAt = new Date();
      expiresAt.setMinutes(expiresAt.getMinutes() + 10);

      await VerificationCodeModel.deleteByEmail(email);

      await VerificationCodeModel.create({
        email,
        code,
        telegram_id,
        expires_at: expiresAt,
      });

      const emailService = new EmailService();
      await emailService.sendVerificationCode(email, code, telegram_id);

      res.json({
        success: true,
        message: 'Код подтверждения отправлен на ваш email'
      });
    } catch (error) {
      console.error('Send verification code error:', error);
      res.status(500).json({
        success: false,
        error: 'Ошибка отправки кода подтверждения'
      });
    }
  }

  static async verifyCode(req: Request, res: Response) {
    try {
      const { email, code, telegram_id, name } = req.body;

      if (!email || !code || !telegram_id || !name) {
        return res.status(400).json({
          success: false,
          error: 'Email, code, telegram_id и name обязательны'
        });
      }

      const verificationCode = await VerificationCodeModel.findByEmailAndCode(email, code);

      if (!verificationCode) {
        return res.status(400).json({
          success: false,
          error: 'Неверный или истекший код подтверждения'
        });
      }

      if (verificationCode.telegram_id !== telegram_id) {
        return res.status(400).json({
          success: false,
          error: 'Telegram ID не совпадает'
        });
      }

      // Сначала проверяем, существует ли пользователь с таким telegram_id
      let user = await User.findByTelegramId(Number(telegram_id));

      if (user) {
        // Пользователь существует по telegram_id
        // Проверяем, совпадает ли email (если у пользователя уже есть email)
        if (user.email && user.email !== email) {
          return res.status(409).json({
            success: false,
            error: 'Этот Telegram ID уже связан с другой почтой'
          });
        }
      } else {
        // Пользователя с таким telegram_id нет
        // Проверяем, существует ли пользователь с таким email
        const existingUserByEmail = await User.findByEmail(email);
        if (existingUserByEmail) {
          return res.status(409).json({
            success: false,
            error: 'Пользователь с таким email уже существует, но с другим Telegram ID'
          });
        }

        // Создаем нового пользователя
        user = await User.create({
          name,
          telegram_id,
          telegram_username: null,
          email,
          password: null,
        });
      }

      // Удаляем использованный код
      await VerificationCodeModel.deleteByEmail(email);

      // Генерируем токены
      const { token, refreshToken } = generateTokens({
        userId: user.id,
        telegram_id: user.telegram_id,
        role: user.role,
      });

      res.json({
        success: true,
        message: user.id ? 'Авторизация выполнена успешно' : 'Регистрация выполнена успешно',
        token,
        refreshToken,
        data: {
          id: user.id,
          name: user.name,
          telegram_id: user.telegram_id,
          email: user.email,
          role: user.role,
        },
      });
    } catch (error) {
      console.error('Verify code error:', error);
      res.status(500).json({
        success: false,
        error: 'Ошибка верификации кода'
      });
    }
  }

  // Обновление роли пользователя (только для администраторов)
  static async updateUserRole(req: Request, res: Response) {
    try {
      // Проверяем, что текущий пользователь - администратор
      const currentUser = (req as any).user;
      if (!currentUser) {
        return res.status(401).json({ success: false, error: 'Пользователь не авторизован' });
      }

      const dbUser = await User.findById(currentUser.userId);
      if (!dbUser) {
        return res.status(404).json({ success: false, error: 'Пользователь не найден' });
      }

      if (dbUser.role !== 'администратор') {
        return res.status(403).json({ success: false, error: 'Доступ запрещен. Только администратор может изменять роли.' });
      }

      const { role } = req.body;
      
      if (!role || typeof role !== 'string') {
        return res.status(400).json({ 
          success: false, 
          error: 'Недопустимая роль. Допустимые значения: жилец, администратор, юрист' 
        });
      }

      const validRoles = ['жилец', 'администратор', 'юрист'];
      
      if (!validRoles.includes(role)) {
        return res.status(400).json({ 
          success: false, 
          error: 'Недопустимая роль. Допустимые значения: жилец, администратор, юрист' 
        });
      }

      const targetUserId = parseInt(req.params.id, 10);
      const targetUser = await User.findById(targetUserId);
      
      if (!targetUser) {
        return res.status(404).json({ success: false, error: 'Целевой пользователь не найден' });
      }

      const updatedUser = await User.update(targetUserId, { 
        role: role as UserRole 
      });

      res.json({ 
        success: true, 
        message: 'Роль пользователя обновлена', 
        data: updatedUser 
      });
    } catch (error) {
      console.error('Ошибка при обновлении роли пользователя:', error);
      res.status(500).json({ success: false, error: 'Ошибка сервера при обновлении роли пользователя' });
    }
  }
}

export default UserController;
