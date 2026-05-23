import { api } from '@/lib/api';
import { Recommendation, RecommendationRaw, normalizeRecommendation } from '@/types/recommendation';

export const recommendationService = {
  async getTrending(): Promise<Recommendation[]> {
    const response = await api.get<RecommendationRaw[] | unknown[]>('/recommendations/trending');
    const rawData = Array.isArray(response.data) ? response.data : [];
    
    // Normalize products and filter out inactive/out-of-stock from recommendations as well
    return rawData
      .map((raw: any) => normalizeRecommendation(raw))
      .filter(rec => rec.product.active && rec.product.stock > 0);
  },

  async searchRecommendations(query: string, max_results: number = 5): Promise<Recommendation[]> {
    const response = await api.post<RecommendationRaw[] | unknown[]>('/recommendations/search', {
      query,
      max_results
    });
    
    const rawData = Array.isArray(response.data) ? response.data : [];
    
    return rawData
      .map((raw: any) => normalizeRecommendation(raw))
      .filter(rec => rec.product.active && rec.product.stock > 0);
  }
};
