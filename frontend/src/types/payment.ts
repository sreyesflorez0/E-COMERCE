export type PaymentStatus = 'PENDING' | 'COMPLETED' | 'FAILED';

export type PaymentMethod = 'CARD' | 'CASH' | 'TRANSFER' | 'PSE';

export interface Payment {
  id: string;
  orderId: string;
  userId: string;
  amount: number;
  status: PaymentStatus;
  method: PaymentMethod;
  paidAt?: string;
  createdAt: string;
}

export interface CreatePaymentPayload {
  order_id: string;
  amount: number;
  method: PaymentMethod;
}
