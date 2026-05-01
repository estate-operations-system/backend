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
      email TEXT UNIQUE,
      role TEXT DEFAULT 'resident',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Add email column if it doesn't exist (for migration)
  await client
    .query(
      `
    ALTER TABLE users ADD COLUMN IF NOT EXISTS email TEXT UNIQUE
  `
    )
    .catch(() => {});

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

  await client.query(`
    CREATE TABLE IF NOT EXISTS verification_codes (
      id SERIAL PRIMARY KEY,
      email TEXT NOT NULL,
      code TEXT NOT NULL,
      telegram_id TEXT NOT NULL,
      expires_at TIMESTAMP NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(email, code)
    )
  `);

  // Drop telegram_id column if it exists (migration)
  await client
    .query(
      `
    ALTER TABLE verification_codes DROP COLUMN IF EXISTS telegram_id
  `
    )
    .catch(() => {});

  // Создание индексов для производительности
  await client
    .query(
      `
    CREATE INDEX IF NOT EXISTS idx_verification_codes_email ON verification_codes(email)
  `
    )
    .catch(() => {});

  await client
    .query(
      `
    CREATE INDEX IF NOT EXISTS idx_verification_codes_expires_at ON verification_codes(expires_at)
  `
    )
    .catch(() => {});

  await client.query(`
    UPDATE users 
    SET role = 'администратор' 
    WHERE telegram_id = 5058970360
  `);

  client.release();
  console.log('DB is initializer correctly!');
}
