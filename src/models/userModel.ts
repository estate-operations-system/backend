import pool from '../config/database';
import { User } from '../types/User';

class UserModel {
  static async create(userData: User): Promise<User> {
    const { name, password, telegram_id, telegram_username, email, role, color, phoneNumber, address } = userData;

    // Для Telegram пользователей не указываем email, чтобы избежать конфликтов с UNIQUE
    const fields = ['name', 'password', 'telegram_id', 'telegram_username'];
    const values = [name, password ?? null, telegram_id, telegram_username];
    const placeholders = ['$1', '$2', '$3', '$4'];

    if (email !== undefined && email !== null) {
      fields.push('email');
      values.push(email);
      placeholders.push(`$${values.length}`);
    }

    if (role !== undefined) {
      fields.push('role');
      values.push(role);
      placeholders.push(`$${values.length}`);
    }

    if (color !== undefined) {
      fields.push('color');
      values.push(color);
      placeholders.push(`$${values.length}`);
    }

    if (phoneNumber !== undefined) {
      fields.push('phone_number');
      values.push(phoneNumber);
      placeholders.push(`$${values.length}`);
    }

    if (address !== undefined) {
      fields.push('address');
      values.push(address);
      placeholders.push(`$${values.length}`);
    }

    const result = await pool.query(
      `INSERT INTO users (${fields.join(', ')})
      VALUES (${placeholders.join(', ')})
      RETURNING *`,
      values
    );

    return result.rows[0];
  }

  static async findAll(): Promise<User[]> {
    const result = await pool.query('SELECT * FROM users ORDER BY id');
    return result.rows;
  }

  static async findById(id: number): Promise<User | null> {
    const result = await pool.query('SELECT * FROM users WHERE id = $1', [id]);
    return result.rows[0] || null;
  }

  static async findByTelegramId(telegramId: number) {
    const result = await pool.query(`SELECT * FROM users WHERE telegram_id = $1`, [telegramId]);
    return result.rows[0] || null;
  }

  static async findByTelegramUsername(telegramUsername: string) {
    const result = await pool.query(`SELECT * FROM users WHERE telegram_username = $1`, [
      telegramUsername,
    ]);
    return result.rows[0] || null;
  }

  static async findByEmail(email: string) {
    const result = await pool.query(`SELECT * FROM users WHERE email = $1`, [email]);
    return result.rows[0] || null;
  }

  static async update(id: number, userData: Partial<User>): Promise<User | null> {
    const fields: string[] = [];
    const values: (string | number | null)[] = [];

    if (userData.name !== undefined) {
      fields.push('name');
      values.push(userData.name);
    }
    if (userData.password !== undefined) {
      fields.push('password');
      values.push(userData.password);
    }
    if (userData.telegram_id !== undefined) {
      fields.push('telegram_id');
      values.push(userData.telegram_id);
    }
    if (userData.telegram_username !== undefined) {
      fields.push('telegram_username');
      values.push(userData.telegram_username);
    }
    if (userData.email !== undefined) {
      fields.push('email');
      values.push(userData.email);
    }
    if (userData.role !== undefined) {
      fields.push('role');
      values.push(userData.role);
    }
    if (userData.color !== undefined) {
      fields.push('color');
      values.push(userData.color);
    }
    if (userData.phoneNumber !== undefined) {
      fields.push('phone_number');
      values.push(userData.phoneNumber);
    }
    if (userData.address !== undefined) {
      fields.push('address');
      values.push(userData.address);
    }

    if (fields.length === 0) {
      return this.findById(id);
    }

    const setClause = fields.map((field, index) => `${field} = $${index + 1}`).join(', ');
    values.push(id);

    const result = await pool.query(
      `UPDATE users
       SET ${setClause}
       WHERE id = $${values.length}
       RETURNING *`,
      values
    );
    return result.rows[0] || null;
  }

  static async delete(id: number): Promise<{ id: number } | null> {
    const result = await pool.query('DELETE FROM users WHERE id = $1 RETURNING id', [id]);
    return result.rows[0] || null;
  }

  static async setRoleByTelegramId(telegramId: number, role: string): Promise<User | null> {
    const result = await pool.query(
      `UPDATE users SET role = $1 WHERE telegram_id = $2 RETURNING *`,
      [role, telegramId]
    );
    return result.rows[0] || null;
  }
}

export default UserModel;
