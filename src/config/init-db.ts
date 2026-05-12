import pool from './database';

export default async function initDatabase() {
  const client = await pool.connect();

  // Таблица пользователей
  await client.query(`
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      name TEXT NOT NULL,
      telegram_id BIGINT UNIQUE,
      telegram_username TEXT,
      email TEXT UNIQUE,
      color TEXT,
      phone_number TEXT,
      address TEXT,
      role TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Таблица заявок
  await client.query(`
    CREATE TABLE IF NOT EXISTS tickets (
      id SERIAL PRIMARY KEY,
      category TEXT,
      description TEXT,
      address TEXT,
      status TEXT DEFAULT 'Новая',
      resident_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Таблица автомобилей и парковочных мест
  await client.query(`
    CREATE TABLE IF NOT EXISTS vehicle_parking (
      id SERIAL PRIMARY KEY,
      user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      license_plate TEXT NOT NULL,
      vehicle_make TEXT,
      vehicle_model TEXT,
      vehicle_color TEXT,
      parking_spot TEXT NOT NULL,
      parking_zone TEXT,
      comment TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Таблица кодов верификации
  await client.query(`
    CREATE TABLE IF NOT EXISTS verification_codes (
      id SERIAL PRIMARY KEY,
      email TEXT NOT NULL,
      code TEXT NOT NULL,
      expires_at TIMESTAMP NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(email, code)
    )
  `);

  // Таблица комментариев к заявкам
  await client.query(`
    CREATE TABLE IF NOT EXISTS ticket_comments (
      id SERIAL PRIMARY KEY,
      ticket_id INTEGER NOT NULL REFERENCES tickets(id) ON DELETE CASCADE,
      user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      comment TEXT NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Таблица истории статусов заявок
  await client.query(`
    CREATE TABLE IF NOT EXISTS ticket_status_history (
      id SERIAL PRIMARY KEY,
      ticket_id INTEGER NOT NULL REFERENCES tickets(id) ON DELETE CASCADE,
      old_status TEXT,
      new_status TEXT NOT NULL,
      changed_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
      changed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);

  client.release();
}
