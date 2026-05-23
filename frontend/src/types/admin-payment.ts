export interface AdminPayment {
  id: string;
  order_id: string;
  user_id: string;
  amount: number;
  status: string;
  method: string;
  paid_at?: string;
  created_at: string;
}
