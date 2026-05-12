import pool from '../config/database';

export interface TicketStatusHistory {
  id?: number;
  ticket_id: number;
  old_status?: string;
  new_status: string;
  changed_by?: number;
  changed_at?: Date;
  changed_by_name?: string; // Для отображения имени пользователя
}

class TicketStatusHistoryModel {
  static async create(historyData: TicketStatusHistory): Promise<TicketStatusHistory> {
    const { ticket_id, old_status, new_status, changed_by } = historyData;
    const result = await pool.query(
      `INSERT INTO ticket_status_history (ticket_id, old_status, new_status, changed_by)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [ticket_id, old_status, new_status, changed_by]
    );
    return result.rows[0];
  }

  static async findByTicketId(ticketId: number): Promise<TicketStatusHistory[]> {
    const result = await pool.query(
      `SELECT tsh.*, u.name as changed_by_name
       FROM ticket_status_history tsh
       LEFT JOIN users u ON tsh.changed_by = u.id
       WHERE tsh.ticket_id = $1
       ORDER BY tsh.changed_at ASC`,
      [ticketId]
    );
    return result.rows;
  }
}

export default TicketStatusHistoryModel;
