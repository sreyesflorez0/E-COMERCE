'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { useCart } from '@/hooks/useCart';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { AlertCircle, ShoppingCart, MapPin, CheckCircle2 } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { toast } from 'sonner';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { orderService } from '@/services/order.service';

const checkoutSchema = z.object({
  shippingAddress: z.string().min(5, { message: 'La dirección de envío debe tener al menos 5 caracteres' }),
});

type CheckoutFormValues = z.infer<typeof checkoutSchema>;

export default function CheckoutPage() {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();
  const { cart, isLoading: isCartLoading, clearCart } = useCart();
  const [isClient, setIsClient] = useState(false);
  const queryClient = useQueryClient();

  const { register, handleSubmit, formState: { errors } } = useForm<CheckoutFormValues>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      shippingAddress: '',
    },
  });

  const createOrderMutation = useMutation({
    mutationFn: orderService.createOrder,
    onSuccess: async (data) => {
      // Order created successfully
      toast.success('Orden creada exitosamente');
      
      // We must clear the cart locally or via API. Let's do API first.
      try {
        await clearCart();
      } catch (e) {
        // Silently fail if clear cart errors out but order was created
      }

      // Invalidate queries
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      
      // Redirect to order details
      router.push(`/orders/${data.id}`);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Error al crear la orden. Intenta nuevamente.');
    }
  });

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (isClient && !isAuthenticated) {
      router.push('/login');
    }
  }, [isClient, isAuthenticated, router]);

  if (!isClient || !isAuthenticated) {
    return null;
  }

  if (isCartLoading) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl space-y-6">
        <Skeleton className="h-10 w-48 mb-8" />
        <div className="grid lg:grid-cols-2 gap-8">
          <Skeleton className="h-64 w-full rounded-xl" />
          <Skeleton className="h-64 w-full rounded-xl" />
        </div>
      </div>
    );
  }

  const isEmpty = !cart || !cart.items || cart.items.length === 0;

  if (isEmpty) {
    return (
      <div className="container mx-auto px-4 py-16 max-w-4xl text-center">
        <div className="flex flex-col items-center justify-center space-y-6">
          <div className="h-24 w-24 bg-muted rounded-full flex items-center justify-center">
            <AlertCircle className="h-12 w-12 text-destructive" />
          </div>
          <h2 className="text-2xl font-bold tracking-tight">Tu carrito está vacío</h2>
          <p className="text-muted-foreground max-w-sm">
            No puedes proceder al checkout sin productos.
          </p>
          <Button size="lg" className="mt-4" onClick={() => router.push('/products')}>
            Volver a la tienda
          </Button>
        </div>
      </div>
    );
  }

  const onSubmit = (data: CheckoutFormValues) => {
    if (isEmpty) return;

    const payload = {
      shipping_address: data.shippingAddress,
      items: cart.items.map(item => ({
        product_id: item.productId,
        quantity: item.quantity,
        unit_price: item.unitPrice,
      })),
    };

    createOrderMutation.mutate(payload);
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <h1 className="text-3xl font-bold tracking-tight mb-8">Checkout</h1>
      
      <div className="grid lg:grid-cols-2 gap-10">
        
        {/* Formulario */}
        <div className="order-2 lg:order-1">
          <div className="border rounded-xl p-6 bg-card">
            <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              Dirección de Envío
            </h2>
            
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div className="space-y-2">
                <label htmlFor="shippingAddress" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                  Dirección completa
                </label>
                <textarea
                  id="shippingAddress"
                  className="flex min-h-[80px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                  placeholder="Ej. Av. Siempre Viva 123, Ciudad, País"
                  {...register('shippingAddress')}
                />
                {errors.shippingAddress && (
                  <p className="text-sm font-medium text-destructive">{errors.shippingAddress.message}</p>
                )}
              </div>

              <div className="pt-4 border-t">
                <Button 
                  type="submit" 
                  className="w-full" 
                  size="lg"
                  disabled={createOrderMutation.isPending}
                >
                  {createOrderMutation.isPending ? 'Procesando...' : 'Confirmar y Crear Orden'}
                </Button>
                <p className="text-xs text-center text-muted-foreground mt-4">
                  El pago de la orden estará habilitado en la Fase 5.
                </p>
              </div>
            </form>
          </div>
        </div>

        {/* Resumen */}
        <div className="order-1 lg:order-2">
          <div className="border rounded-xl p-6 bg-muted/30 sticky top-24">
            <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
              <ShoppingCart className="h-5 w-5" />
              Resumen del Pedido
            </h2>
            
            <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2 mb-6">
              {cart.items.map((item) => (
                <div key={item.id} className="flex justify-between items-start text-sm">
                  <div className="flex gap-2">
                    <span className="font-medium">{item.quantity}x</span>
                    <span className="text-muted-foreground line-clamp-2">{item.productName || `Producto #${item.productId}`}</span>
                  </div>
                  <span className="font-medium whitespace-nowrap ml-4">${item.subtotal.toFixed(2)}</span>
                </div>
              ))}
            </div>
            
            <div className="space-y-4 text-sm border-t pt-4">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Subtotal</span>
                <span>${cart.total.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Envío</span>
                <span className="text-green-600 font-medium">Gratis</span>
              </div>
              <div className="flex justify-between font-bold text-lg pt-2 border-t">
                <span>Total</span>
                <span>${cart.total.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
