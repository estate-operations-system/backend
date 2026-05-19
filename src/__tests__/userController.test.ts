import { describe, expect, it, beforeEach, jest } from '@jest/globals';

const mockResponse = () => {
  const res: any = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

describe('UserController', () => {
  beforeEach(() => {
    jest.resetModules();
    jest.clearAllMocks();
  });

  it('returns 400 when createUser misses required fields', async () => {
    const { default: UserController } = await import('../controllers/userController');
    const req: any = { body: { name: null, telegram_id: null } };
    const res = mockResponse();

    await UserController.createUser(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      error: 'Имя и telegram_id обязательны',
    });
  });

  it('returns 409 when createUser finds existing telegram_id', async () => {
    jest.doMock('../models/userModel', () => ({
      __esModule: true,
      default: {
        findByTelegramId: jest.fn<any>().mockResolvedValue({ id: 101 }),
      },
    }));

    const { default: UserController } = await import('../controllers/userController');
    const req: any = { body: { name: 'Ivan', telegram_id: '55' } };
    const res = mockResponse();

    await UserController.createUser(req, res);

    expect(res.status).toHaveBeenCalledWith(409);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      error: 'Пользователь с таким telegram id уже существует',
    });
  });

  it('creates a new user successfully', async () => {
    const mockUser = { id: 1, name: 'Ivan', telegram_id: '55' };
    jest.doMock('../models/userModel', () => ({
      __esModule: true,
      default: {
        findByTelegramId: jest.fn<any>().mockResolvedValue(null),
        create: jest.fn<any>().mockResolvedValue(mockUser),
      },
    }));

    const { default: UserController } = await import('../controllers/userController');
    const req: any = { body: { name: 'Ivan', telegram_id: '55' } };
    const res = mockResponse();

    await UserController.createUser(req, res);

    expect(res.json).toHaveBeenCalledWith({
      success: true,
      message: 'Пользователь создан',
      data: mockUser,
    });
  });

  it('returns all users from getAllUsers', async () => {
    const users = [{ id: 1 }, { id: 2 }];
    jest.doMock('../models/userModel', () => ({
      __esModule: true,
      default: {
        findAll: jest.fn<any>().mockResolvedValue(users),
      },
    }));

    const { default: UserController } = await import('../controllers/userController');
    const req: any = {};
    const res = mockResponse();

    await UserController.getAllUsers(req, res);

    expect(res.json).toHaveBeenCalledWith({ success: true, count: users.length, data: users });
  });

  it('returns 404 when getUserById misses user', async () => {
    jest.doMock('../models/userModel', () => ({
      __esModule: true,
      default: { findById: jest.fn<any>().mockResolvedValue(null) },
    }));

    const { default: UserController } = await import('../controllers/userController');
    const req: any = { params: { id: '5' } };
    const res = mockResponse();

    await UserController.getUserById(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ success: false, error: 'Пользователь не найден' });
  });

  it('returns authenticated false for authStatus when no user present', async () => {
    const { default: UserController } = await import('../controllers/userController');
    const req: any = {};
    const res = mockResponse();

    await UserController.authStatus(req, res);

    expect(res.json).toHaveBeenCalledWith({ success: true, authenticated: false });
  });

  it('returns 401 from refreshToken if refreshToken missing', async () => {
    const { default: UserController } = await import('../controllers/userController');
    const req: any = { body: {} };
    const res = mockResponse();

    await UserController.refreshToken(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ success: false, error: 'Refresh token is required' });
  });

  it('returns 401 from refreshToken when token invalid', async () => {
    jest.doMock('../utils/tokenUtils', () => ({
      __esModule: true,
      refreshAccessToken: jest.fn().mockReturnValue(null),
    }));

    const { default: UserController } = await import('../controllers/userController');
    const req: any = { body: { refreshToken: 'bad' } };
    const res = mockResponse();

    await UserController.refreshToken(req, res);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      error: 'Invalid or expired refresh token',
    });
  });

  it('sends registration code when data is valid', async () => {
    const mockEmailService = jest.fn().mockImplementation(() => ({
      sendVerificationCode: jest.fn<any>().mockResolvedValue(undefined),
    }));

    jest.doMock('../models/userModel', () => ({
      __esModule: true,
      default: {
        findByEmail: jest.fn<any>().mockResolvedValue(null),
      },
    }));
    jest.doMock('../models/verificationCodeModel', () => ({
      __esModule: true,
      default: {
        deleteByEmail: jest.fn<any>().mockResolvedValue(undefined),
        create: jest.fn<any>().mockResolvedValue(undefined),
      },
    }));
    jest.doMock('../utils/emailService', () => ({ __esModule: true, default: mockEmailService }));

    const { default: UserController } = await import('../controllers/userController');
    const req: any = { body: { email: 'test@example.com', name: 'Ivan' } };
    const res = mockResponse();

    await UserController.sendRegistrationCode(req, res);

    expect(res.json).toHaveBeenCalledWith({
      success: true,
      message: 'Код подтверждения отправлен на ваш email',
    });
    expect(mockEmailService).toHaveBeenCalled();
  });

  it('returns 400 when verifyLoginCode is called with missing fields', async () => {
    const { default: UserController } = await import('../controllers/userController');
    const req: any = { body: { email: null, code: null } };
    const res = mockResponse();

    await UserController.verifyLoginCode(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ success: false, error: 'Email и code обязательны' });
  });
});
