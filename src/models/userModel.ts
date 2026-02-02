import pool from '../config/database';
import { User } from '../types/User';

class UserModel {
  static async create(userData: User): Promise<User> {
    const { name, password, telegram_id, telegram_username } = userData;
    const result = await pool.query(
      `INSERT INTO users (name, password, telegram_id, telegram_username)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [name, password, telegram_id, telegram_username]
    );
    return result.rows[0];
  }

  static async findAll(): Promise<User[]> {
    const result = await pool.query(
      'SELECT * FROM users ORDER BY id'
    );
    return result.rows;
  }

  static async findById(id: number): Promise<User | null> {
    const result = await pool.query(
      'SELECT * FROM users WHERE id = $1',
      [id]
    );
    return result.rows[0] || null;
  }

  static async findByTelegramId(telegramId: number) {
    const result = await pool.query(
      `SELECT * FROM users WHERE telegram_id = $1`,
      [telegramId]
    );
    return result.rows[0] || null;
  }

  static async update(id: number, userData: User): Promise<User | null> {
    const { name, password } = userData;
    const result = await pool.query(
      `UPDATE users
       SET name = $1, password = $2
       WHERE id = $3
       RETURNING id, name, password, created_at`,
      [name, password, id]
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
}

export default UserModel;
