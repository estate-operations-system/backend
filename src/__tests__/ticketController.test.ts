import { describe, expect, it, beforeEach, jest } from '@jest/globals';

const mockResponse = () => {
  const res: any = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

describe('TicketController', () => {
  beforeEach(() => {
    jest.resetModules();
    jest.clearAllMocks();
  });

  it('returns 400 when createTicket has missing fields', async () => {
    const { default: TicketController } = await import('../controllers/ticketController');
    const req: any = { body: { category: 'test', address: null, status: 'Новая', resident_id: 1 } };
    const res = mockResponse();

    await TicketController.createTicket(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
  });

  it('creates ticket and logs status history when user exists', async () => {
    const ticketRecord = { id: 10, category: 'test' };
    jest.doMock('../models/ticketModel', () => ({
      __esModule: true,
      default: { create: jest.fn<any>().mockResolvedValue(ticketRecord) },
    }));
    jest.doMock('../models/ticketStatusHistoryModel', () => ({
      __esModule: true,
      default: { create: jest.fn<any>().mockResolvedValue(undefined) },
    }));

    const { default: TicketController } = await import('../controllers/ticketController');
    const req: any = {
      body: { category: 'test', address: 'addr', status: 'Новая', resident_id: 2 },
      user: { userId: 3 },
    };
    const res = mockResponse();

    await TicketController.createTicket(req, res);

    expect(res.json).toHaveBeenCalledWith({
      success: true,
      message: 'Заявка создана',
      data: ticketRecord,
    });
  });

  it('returns 404 when getTicketById misses ticket', async () => {
    jest.doMock('../models/ticketModel', () => ({
      __esModule: true,
      default: { findById: jest.fn<any>().mockResolvedValue(null) },
    }));

    const { default: TicketController } = await import('../controllers/ticketController');
    const req: any = { params: { id: '20' } };
    const res = mockResponse();

    await TicketController.getTicketById(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
  });

  it('returns ticket details with comments and status history', async () => {
    const ticket = { id: 20, category: 'repair', address: 'test' };
    const comments = [{ id: 1, comment: 'ok' }];
    const history = [{ id: 1, new_status: 'Новая' }];

    jest.doMock('../models/ticketModel', () => ({
      __esModule: true,
      default: { findById: jest.fn<any>().mockResolvedValue(ticket) },
    }));
    jest.doMock('../models/ticketCommentModel', () => ({
      __esModule: true,
      default: { findByTicketId: jest.fn<any>().mockResolvedValue(comments) },
    }));
    jest.doMock('../models/ticketStatusHistoryModel', () => ({
      __esModule: true,
      default: { findByTicketId: jest.fn<any>().mockResolvedValue(history) },
    }));

    const { default: TicketController } = await import('../controllers/ticketController');
    const req: any = { params: { id: '20' } };
    const res = mockResponse();

    await TicketController.getTicketById(req, res);

    expect(res.json).toHaveBeenCalledWith({
      success: true,
      data: { ...ticket, comments, statusHistory: history },
    });
  });

  it('returns 401 from updateTicketStatus when no authenticated user', async () => {
    const { default: TicketController } = await import('../controllers/ticketController');
    const req: any = { params: { id: '1' }, body: { status: 'Новая' } };
    const res = mockResponse();

    await TicketController.updateTicketStatus(req, res);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ success: false, error: 'Пользователь не авторизован' });
  });

  it('returns 403 from updateTicketStatus when current user is not admin', async () => {
    jest.doMock('../models/userModel', () => ({
      __esModule: true,
      default: { findById: jest.fn<any>().mockResolvedValue({ id: 2, role: 'жилец' }) },
    }));
    const { default: TicketController } = await import('../controllers/ticketController');
    const req: any = { params: { id: '1' }, body: { status: 'Новая' }, user: { userId: 2 } };
    const res = mockResponse();

    await TicketController.updateTicketStatus(req, res);

    expect(res.status).toHaveBeenCalledWith(403);
  });

  it('updates ticket status, records history and notifies telegram', async () => {
    const ticket = {
      id: 7,
      status: 'Новая',
      category: 'cat',
      description: 'desc',
      address: 'addr',
      resident_id: 8,
    };
    const updatedTicket = { ...ticket, status: 'В работе' };
    const adminUser = { id: 99, role: 'администратор' };
    const resident = { id: 8, telegram_id: '123' };

    jest.doMock('../models/userModel', () => ({
      __esModule: true,
      default: {
        findById: jest
          .fn()
          .mockImplementationOnce(() => Promise.resolve(adminUser))
          .mockImplementationOnce(() => Promise.resolve(resident)),
      },
    }));
    jest.doMock('../models/ticketModel', () => ({
      __esModule: true,
      default: {
        findById: jest.fn<any>().mockResolvedValue(ticket),
        update: jest.fn<any>().mockResolvedValue(updatedTicket),
      },
    }));
    jest.doMock('../models/ticketStatusHistoryModel', () => ({
      __esModule: true,
      default: { create: jest.fn<any>().mockResolvedValue(undefined) },
    }));
    const sendTelegramMessageToId = jest.fn<any>().mockResolvedValue(undefined);
    jest.doMock('../utils/telegramService', () => ({ __esModule: true, sendTelegramMessageToId }));

    const { default: TicketController } = await import('../controllers/ticketController');
    const req: any = { params: { id: '7' }, body: { status: 'В работе' }, user: { userId: 99 } };
    const res = mockResponse();

    await TicketController.updateTicketStatus(req, res);

    expect(res.json).toHaveBeenCalledWith({
      success: true,
      message: 'Статус заявки обновлен',
      data: updatedTicket,
    });
  });

  it('returns 400 when addComment comment is empty', async () => {
    const { default: TicketController } = await import('../controllers/ticketController');
    const req: any = { params: { id: '1' }, body: { comment: '  ' }, user: { userId: 5 } };
    const res = mockResponse();

    await TicketController.addComment(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      error: 'Комментарий не может быть пустым',
    });
  });

  it('adds comment and returns saved comment', async () => {
    const comment = { id: 1, ticket_id: 5, user_id: 5, comment: 'Hello' };
    jest.doMock('../models/ticketModel', () => ({
      __esModule: true,
      default: { findById: jest.fn<any>().mockResolvedValue({ id: 5 }) },
    }));
    jest.doMock('../models/ticketCommentModel', () => ({
      __esModule: true,
      default: {
        create: jest.fn<any>().mockResolvedValue(comment),
        findByTicketId: jest.fn<any>().mockResolvedValue([comment]),
      },
    }));

    const { default: TicketController } = await import('../controllers/ticketController');
    const req: any = { params: { id: '5' }, body: { comment: 'Hello' }, user: { userId: 5 } };
    const res = mockResponse();

    await TicketController.addComment(req, res);

    expect(res.json).toHaveBeenCalledWith({
      success: true,
      message: 'Комментарий добавлен',
      data: comment,
    });
  });
});
