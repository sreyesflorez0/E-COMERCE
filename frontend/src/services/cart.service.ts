import { api } from '@/lib/api';
import { Cart, CartItem } from '@/types/cart';

// Normalize cart response from backend
const normalizeCart = (data: any): Cart => {
  if (!data) {
    return { id: '', userId: '', items: [], total: 0 };
  }

  const items: CartItem[] = (data.items || []).map((item: any) => {
    const rawUnitPrice = item.unitPrice ?? item.unit_price ?? 0;
    const unitPrice = parseFloat(String(rawUnitPrice)) || 0;
    const quantity = parseInt(String(item.quantity || 0), 10) || 0;
    
    const rawSubtotal = item.subtotal ?? (quantity * unitPrice);
    const subtotal = parseFloat(String(rawSubtotal)) || 0;

    return {
      id: item.id || item.item_id || '',
      productId: item.productId || item.product_id || '',
      productName: item.productName || item.product_name || '',
      quantity,
      unitPrice,
      subtotal,
    };
  });

  const rawTotal = data.total ?? items.reduce((acc: number, item: CartItem) => acc + item.subtotal, 0);
  const total = parseFloat(String(rawTotal)) || 0;

  return {
    id: data.id || data.cart_id || '',
    userId: data.userId || data.user_id || '',
    items,
    total,
  };
};

export const cartService = {
  async getCart(): Promise<Cart> {
    const { data } = await api.get('/cart');
    return normalizeCart(data);
  },

  async addItem(productId: string, quantity: number = 1): Promise<Cart> {
    const { data } = await api.post('/cart/items', { 
      productId: productId,
      product_id: productId, // Send both to be safe depending on API
      quantity 
    });
    return normalizeCart(data);
  },

  async updateItem(itemId: string, quantity: number): Promise<Cart> {
    const { data } = await api.put(`/cart/items/${itemId}`, { quantity });
    return normalizeCart(data);
  },

  async removeItem(itemId: string): Promise<Cart> {
    const { data } = await api.delete(`/cart/items/${itemId}`);
    return normalizeCart(data);
  },

  async clearCart(): Promise<void> {
    await api.delete('/cart');
  }
};
