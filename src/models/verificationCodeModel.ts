import pool from '../config/database';

export interface VerificationCode {
  id?: number;
  email: string;
  code: string;
  telegram_id: string;
  expires_at: Date;
  created_at?: Date;
}

class VerificationCodeModel {
  static async create(codeData: VerificationCode): Promise<VerificationCode> {
    const { email, code, telegram_id, expires_at } = codeData;

    const result = await pool.query(
      `INSERT INTO verification_codes (email, code, telegram_id, expires_at)
      VALUES ($1, $2, $3, $4)
      RETURNING *`,
      [email, code, telegram_id, expires_at]
    );

    return result.rows[0];
  }

  static async findByEmailAndCode(email: string, code: string): Promise<VerificationCode | null> {
    const result = await pool.query(
      `SELECT * FROM verification_codes
       WHERE email = $1 AND code = $2 AND expires_at > NOW()
       ORDER BY created_at DESC LIMIT 1`,
      [email, code]
    );
    return result.rows[0] || null;
  }

  static async deleteByEmail(email: string): Promise<void> {
    await pool.query('DELETE FROM verification_codes WHERE email = $1', [email]);
  }

  static async cleanupExpired(): Promise<void> {
    await pool.query('DELETE FROM verification_codes WHERE expires_at <= NOW()');
  }
}

export default VerificationCodeModel;