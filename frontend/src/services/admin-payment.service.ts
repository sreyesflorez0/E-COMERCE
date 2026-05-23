import { api } from '@/lib/api';
import { AdminPayment } from '@/types/admin-payment';

export const adminPaymentService = {
  async getPayments(): Promise<AdminPayment[]> {
    const response = await api.get<AdminPayment[]>('/payments/admin/payments');
    return response.data;
  },

  async getPaymentById(id: string): Promise<AdminPayment> {
    const response = await api.get<AdminPayment>(`/payments/${id}`);
    return response.data;
  },

  async getPaymentByOrderId(orderId: string): Promise<AdminPayment> {
    const response = await api.get<AdminPayment>(`/payments/order/${orderId}`);
    return response.data;
  }
};
