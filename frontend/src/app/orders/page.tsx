'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { useQuery } from '@tanstack/react-query';
import { orderService } from '@/services/order.service';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { AlertCircle, Package, ArrowRight, Calendar } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';

export default function OrdersPage() {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();
  const [isClient, setIsClient] = useState(false);

  const { data: orders, isLoading, isError } = useQuery({
    queryKey: ['orders'],
    queryFn: orderService.getMyOrders,
    enabled: isAuthenticated,
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

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-5xl space-y-6">
        <Skeleton className="h-10 w-48 mb-8" />
        {[1, 2, 3].map(i => (
          <Skeleton key={i} className="h-24 w-full rounded-xl" />
        ))}
      </div>
    );
  }

  if (isError) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-5xl">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>
            No pudimos cargar tus órdenes. Intenta de nuevo más tarde.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  const isEmpty = !orders || orders.length === 0;

  if (isEmpty) {
    return (
      <div className="container mx-auto px-4 py-16 max-w-4xl text-center">
        <div className="flex flex-col items-center justify-center space-y-6">
          <div className="h-24 w-24 bg-muted rounded-full flex items-center justify-center">
            <Package className="h-12 w-12 text-muted-foreground" />
          </div>
          <h2 className="text-2xl font-bold tracking-tight">No tienes órdenes aún</h2>
          <p className="text-muted-foreground max-w-sm">
            Cuando realices una compra, tu historial de órdenes aparecerá aquí.
          </p>
          <Link href="/products">
            <Button size="lg" className="mt-4">
              Explorar productos
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl">
      <h1 className="text-3xl font-bold tracking-tight mb-8">Mis Órdenes</h1>
      
      <div className="space-y-4">
        {orders.map(order => {
          const date = new Date(order.createdAt).toLocaleDateString();
          return (
            <div key={order.id} className="border rounded-xl p-4 sm:p-6 bg-card flex flex-col sm:flex-row gap-4 sm:items-center justify-between hover:shadow-md transition-shadow">
              <div className="space-y-2 flex-grow">
                <div className="flex items-center gap-3">
                  <h3 className="font-semibold">Orden #{order.id.slice(0, 8)}...</h3>
                  <Badge variant={order.status === 'PENDING' ? 'secondary' : 'default'}>
                    {order.status}
                  </Badge>
                </div>
                <div className="text-sm text-muted-foreground flex items-center gap-4">
                  <span className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    {date}
                  </span>
                  <span>
                    {order.items.length} {order.items.length === 1 ? 'ítem' : 'ítems'}
                  </span>
                </div>
              </div>
              
              <div className="flex items-center justify-between sm:flex-col sm:items-end gap-3 sm:gap-2 border-t sm:border-t-0 pt-4 sm:pt-0">
                <div className="font-bold text-lg">
                  ${order.total.toFixed(2)}
                </div>
                <Link href={`/orders/${order.id}`}>
                  <Button variant="outline" size="sm" className="gap-2">
                    Ver detalle
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
