'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { productService } from '@/services/product.service';
import { categoryService } from '@/services/category.service';
import { ProductCard } from '@/components/products/ProductCard';
import { AIRecommendationSearch } from '@/components/recommendations/AIRecommendationSearch';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { AlertCircle, Search } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

export default function ProductsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const { data: products, isLoading: isLoadingProducts, error: errorProducts } = useQuery({
    queryKey: ['products'],
    queryFn: () => productService.getProducts(),
  });

  const { data: categories, isLoading: isLoadingCategories } = useQuery({
    queryKey: ['categories'],
    queryFn: () => categoryService.getCategories(),
  });

  // Local filtering
  const filteredProducts = products?.filter((product) => {
    const matchesSearch = 
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      product.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = selectedCategory === 'all' || product.categoryId === selectedCategory;
    
    return matchesSearch && matchesCategory;
  }) || [];

  return (
    <div className="space-y-10">
      <div className="flex flex-col gap-4">
        <h1 className="text-4xl font-extrabold tracking-tight">Catálogo de Productos</h1>
        <p className="text-xl text-muted-foreground">
          Explora nuestra colección y encuentra exactamente lo que buscas.
        </p>
      </div>

      <section>
        <AIRecommendationSearch />
      </section>

      <div className="flex flex-col md:flex-row gap-6">
        {/* Sidebar for filters */}
        <aside className="w-full md:w-64 space-y-6 flex-none">
          <div className="space-y-3">
            <h3 className="font-semibold text-lg">Buscar</h3>
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Nombre o descripción..."
                className="pl-9"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-3">
            <h3 className="font-semibold text-lg">Categorías</h3>
            {isLoadingCategories ? (
              <div className="space-y-2">
                <Skeleton className="h-8 w-full" />
                <Skeleton className="h-8 w-full" />
                <Skeleton className="h-8 w-full" />
              </div>
            ) : (
              <div className="flex flex-col gap-1">
                <button
                  onClick={() => setSelectedCategory('all')}
                  className={`text-left px-3 py-2 rounded-md text-sm transition-colors ${
                    selectedCategory === 'all' 
                      ? 'bg-primary text-primary-foreground font-medium' 
                      : 'hover:bg-muted'
                  }`}
                >
                  Todas
                </button>
                {categories?.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedCategory(cat.id)}
                    className={`text-left px-3 py-2 rounded-md text-sm transition-colors ${
                      selectedCategory === cat.id 
                        ? 'bg-primary text-primary-foreground font-medium' 
                        : 'hover:bg-muted'
                    }`}
                  >
                    {cat.name}
                  </button>
                ))}
              </div>
            )}
          </div>
        </aside>

        {/* Main content grid */}
        <div className="flex-1">
          {isLoadingProducts ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="space-y-4">
                  <Skeleton className="h-[200px] w-full rounded-xl" />
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                  <Skeleton className="h-10 w-full mt-4" />
                </div>
              ))}
            </div>
          ) : errorProducts ? (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>
                No pudimos cargar los productos. Por favor, intenta de nuevo más tarde.
              </AlertDescription>
            </Alert>
          ) : filteredProducts.length === 0 ? (
            <div className="text-center py-16 px-4 bg-muted/30 rounded-lg border border-dashed">
              <h3 className="text-xl font-medium mb-2">No hay productos disponibles</h3>
              <p className="text-muted-foreground">
                No encontramos productos que coincidan con tu búsqueda actual.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
