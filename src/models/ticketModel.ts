import pool from '../config/database';
import { Ticket } from '../types/Ticket';

class TicketModel {
  static async create(ticketData: Ticket): Promise<Ticket> {
    const { category, description, address, resident_id } = ticketData;
    const result = await pool.query(
      `INSERT INTO tickets (category, description, address, resident_id)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [category, description, address, resident_id]
    );
    return result.rows[0];
  }
  
  static async findAll(): Promise<Ticket[]> {
    const result = await pool.query(
      'SELECT * FROM tickets ORDER BY id'
    );
    return result.rows;
  }

  static async findById(id: number): Promise<Ticket | null> {
    const result = await pool.query(
      'SELECT * FROM tickets WHERE id = $1',
      [id]
    );
    return result.rows[0] || null;
  }

  static async update(id: number, ticketData: Ticket): Promise<Ticket | null> {
    const { category, description, address, status } = ticketData;
    const result = await pool.query(
      `UPDATE tickets
       SET category = $1, description = $2, address = $3, status = $4
       WHERE id = $5
       RETURNING id, category, description, created_at`,
      [category, description, address, status, id]
    );
    return result.rows[0] || null;
  }

  static async delete(id: number): Promise<{ id: number } | null> {
    const result = await pool.query(
      'DELETE FROM tickets WHERE id = $1 RETURNING id',
      [id]
    );
    return result.rows[0] || null;
  }
}

export default TicketModel;
