const pool = require('./database');

async function initDatabase() {
  try {
    const client = await pool.connect();
    
    // Создаем таблицу пользователей
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        email VARCHAR(100) UNIQUE NOT NULL,
        age INTEGER CHECK (age >= 0),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS tickets (
        id SERIAL PRIMARY KEY,
        category VARCHAR(100) NOT NULL,
        description TEXT NOT NULL,
        address TEXT,
        status VARCHAR(50) DEFAULT 'Новая',
        resident_id INTEGER REFERENCES users(id),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    // Создаем индекс для email
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_users_email 
      ON users(email)
    `);
    
    console.log('✅ Таблицы созданы/проверены');
    
    // Создаем функцию для обновления updated_at
    await client.query(`
      CREATE OR REPLACE FUNCTION update_updated_at_column()
      RETURNS TRIGGER AS $$
      BEGIN
        NEW.updated_at = CURRENT_TIMESTAMP;
        RETURN NEW;
      END;
      $$ language 'plpgsql'
    `);
    
    // Создаем триггер
    await client.query(`
      DROP TRIGGER IF EXISTS update_users_updated_at ON users
    `);
    
    await client.query(`
      CREATE TRIGGER update_users_updated_at
      BEFORE UPDATE ON users
      FOR EACH ROW
      EXECUTE FUNCTION update_updated_at_column()
    `);
    
    client.release();
  } catch (error) {
    console.error('❌ Ошибка при инициализации БД:', error);
  }
}

module.exports = initDatabase;