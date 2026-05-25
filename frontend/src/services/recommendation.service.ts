import { api } from '@/lib/api';
import { Recommendation, RecommendationRaw, normalizeRecommendation } from '@/types/recommendation';

export const recommendationService = {
  async getTrending(): Promise<Recommendation[]> {
    const response = await api.get<any>('/recommendations/trending');
    
    let rawData: any[] = [];
    if (Array.isArray(response.data)) {
      rawData = response.data;
    } else if (response.data && Array.isArray(response.data.recommendations)) {
      rawData = response.data.recommendations;
    }
    
    // Normalize products and filter out inactive/out-of-stock from recommendations as well
    return rawData
      .map((raw: any) => normalizeRecommendation(raw))
      .filter(rec => rec.product.active && rec.product.stock > 0);
  },

  async searchRecommendations(query: string, max_results: number = 5): Promise<Recommendation[]> {
    const response = await api.post<any>('/recommendations/search', {
      query,
      max_results
    });
    
    console.log("AI recommendations response", response.data);
    
    let rawData: any[] = [];
    if (Array.isArray(response.data)) {
      rawData = response.data;
    } else if (response.data && Array.isArray(response.data.recommendations)) {
      rawData = response.data.recommendations;
    }
    
    return rawData
      .map((raw: any) => normalizeRecommendation(raw))
      .filter(rec => rec.product.active && rec.product.stock > 0);
  }
};
