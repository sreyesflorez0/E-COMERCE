'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Product } from '@/types/product';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ShoppingCart } from 'lucide-react';
import { useCart } from '@/hooks/useCart';
import { useAuthStore } from '@/store/authStore';
import { toast } from 'sonner';

interface ProductCardProps {
  product: Product;
  reason?: string;
}

export function ProductCard({ product, reason }: ProductCardProps) {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();
  const { addItem, isAdding } = useCart();

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
    <Card className="flex flex-col h-full overflow-hidden hover:shadow-lg transition-shadow duration-300">
      {product.imageUrl && (
        <div className="aspect-video w-full overflow-hidden bg-muted">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img 
            src={product.imageUrl} 
            alt={product.name} 
            className="w-full h-full object-cover transition-transform hover:scale-105 duration-300"
          />
        </div>
      )}
      <CardHeader className="flex-none pb-2">
        <div className="flex justify-between items-start gap-2">
          <CardTitle className="text-xl line-clamp-1" title={product.name}>
            {product.name}
          </CardTitle>
          <Badge variant="secondary" className="font-semibold whitespace-nowrap">
            ${product.price.toFixed(2)}
          </Badge>
        </div>
        {reason && (
          <Badge variant="outline" className="mt-2 text-primary w-fit bg-primary/5">
            ✨ {reason}
          </Badge>
        )}
      </CardHeader>
      
      <CardContent className="flex-grow">
        <p className="text-sm text-muted-foreground line-clamp-2" title={product.description}>
          {product.description}
        </p>
        <div className="mt-4 flex gap-2">
          <Badge variant="outline" className="text-xs">
            Stock: {product.stock}
          </Badge>
        </div>
      </CardContent>
      
      <CardFooter className="flex-none flex flex-col gap-2 pt-2">
        <Link href={`/products/${product.id}`} className="w-full">
          <Button variant="outline" className="w-full">
            Ver detalle
          </Button>
        </Link>
        <Button 
          className="w-full" 
          onClick={handleAddToCart}
          disabled={isAdding || product.stock <= 0}
        >
          <ShoppingCart className="mr-2 h-4 w-4" />
          {product.stock > 0 ? 'Agregar al carrito' : 'Agotado'}
        </Button>
      </CardFooter>
    </Card>
  );
}
