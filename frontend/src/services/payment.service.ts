import { api } from '@/lib/api';
import { Payment, CreatePaymentPayload } from '@/types/payment';

// Normalizer to handle flexible API responses
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const normalizePayment = (data: any): Payment => {
  return {
    id: data.id || data.payment_id || data.paymentId,
    orderId: data.order_id || data.orderId,
    userId: data.user_id || data.userId,
    amount: typeof data.amount === 'string' ? parseFloat(data.amount) : Number(data.amount),
    status: data.status,
    method: data.method,
    paidAt: data.paid_at || data.paidAt,
    createdAt: data.created_at || data.createdAt,
  };
};

export const paymentService = {
  getMyPayments: async (): Promise<Payment[]> => {
    const response = await api.get('/payments/me');
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return response.data.map((item: any) => normalizePayment(item));
  },

  createPayment: async (payload: CreatePaymentPayload): Promise<Payment> => {
    const response = await api.post('/payments', payload);
    return normalizePayment(response.data);
  },

  getPaymentById: async (paymentId: string): Promise<Payment> => {
    const response = await api.get(`/payments/${paymentId}`);
    return normalizePayment(response.data);
  },

  getPaymentByOrderId: async (orderId: string): Promise<Payment | null> => {
    try {
      const response = await api.get(`/payments/order/${orderId}`);
      if (!response.data || Object.keys(response.data).length === 0) {
        return null;
      }
      return normalizePayment(response.data);
    } catch (error: any) {
      if (error.response?.status === 404) {
        return null; // Return null gracefully for 404
      }
      throw error;
    }
  },

  confirmPayment: async (paymentId: string): Promise<Payment> => {
    const response = await api.post(`/payments/${paymentId}/confirm`);
    return normalizePayment(response.data);
  },

  failPayment: async (paymentId: string): Promise<Payment> => {
    const response = await api.post(`/payments/${paymentId}/fail`);
    return normalizePayment(response.data);
  }
};
