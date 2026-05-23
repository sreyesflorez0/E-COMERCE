export interface AdminOrderItem {
  id: string;
  product_id: string;
  quantity: number;
  unit_price: number;
  subtotal: number;
}

export interface AdminOrder {
  id: string;
  user_id: string;
  status: string;
  total: number;
  shipping_address: string;
  created_at: string;
  items: AdminOrderItem[];
}
