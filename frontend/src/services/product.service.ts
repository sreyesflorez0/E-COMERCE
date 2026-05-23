import { api } from '@/lib/api';
import { Product, ProductRaw, normalizeProduct } from '@/types/product';

export const productService = {
  async getProducts(): Promise<Product[]> {
    const response = await api.get<ProductRaw[]>('/products');
    // Ensure response.data is an array (fallback to empty array)
    const rawProducts = Array.isArray(response.data) ? response.data : [];
    
    // Normalize and filter active & stock > 0
    return rawProducts
      .map(normalizeProduct)
      .filter((p) => p.active && p.stock > 0);
  },

  async getProductById(id: string): Promise<Product> {
    const response = await api.get<ProductRaw>(`/products/${id}`);
    return normalizeProduct(response.data);
  },
};
