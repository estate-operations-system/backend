import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const pool = new Pool({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD
});

pool.connect()
  .then(client => {
    console.log('PostgreSQL подключен');
    client.release();
  })
  .catch(err => console.error('Ошибка PostgreSQL', err));

export default pool;
