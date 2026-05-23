export interface CartItem {
  id: string; // Internal item ID in the cart
  productId: string;
  productName?: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
}

export interface Cart {
  id: string; // Cart ID
  userId: string;
  items: CartItem[];
  total: number;
}
