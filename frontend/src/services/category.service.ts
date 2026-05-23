import { api } from '@/lib/api';
import { Category, CategoryRaw, normalizeCategory } from '@/types/category';

export const categoryService = {
  async getCategories(): Promise<Category[]> {
    const response = await api.get<CategoryRaw[]>('/categories');
    const rawCategories = Array.isArray(response.data) ? response.data : [];
    return rawCategories.map(normalizeCategory);
  },
};
