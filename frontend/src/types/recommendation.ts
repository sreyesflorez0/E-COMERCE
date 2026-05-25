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

export function normalizeRecommendation(raw: any): Recommendation {
  // Sometimes recommendations endpoints just return a list of products directly
  // Sometimes they return an object with { product, reason, score }
  
  if ('product' in raw && raw.product) {
    return {
      product: normalizeProduct(raw.product),
      reason: raw.reason,
      score: raw.score,
    };
  }

  // If it's just a raw product or a flattened recommendation { product_id, ..., reason }
  return {
    product: normalizeProduct(raw),
    reason: raw.reason || 'Recomendado', // Use reason if provided, else fallback
    score: raw.score,
  };
}
