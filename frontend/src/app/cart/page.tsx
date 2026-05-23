'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { useCart } from '@/hooks/useCart';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { AlertCircle, Trash2, ShoppingCart, Minus, Plus, ShoppingBag } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { toast } from 'sonner';
import Link from 'next/link';

export default function CartPage() {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();
  const { cart, isLoading, isError, updateItem, removeItem, clearCart, isUpdating, isRemoving, isClearing } = useCart();
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (isClient && !isAuthenticated) {
      router.push('/login');
    }
  }, [isClient, isAuthenticated, router]);

  if (!isClient || !isAuthenticated) {
    return null; // Return null to avoid hydration errors or flashing content before redirect
  }

  const handleUpdateQuantity = async (itemId: string, currentQuantity: number, delta: number) => {
    const newQuantity = currentQuantity + delta;
    
    try {
      if (newQuantity <= 0) {
        await removeItem(itemId);
        toast.success('Producto eliminado del carrito');
      } else {
        await updateItem({ itemId, quantity: newQuantity });
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Error al actualizar cantidad. Verifica el stock.');
    }
  };

  const handleRemoveItem = async (itemId: string) => {
    try {
      await removeItem(itemId);
      toast.success('Producto eliminado del carrito');
    } catch (error) {
      toast.error('Error al eliminar producto');
    }
  };

  const handleClearCart = async () => {
    if (!confirm('¿Estás seguro de que quieres vaciar tu carrito?')) return;
    
    try {
      await clearCart();
      toast.success('Carrito vaciado');
    } catch (error) {
      toast.error('Error al vaciar carrito');
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl space-y-6">
        <Skeleton className="h-10 w-48 mb-8" />
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-24 w-full rounded-xl" />
        ))}
        <Skeleton className="h-32 w-full rounded-xl mt-8" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>
            No pudimos cargar tu carrito. Intenta de nuevo más tarde.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  const isEmpty = !cart || !cart.items || cart.items.length === 0;

  if (isEmpty) {
    return (
      <div className="container mx-auto px-4 py-16 max-w-4xl text-center">
        <div className="flex flex-col items-center justify-center space-y-6">
          <div className="h-24 w-24 bg-muted rounded-full flex items-center justify-center">
            <ShoppingCart className="h-12 w-12 text-muted-foreground" />
          </div>
          <h2 className="text-2xl font-bold tracking-tight">Tu carrito está vacío</h2>
          <p className="text-muted-foreground max-w-sm">
            Parece que aún no has agregado nada a tu carrito de compras.
          </p>
          <Link href="/products">
            <Button size="lg" className="mt-4">
              <ShoppingBag className="mr-2 h-4 w-4" />
              Explorar productos
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl">
      <h1 className="text-3xl font-bold tracking-tight mb-8">Tu Carrito</h1>
      
      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-4">
          <div className="flex justify-between items-center pb-4 border-b">
            <h2 className="text-xl font-semibold">{cart.items.length} {cart.items.length === 1 ? 'Producto' : 'Productos'}</h2>
            <Button 
              variant="ghost" 
              className="text-destructive hover:text-destructive hover:bg-destructive/10"
              onClick={handleClearCart}
              disabled={isClearing || isUpdating || isRemoving}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Vaciar carrito
            </Button>
          </div>

          <div className="space-y-4">
            {cart.items.map((item) => (
              <div key={item.id} className="flex flex-col sm:flex-row gap-4 p-4 border rounded-xl bg-card">
                <div className="flex-grow flex flex-col justify-between">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-medium text-lg leading-tight line-clamp-2">
                        {item.productName || `Producto #${item.productId}`}
                      </h3>
                      <p className="text-muted-foreground text-sm mt-1">Precio unitario: ${item.unitPrice.toFixed(2)}</p>
                    </div>
                    <div className="text-right ml-4">
                      <p className="font-bold text-lg">${item.subtotal.toFixed(2)}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between mt-4">
                    <div className="flex items-center gap-3 border rounded-md px-2 py-1 bg-background">
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-6 w-6 rounded-none hover:bg-transparent"
                        onClick={() => handleUpdateQuantity(item.id, item.quantity, -1)}
                        disabled={isUpdating || isRemoving}
                      >
                        <Minus className="h-3 w-3" />
                      </Button>
                      <span className="w-6 text-center text-sm font-medium">{item.quantity}</span>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-6 w-6 rounded-none hover:bg-transparent"
                        onClick={() => handleUpdateQuantity(item.id, item.quantity, 1)}
                        disabled={isUpdating || isRemoving}
                      >
                        <Plus className="h-3 w-3" />
                      </Button>
                    </div>
                    
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="text-muted-foreground hover:text-destructive"
                      onClick={() => handleRemoveItem(item.id)}
                      disabled={isRemoving}
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      <span className="hidden sm:inline">Eliminar</span>
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="lg:col-span-1">
          <div className="border rounded-xl p-6 bg-card sticky top-24">
            <h2 className="text-xl font-semibold mb-6">Resumen</h2>
            
            <div className="space-y-4 mb-6 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Subtotal ({cart.items.length} items)</span>
                <span>${cart.total.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Envío</span>
                <span>Calculado en checkout</span>
              </div>
              <div className="border-t pt-4 flex justify-between font-bold text-lg">
                <span>Total</span>
                <span>${cart.total.toFixed(2)}</span>
              </div>
            </div>
            
            <Link href="/checkout" className="w-full block">
              <Button 
                className="w-full" 
                size="lg"
              >
                Continuar al checkout
              </Button>
            </Link>
            <p className="text-xs text-center text-muted-foreground mt-4">
              El pago se realizará en una fase posterior.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
