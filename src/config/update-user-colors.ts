import pool from './database';
import { generateColorFromId } from '../utils/colorUtils';

async function updateUserColors() {
  const client = await pool.connect();

  try {
    const result = await client.query(`SELECT id FROM users WHERE color IS NULL`);
    console.log(`Found ${result.rows.length} user(s) without color.`);

    for (const row of result.rows) {
      const color = generateColorFromId(row.id);
      await client.query(`UPDATE users SET color = $1 WHERE id = $2`, [color, row.id]);
      console.log(`Updated user ${row.id} with color ${color}.`);
    }

    console.log('User color update completed successfully.');
  } catch (error) {
    console.error('Failed to update user colors:', error);
    process.exit(1);
  } finally {
    client.release();
  }
}

updateUserColors();
