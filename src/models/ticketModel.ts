import pool from '../config/database';

export interface Ticket {
  id: number;
  category: string;
  description: string;
  address: string;
  status: string;
  resident_id: number;
  created_at: Date;
}

export default class TicketModel {
  static async create(data: {
    category: string;
    description: string;
    address: string;
    resident_id: number;
  }): Promise<Ticket> {
    const { category, description, address, resident_id } = data;

    const result = await pool.query(
      `INSERT INTO tickets (category, description, address, resident_id)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [category, description, address, resident_id]
    );

    return result.rows[0];
  }

  static async findById(id: number): Promise<Ticket | null> {
    const result = await pool.query(
      'SELECT * FROM tickets WHERE id = $1',
      [id]
    );
    return result.rows[0] || null;
  }

  static async findByResident(resident_id: number): Promise<Ticket[]> {
    const result = await pool.query(
      'SELECT * FROM tickets WHERE resident_id = $1 ORDER BY created_at DESC',
      [resident_id]
    );
    return result.rows;
  }
}
