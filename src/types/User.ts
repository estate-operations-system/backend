export interface User {
  id?: number;
  name: string;
  password: string;
  telegram_id: string;
  telegram_username: string;
  created_at?: Date;
}
