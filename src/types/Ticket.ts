export interface Ticket {
  id?: number;
  category: string;
  description?: string | null;
  address: string;
  status: string;
  resident_id: number;
  created_at?: Date;
  comments?: TicketComment[];
  statusHistory?: TicketStatusHistory[];
}

export interface TicketComment {
  id?: number;
  ticket_id: number;
  user_id: number;
  comment: string;
  created_at?: Date;
  user_name?: string;
}

export interface TicketStatusHistory {
  id?: number;
  ticket_id: number;
  old_status?: string;
  new_status: string;
  changed_by?: number;
  changed_at?: Date;
  changed_by_name?: string;
}
