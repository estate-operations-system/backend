import pool from './database';

export default async function initDatabase() {
  const client = await pool.connect();

  await client.query(`
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      name TEXT NOT NULL,
      telegram_id BIGINT UNIQUE,
      password TEXT NOT NULL,
      telegram_username TEXT NOT NULL,
      role TEXT DEFAULT 'resident',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);

  await client.query(`
    CREATE TABLE IF NOT EXISTS tickets (
      id SERIAL PRIMARY KEY,
      category TEXT,
      description TEXT,
      status TEXT DEFAULT 'Новая',
      resident_id INTEGER REFERENCES users(id),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);

  client.release();
  console.log('БД инициализирована');
}
