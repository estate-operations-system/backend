export interface User {
  id?: number;
  name: string;
  password: string | null;
  telegram_id: string;
  telegram_username: string | null;
  email?: string;
  created_at?: Date;
}
