import { api } from '@/lib/api';
import { Order, OrderItem, CreateOrderPayload } from '@/types/order';

// Normalize order response
export const normalizeOrder = (data: any): Order => {
  if (!data) {
    return { id: '', userId: '', status: '', total: 0, shippingAddress: '', createdAt: '', items: [] };
  }

  const items: OrderItem[] = (data.items || data.order_items || []).map((item: any) => {
    const rawUnitPrice = item.unitPrice ?? item.unit_price ?? 0;
    const unitPrice = parseFloat(String(rawUnitPrice)) || 0;
    const quantity = parseInt(String(item.quantity || 0), 10) || 0;
    const rawSubtotal = item.subtotal ?? (quantity * unitPrice);
    const subtotal = parseFloat(String(rawSubtotal)) || 0;

    return {
      id: String(item.id || item.item_id || ''),
      orderId: String(item.orderId || item.order_id || ''),
      productId: String(item.productId || item.product_id || ''),
      productName: item.productName || item.product_name || '',
      quantity,
      unitPrice,
      subtotal,
    };
  });

  const rawTotal = data.total ?? items.reduce((acc: number, item: OrderItem) => acc + item.subtotal, 0);
  const total = parseFloat(String(rawTotal)) || 0;

  return {
    id: String(data.id || data.order_id || ''),
    userId: String(data.userId || data.user_id || ''),
    status: data.status || 'PENDING',
    total,
    shippingAddress: data.shippingAddress || data.shipping_address || '',
    createdAt: data.createdAt || data.created_at || new Date().toISOString(),
    items,
  };
};

export const orderService = {
  async createOrder(payload: CreateOrderPayload): Promise<Order> {
    const { data } = await api.post('/orders', payload);
    return normalizeOrder(data);
  },

  async getMyOrders(): Promise<Order[]> {
    const { data } = await api.get('/orders/my-orders');
    const rawOrders = Array.isArray(data) ? data : [];
    return rawOrders.map(normalizeOrder);
  },

  async getOrderById(orderId: string): Promise<Order> {
    const { data } = await api.get(`/orders/${orderId}`);
    return normalizeOrder(data);
  },
};
