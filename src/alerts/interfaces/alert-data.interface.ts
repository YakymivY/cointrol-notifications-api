export interface AlertData {
  id: number;
  symbol: string;
  name: string;
  icon: string;
  price: number;
  change: number;
  target_price: number;
  direction: 'above' | 'below';
  user_id: string;
  active: boolean;
  is_triggered: boolean;
  created_at: Date;
}
