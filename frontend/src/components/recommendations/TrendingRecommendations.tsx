'use client';

import { useQuery } from '@tanstack/react-query';
import { recommendationService } from '@/services/recommendation.service';
import { ProductCard } from '@/components/products/ProductCard';
import { Skeleton } from '@/components/ui/skeleton';
import { AlertCircle, Flame } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

export function TrendingRecommendations() {
  const { data: recommendations, isLoading, error } = useQuery({
    queryKey: ['recommendations', 'trending'],
    queryFn: () => recommendationService.getTrending(),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-2 text-2xl font-bold tracking-tight">
          <Flame className="h-6 w-6 text-orange-500" />
          <h2>Recomendados para ti</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="space-y-4">
              <Skeleton className="h-[200px] w-full rounded-xl" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
              <Skeleton className="h-10 w-full mt-4" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>
          No pudimos cargar las recomendaciones en este momento.
        </AlertDescription>
      </Alert>
    );
  }

  if (!recommendations || recommendations.length === 0) {
    return null; // Don't show the section if no trending products are available
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 text-2xl font-bold tracking-tight">
        <Flame className="h-6 w-6 text-orange-500" />
        <h2>Recomendados para ti</h2>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {recommendations.slice(0, 4).map((rec) => (
          <ProductCard 
            key={rec.product.id} 
            product={rec.product} 
            reason={rec.reason} 
          />
        ))}
      </div>
    </div>
  );
}
