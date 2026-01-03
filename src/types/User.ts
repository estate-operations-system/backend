export interface User {
  id: number;
  name: string;
  email?: string;
  telegram_id?: number;
  role: 'resident' | 'admin' | 'executor';
}
