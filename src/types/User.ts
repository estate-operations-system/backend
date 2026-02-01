export interface User {
  id?: number;
  name: string;
  password: string;
  telegram_id?: string | null;
  telegram_username?: string | null;
  created_at?: Date;
}
