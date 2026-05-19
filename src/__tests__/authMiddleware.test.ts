import { describe, it, expect, beforeEach, jest } from '@jest/globals';

beforeEach(() => {
  jest.resetModules();
  delete process.env.BOT_TOKEN;
});

describe('requireAuth middleware', () => {
  it('accepts valid bot token', () => {
    process.env.BOT_TOKEN = 'bot-secret';
    const req: any = { headers: { 'x-bot-token': 'bot-secret' } };
    const res: any = { status: jest.fn(() => res), json: jest.fn() };
    const next = jest.fn();

    const mod = require('../middleware/auth');
    mod.requireAuth(req, res, next);

    expect(next).toHaveBeenCalled();
  });

  it('returns 401 when no token provided', () => {
    const req: any = { headers: {} };
    const res: any = { status: jest.fn(() => res), json: jest.fn() };
    const next = jest.fn();

    const mod = require('../middleware/auth');
    mod.requireAuth(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(next).not.toHaveBeenCalled();
  });

  it('returns 403 for invalid jwt token', () => {
    const verifyMock = jest.fn(() => null);
    jest.doMock('../utils/tokenUtils', () => ({ verifyToken: verifyMock }));
    jest.resetModules();

    const req: any = { headers: { authorization: 'Bearer bad.token' } };
    const res: any = { status: jest.fn(() => res), json: jest.fn() };
    const next = jest.fn();

    const mod = require('../middleware/auth');
    mod.requireAuth(req, res, next);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(next).not.toHaveBeenCalled();
  });

  it('attaches user and calls next for valid token', () => {
    const verifyMock = jest.fn(() => ({ userId: 7 }));
    jest.doMock('../utils/tokenUtils', () => ({ verifyToken: verifyMock }));
    jest.resetModules();

    const req: any = { headers: { authorization: 'Bearer good.token' } };
    const res: any = { status: jest.fn(() => res), json: jest.fn() };
    const next = jest.fn();

    const mod = require('../middleware/auth');
    mod.requireAuth(req, res, next);

    expect(next).toHaveBeenCalled();
    expect((req as any).user).toEqual({ userId: 7 });
  });
});
