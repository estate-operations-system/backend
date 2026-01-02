const pool = require('../config/database');

class Ticket {
  static async create({ category, description, address, resident_id }) {
    const result = await pool.query(
      `INSERT INTO tickets (category, description, address, resident_id)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [category, description, address, resident_id]
    );
    return result.rows[0];
  }
}

module.exports = Ticket;
