import pool from './database';

export default async function initDatabase() {
  const client = await pool.connect();

  await client.query(`
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      name TEXT NOT NULL,
      telegram_id BIGINT UNIQUE,
      password TEXT,
      telegram_username TEXT,
      role TEXT DEFAULT 'resident',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);

  await client
    .query(
      `
    ALTER TABLE users ALTER COLUMN password DROP NOT NULL
  `
    )
    .catch(() => {});

  await client
    .query(
      `
    ALTER TABLE users ALTER COLUMN telegram_username DROP NOT NULL
  `
    )
    .catch(() => {});

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

  client.release();
  console.log('DB is initializer correctly!');
}
