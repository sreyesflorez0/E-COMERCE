import { api } from '@/lib/api';
import { AdminOrder } from '@/types/admin-order';

export const adminOrderService = {
  async getOrders(): Promise<AdminOrder[]> {
    const response = await api.get<AdminOrder[]>('/orders/admin/orders');
    return response.data;
  },

  async getOrderById(id: string): Promise<AdminOrder> {
    const response = await api.get<AdminOrder>(`/orders/${id}`);
    return response.data;
  },

  async updateOrderStatus(id: string, status: string): Promise<AdminOrder> {
    const response = await api.patch<AdminOrder>(`/orders/${id}/status`, { status });
    return response.data;
  }
};
