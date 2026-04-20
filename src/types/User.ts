export type UserRole = 'жилец' | 'администратор' | 'юрист';

export interface User {
  id?: number;
  name: string;
  password: string | null;
  telegram_id: string | null;
  telegram_username: string | null;
  email?: string;
  role?: UserRole;
  created_at?: Date;
}
