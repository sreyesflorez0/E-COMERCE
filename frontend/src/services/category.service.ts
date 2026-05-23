import { api } from '@/lib/api';
import { Category, CategoryRaw, normalizeCategory } from '@/types/category';

export const categoryService = {
  async getCategories(): Promise<Category[]> {
    const response = await api.get<CategoryRaw[]>('/categories');
    const rawCategories = Array.isArray(response.data) ? response.data : [];
    return rawCategories.map(normalizeCategory);
  },
  
  async createCategory(data: { name: string; description?: string }): Promise<Category> {
    const response = await api.post<CategoryRaw>('/categories', data);
    return normalizeCategory(response.data);
  },

  async updateCategory(id: string, data: { name: string; description?: string }): Promise<Category> {
    const response = await api.put<CategoryRaw>(`/categories/${id}`, data);
    return normalizeCategory(response.data);
  },

  async deleteCategory(id: string): Promise<void> {
    await api.delete(`/categories/${id}`);
  }
};
