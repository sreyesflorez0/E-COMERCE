import { ProductRaw, Product, normalizeProduct } from './product';

export interface RecommendationRaw {
  product?: ProductRaw;
  reason?: string;
  score?: number;
}

export interface Recommendation {
  product: Product;
  reason?: string;
  score?: number;
}

export function normalizeRecommendation(raw: RecommendationRaw | ProductRaw): Recommendation {
  // Sometimes recommendations endpoints just return a list of products directly
  // Sometimes they return an object with { product, reason, score }
  
  if ('product' in raw && raw.product) {
    return {
      product: normalizeProduct(raw.product),
      reason: (raw as RecommendationRaw).reason,
      score: (raw as RecommendationRaw).score,
    };
  }

  // If it's just a raw product
  return {
    product: normalizeProduct(raw as ProductRaw),
    reason: 'Recomendado', // fallback reason
  };
}
