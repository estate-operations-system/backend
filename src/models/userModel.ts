import pool from '../config/database';

export interface IUser {
  id?: number;
  name: string;
  email?: string | null;
  password: string;
  telegram_id?: string | null;
  telegram_username?: string | null;
  age?: number | null;
  created_at?: Date;
}

class User {
  static async findAll(): Promise<IUser[]> {
    const result = await pool.query(
      'SELECT id, name, telegram_username, role, password, created_at FROM users ORDER BY id'
    );
    return result.rows;
  }

  static async findById(id: number): Promise<IUser | null> {
    const result = await pool.query(
      'SELECT id, name, telegram_username, role, password, created_at FROM users WHERE id = $1',
      [id]
    );
    return result.rows[0] || null;
  }

  static async findByEmail(email: string): Promise<IUser | null> {
    const result = await pool.query(
      'SELECT id, name, email, age, created_at FROM users WHERE email = $1',
      [email]
    );
    return result.rows[0] || null;
  }

  static async create(userData: IUser): Promise<IUser> {
    const { name, password, age, telegram_id, telegram_username } = userData;
    const result = await pool.query(
      `INSERT INTO users (name, password, age, telegram_id, telegram_username)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, name, role, telegram_id, telegram_username, created_at`,
      [
        name,
        password,
        age ?? null,
        telegram_id ?? null,
        telegram_username ?? null
      ]
    );
    return result.rows[0];
  }

  static async update(id: number, userData: IUser): Promise<IUser | null> {
    const { name, email, age } = userData;
    const result = await pool.query(
      `UPDATE users
       SET name = $1, email = $2, age = $3
       WHERE id = $4
       RETURNING id, name, email, age, created_at`,
      [name, email, age ?? null, id]
    );
    return result.rows[0] || null;
  }

  static async delete(id: number): Promise<{ id: number } | null> {
    const result = await pool.query(
      'DELETE FROM users WHERE id = $1 RETURNING id',
      [id]
    );
    return result.rows[0] || null;
  }

  static async findWithPagination(limit = 10, offset = 0): Promise<IUser[]> {
    const result = await pool.query(
      `SELECT id, name, email, age, created_at
       FROM users
       ORDER BY id
       LIMIT $1 OFFSET $2`,
      [limit, offset]
    );
    return result.rows;
  }

  static async findByTelegramId(telegramId: number) {
    const result = await pool.query(
      `
      SELECT id, name, email, age, telegram_id, role, created_at
      FROM users
      WHERE telegram_id = $1
      `,
      [telegramId]
    );

    return result.rows[0] || null;
  }

  static async count(): Promise<number> {
    const result = await pool.query('SELECT COUNT(*) FROM users');
    return parseInt(result.rows[0].count, 10);
  }
}

export default User;
