export interface OrderItem {
  id: string;
  orderId: string;
  productId: string;
  productName?: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
}

export interface Order {
  id: string;
  userId: string;
  status: string; // e.g., PENDING, PAID, CANCELLED
  total: number;
  shippingAddress: string;
  createdAt: string;
  items: OrderItem[];
}

export interface CreateOrderPayload {
  shipping_address: string;
  items: {
    product_id: string;
    quantity: number;
    unit_price: number;
  }[];
}
