import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET || 'your-refresh-secret-key';

export interface TokenPayload {
  userId: number;
  telegram_id?: string;
}

export interface TokenPair {
  token: string;
  refreshToken: string;
}

/**
 * Генерирует пару токенов (access + refresh)
 * Access token: 15 минут
 * Refresh token: 7 дней
 */
export function generateTokens(payload: TokenPayload): TokenPair {
  const token = jwt.sign(payload, JWT_SECRET, {
    expiresIn: '1m',
  });

  const refreshToken = jwt.sign(payload, REFRESH_TOKEN_SECRET, {
    expiresIn: '7d',
  });

  return { token, refreshToken };
}

/**
 * Проверяет access token
 */
export function verifyToken(token: string): TokenPayload | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as TokenPayload;
    return decoded;
  } catch (error) {
    console.error('Access token verification failed:', error);
    return null;
  }
}

/**
 * Проверяет refresh token
 */
export function verifyRefreshToken(refreshToken: string): TokenPayload | null {
  try {
    const decoded = jwt.verify(refreshToken, REFRESH_TOKEN_SECRET) as TokenPayload;
    return decoded;
  } catch (error) {
    console.error('Refresh token verification failed:', error);
    return null;
  }
}

/**
 * Обновляет access token используя refresh token
 */
export function refreshAccessToken(refreshToken: string): TokenPair | null {
  const payload = verifyRefreshToken(refreshToken);
  if (!payload) {
    return null;
  }

  // Удаляем exp и iat из payload, чтобы jwt.sign мог использовать expiresIn
  const { exp, iat, ...cleanPayload } = payload as any;

  return generateTokens(cleanPayload);
}
