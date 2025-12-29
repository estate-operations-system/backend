const pool = require('../config/database');

class User {
  // Получить всех пользователей
  static async findAll() {
    const result = await pool.query(
      'SELECT id, name, email, age, created_at, updated_at FROM users ORDER BY id'
    );
    return result.rows;
  }

  // Найти пользователя по ID
  static async findById(id) {
    const result = await pool.query(
      'SELECT id, name, email, age, created_at, updated_at FROM users WHERE id = $1',
      [id]
    );
    return result.rows[0];
  }

  // Найти пользователя по email
  static async findByEmail(email) {
    const result = await pool.query(
      'SELECT * FROM users WHERE email = $1',
      [email]
    );
    return result.rows[0];
  }

  // Создать пользователя
  static async create(userData) {
    const { name, email, age } = userData;
    const result = await pool.query(
      `INSERT INTO users (name, email, age) 
       VALUES ($1, $2, $3) 
       RETURNING id, name, email, age, created_at, updated_at`,
      [name, email, age]
    );
    return result.rows[0];
  }

  // Обновить пользователя
  static async update(id, userData) {
    const { name, email, age } = userData;
    const result = await pool.query(
      `UPDATE users 
       SET name = $1, email = $2, age = $3 
       WHERE id = $4 
       RETURNING id, name, email, age, created_at, updated_at`,
      [name, email, age, id]
    );
    return result.rows[0];
  }

  // Удалить пользователя
  static async delete(id) {
    const result = await pool.query(
      'DELETE FROM users WHERE id = $1 RETURNING id',
      [id]
    );
    return result.rows[0];
  }

  // Поиск с пагинацией
  static async findWithPagination(limit = 10, offset = 0) {
    const result = await pool.query(
      `SELECT id, name, email, age, created_at, updated_at 
       FROM users 
       ORDER BY id 
       LIMIT $1 OFFSET $2`,
      [limit, offset]
    );
    return result.rows;
  }

  // Получить общее количество
  static async count() {
    const result = await pool.query('SELECT COUNT(*) FROM users');
    return parseInt(result.rows[0].count);
  }
}

module.exports = User;