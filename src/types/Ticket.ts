export interface Ticket {
  id?: number;
  category: string;
  description?: string | null;
  address: string;
  status: string;
  resident_id: number;
  created_at?: Date;
}
