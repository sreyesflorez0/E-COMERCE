'use client';

import { useQuery } from '@tanstack/react-query';
import { useParams, useRouter } from 'next/navigation';
import { productService } from '@/services/product.service';
import { categoryService } from '@/services/category.service';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { AlertCircle, ShoppingCart, ArrowLeft, Package, CheckCircle2 } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useCart } from '@/hooks/useCart';
import { useAuthStore } from '@/store/authStore';
import { toast } from 'sonner';

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const { isAuthenticated } = useAuthStore();
  const { addItem, isAdding } = useCart();

  const { data: product, isLoading: isLoadingProduct, error: errorProduct } = useQuery({
    queryKey: ['product', id],
    queryFn: () => productService.getProductById(id),
    enabled: !!id,
  });

  const { data: categories } = useQuery({
    queryKey: ['categories'],
    queryFn: () => categoryService.getCategories(),
  });

  if (isLoadingProduct) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-5xl">
        <Skeleton className="h-10 w-32 mb-8" />
        <div className="grid md:grid-cols-2 gap-10">
          <Skeleton className="aspect-square w-full rounded-2xl" />
          <div className="space-y-6">
            <Skeleton className="h-12 w-3/4" />
            <Skeleton className="h-8 w-1/4" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-2/3" />
            <Skeleton className="h-14 w-full mt-8" />
          </div>
        </div>
      </div>
    );
  }

  if (errorProduct || !product) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-3xl">
        <Button variant="ghost" onClick={() => router.back()} className="mb-6">
          <ArrowLeft className="mr-2 h-4 w-4" /> Volver
        </Button>
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>
            No pudimos cargar los detalles de este producto. Es posible que no exista o haya un problema de conexión.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  const category = categories?.find(c => c.id === product.categoryId);

  const handleAddToCart = async () => {
    if (!isAuthenticated) {
      toast.info('Inicia sesión para agregar productos');
      router.push('/login');
      return;
    }

    if (product.stock <= 0) {
      toast.error('Este producto está agotado');
      return;
    }

    try {
      await addItem({ productId: product.id, quantity: 1 });
      toast.success('Producto agregado al carrito');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Error al agregar producto');
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl">
      <Button variant="ghost" onClick={() => router.back()} className="mb-8">
        <ArrowLeft className="mr-2 h-4 w-4" /> Volver al catálogo
      </Button>

      <div className="grid md:grid-cols-2 gap-10 lg:gap-16">
        {/* Product Image Area */}
        <div className="bg-muted rounded-2xl aspect-square overflow-hidden border flex items-center justify-center relative">
          {product.imageUrl ? (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img 
              src={product.imageUrl} 
              alt={product.name}
              className="object-cover w-full h-full"
            />
          ) : (
            <Package className="h-32 w-32 text-muted-foreground/30" />
          )}
          {!product.active && (
            <div className="absolute inset-0 bg-background/80 flex items-center justify-center backdrop-blur-sm">
              <Badge variant="destructive" className="text-lg px-4 py-1">No disponible</Badge>
            </div>
          )}
        </div>

        {/* Product Info Area */}
        <div className="flex flex-col">
          <div className="space-y-4 mb-6">
            {category && (
              <Badge variant="outline" className="text-sm">
                {category.name}
              </Badge>
            )}
            <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">{product.name}</h1>
            <div className="text-3xl font-bold text-primary">
              ${product.price.toFixed(2)}
            </div>
          </div>

          <div className="prose prose-sm sm:prose-base dark:prose-invert text-muted-foreground mb-8">
            <p>{product.description || "Sin descripción detallada."}</p>
          </div>

          <div className="space-y-4 mb-8">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-green-500" />
              <span className="font-medium text-sm">
                {product.stock > 0 ? `${product.stock} disponibles en stock` : 'Agotado'}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div className={`h-2.5 w-2.5 rounded-full ${product.active ? 'bg-green-500' : 'bg-red-500'}`} />
              <span className="text-sm text-muted-foreground">
                Estado: {product.active ? 'Activo' : 'Inactivo'}
              </span>
            </div>
          </div>

          <div className="mt-auto pt-6 border-t">
            <Button 
              size="lg" 
              className="w-full h-14 text-lg" 
              onClick={handleAddToCart}
              disabled={isAdding || product.stock <= 0 || !product.active}
            >
              <ShoppingCart className="mr-2 h-5 w-5" />
              {product.stock > 0 ? 'Agregar al carrito' : 'Agotado'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
