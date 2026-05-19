import { describe, expect, it, beforeEach, jest } from '@jest/globals';

beforeEach(() => {
  // Ensure a deterministic secret for tests
  process.env.JWT_SECRET = 'test-jwt-secret';
  process.env.REFRESH_TOKEN_SECRET = 'test-refresh-secret';
  jest.resetModules();
});

describe('tokenUtils', () => {
  it('generates and verifies access and refresh tokens', () => {
    const { generateTokens, verifyToken, verifyRefreshToken, refreshAccessToken } = require('../utils/tokenUtils');

    const payload = { userId: 42, telegram_id: '100', role: null };
    const pair = generateTokens(payload);

    expect(pair).toHaveProperty('token');
    expect(pair).toHaveProperty('refreshToken');

    const decoded = verifyToken(pair.token);
    expect(decoded).toBeTruthy();
    expect((decoded as any).userId).toBe(42);

    const decodedRefresh = verifyRefreshToken(pair.refreshToken);
    expect(decodedRefresh).toBeTruthy();
    expect((decodedRefresh as any).userId).toBe(42);

    const refreshed = refreshAccessToken(pair.refreshToken);
    expect(refreshed).not.toBeNull();
    expect(refreshed).toHaveProperty('token');
    expect(refreshed).toHaveProperty('refreshToken');
  });

  it('returns null for invalid tokens', () => {
    const { verifyToken, verifyRefreshToken, refreshAccessToken } = require('../utils/tokenUtils');

    expect(verifyToken('invalid.token')).toBeNull();
    expect(verifyRefreshToken('invalid.token')).toBeNull();
    expect(refreshAccessToken('invalid.token')).toBeNull();
  });
});
