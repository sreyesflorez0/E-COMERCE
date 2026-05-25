'use client';

import { useState } from 'react';
import { useAuthStore } from '@/store/authStore';
import { useMutation } from '@tanstack/react-query';
import { recommendationService } from '@/services/recommendation.service';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ProductCard } from '@/components/products/ProductCard';
import { Sparkles, AlertCircle, Loader2 } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

export function AIRecommendationSearch() {
  const { isAuthenticated } = useAuthStore();
  const [query, setQuery] = useState('');
  
  const searchMutation = useMutation({
    mutationFn: (searchQuery: string) => recommendationService.searchRecommendations(searchQuery, 5),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    searchMutation.mutate(query);
  };

  if (!isAuthenticated) {
    return (
      <Alert className="bg-primary/5 border-primary/20">
        <Sparkles className="h-4 w-4 text-primary" />
        <AlertTitle className="text-primary font-semibold">Búsqueda Inteligente IA</AlertTitle>
        <AlertDescription className="text-muted-foreground mt-2">
          Inicia sesión para usar recomendaciones inteligentes y encontrar exactamente lo que buscas con lenguaje natural.
        </AlertDescription>
      </Alert>
    );
  }

  // Handle specific 401 from mutation
  const isUnauthorized = searchMutation.error && (searchMutation.error as { response?: { status?: number } }).response?.status === 401;

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-transparent p-6 rounded-2xl border border-primary/10">
        <div className="flex items-center gap-2 mb-4">
          <Sparkles className="h-5 w-5 text-primary" />
          <h3 className="text-lg font-semibold tracking-tight text-primary">Búsqueda Inteligente</h3>
        </div>
        
        <form onSubmit={handleSubmit} className="flex gap-3">
          <Input 
            type="text"
            placeholder="Ej: quiero un portátil barato para estudiar..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="flex-grow bg-background"
            disabled={searchMutation.isPending}
          />
          <Button type="submit" disabled={searchMutation.isPending || !query.trim()}>
            {searchMutation.isPending ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Sparkles className="mr-2 h-4 w-4" />
            )}
            Buscar
          </Button>
        </form>
      </div>

      {isUnauthorized && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Sesión Expirada</AlertTitle>
          <AlertDescription>
            Inicia sesión para usar recomendaciones inteligentes.
          </AlertDescription>
        </Alert>
      )}

      {searchMutation.error && !isUnauthorized && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>
            Hubo un problema procesando tu búsqueda inteligente. Por favor intenta de nuevo.
          </AlertDescription>
        </Alert>
      )}

      {searchMutation.isSuccess && searchMutation.data.length === 0 && (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Sin resultados</AlertTitle>
          <AlertDescription>
            No encontramos recomendaciones para tu búsqueda. Intenta con otras palabras.
          </AlertDescription>
        </Alert>
      )}

      {searchMutation.isSuccess && searchMutation.data.length > 0 && (
        <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <h4 className="font-semibold text-lg">Resultados sugeridos:</h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {searchMutation.data.map((rec) => (
              <ProductCard 
                key={rec.product.id} 
                product={rec.product} 
                reason={rec.reason} 
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
