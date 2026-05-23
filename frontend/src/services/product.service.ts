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

  async createProduct(data: { name: string; description: string; price: number; stock: number; categoryId: string }): Promise<Product> {
    const payload = {
      ...data,
      category_id: data.categoryId // Ensure we send category_id as some backends expect
    };
    const response = await api.post<ProductRaw>('/products', payload);
    return normalizeProduct(response.data);
  },

  async updateProduct(id: string, data: { name: string; description: string; price: number; stock: number; categoryId: string }): Promise<Product> {
    const payload = {
      ...data,
      category_id: data.categoryId // Ensure we send category_id as some backends expect
    };
    const response = await api.put<ProductRaw>(`/products/${id}`, payload);
    return normalizeProduct(response.data);
  },

  async deleteProduct(id: string): Promise<void> {
    await api.delete(`/products/${id}`);
  }
};
