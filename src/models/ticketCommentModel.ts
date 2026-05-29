import pool from '../config/database';

export interface TicketComment {
  id?: number;
  ticket_id: number;
  user_id: number;
  comment: string;
  created_at?: Date;
  user_name?: string;
}

class TicketCommentModel {
  static async create(commentData: TicketComment): Promise<TicketComment> {
    const { ticket_id, user_id, comment } = commentData;
    const result = await pool.query(
      `INSERT INTO ticket_comments (ticket_id, user_id, comment)
       VALUES ($1, $2, $3)
       RETURNING *`,
      [ticket_id, user_id, comment]
    );
    return result.rows[0];
  }

  static async findByTicketId(ticketId: number): Promise<TicketComment[]> {
    const result = await pool.query(
      `SELECT tc.*, u.name as user_name
       FROM ticket_comments tc
       JOIN users u ON tc.user_id = u.id
       WHERE tc.ticket_id = $1
       ORDER BY tc.created_at ASC`,
      [ticketId]
    );
    return result.rows;
  }
}

export default TicketCommentModel;
