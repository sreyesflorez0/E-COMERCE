'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { orderService } from '@/services/order.service';
import { paymentService } from '@/services/payment.service';
import { PaymentMethod } from '@/types/payment';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { AlertCircle, ArrowLeft, Package, MapPin, Calendar, CreditCard, CheckCircle2 } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';

export default function OrderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const orderId = params.id as string;
  const { isAuthenticated } = useAuthStore();
  const [isClient, setIsClient] = useState(false);

  const queryClient = useQueryClient();
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('CARD');

  const { data: order, isLoading, isError } = useQuery({
    queryKey: ['order', orderId],
    queryFn: () => orderService.getOrderById(orderId),
    enabled: isAuthenticated && !!orderId,
  });

  const { data: payment, isLoading: isPaymentLoading } = useQuery({
    queryKey: ['paymentByOrder', orderId],
    queryFn: () => paymentService.getPaymentByOrderId(orderId),
    enabled: isAuthenticated && !!orderId,
  });

  const createPaymentMutation = useMutation({
    mutationFn: () => paymentService.createPayment({
      order_id: orderId,
      amount: typeof order!.total === 'string' ? parseFloat(order!.total) : Number(order!.total),
      method: paymentMethod
    }),
    onSuccess: (newPayment) => {
      toast.success('Pago creado exitosamente');
      queryClient.invalidateQueries({ queryKey: ['paymentByOrder', orderId] });
      queryClient.invalidateQueries({ queryKey: ['payments'] });
      router.push(`/payments/${newPayment.id}`);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Error al crear el pago');
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

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-5xl space-y-6">
        <Skeleton className="h-10 w-32 mb-8" />
        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <Skeleton className="h-48 w-full rounded-xl" />
            <Skeleton className="h-64 w-full rounded-xl" />
          </div>
          <Skeleton className="h-80 w-full rounded-xl" />
        </div>
      </div>
    );
  }

  if (isError || !order) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-3xl">
        <Button variant="ghost" onClick={() => router.push('/orders')} className="mb-6">
          <ArrowLeft className="mr-2 h-4 w-4" /> Volver a mis órdenes
        </Button>
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>
            No pudimos cargar los detalles de esta orden.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  const date = new Date(order.createdAt).toLocaleString();

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl">
      <Button variant="ghost" onClick={() => router.push('/orders')} className="mb-8">
        <ArrowLeft className="mr-2 h-4 w-4" /> Volver a mis órdenes
      </Button>

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Detalle de Orden</h1>
          <p className="text-muted-foreground mt-1 break-all">ID: {order.id}</p>
        </div>
        <div className="flex gap-2">
          <Badge variant={order.status === 'PENDING' ? 'secondary' : 'default'} className="text-sm px-3 py-1">
            {order.status}
          </Badge>
        </div>
      </div>
      
      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          
          <div className="border rounded-xl p-6 bg-card">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Package className="h-5 w-5 text-muted-foreground" />
              Productos
            </h2>
            <div className="space-y-4">
              {order.items.map((item) => (
                <div key={item.id} className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 py-3 border-b last:border-0 last:pb-0">
                  <div>
                    <h3 className="font-medium text-base line-clamp-1">
                      {item.productName || `Producto #${item.productId}`}
                    </h3>
                    <p className="text-muted-foreground text-sm mt-1">
                      Cantidad: {item.quantity} × ${item.unitPrice.toFixed(2)}
                    </p>
                  </div>
                  <div className="font-bold whitespace-nowrap">
                    ${item.subtotal.toFixed(2)}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="border rounded-xl p-6 bg-card">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <MapPin className="h-5 w-5 text-muted-foreground" />
              Dirección de Envío
            </h2>
            <p className="text-muted-foreground whitespace-pre-line">
              {order.shippingAddress}
            </p>
          </div>
          
        </div>

        <div className="lg:col-span-1">
          <div className="border rounded-xl p-6 bg-card sticky top-24 space-y-6">
            
            <div>
              <h2 className="text-lg font-semibold mb-4">Resumen</h2>
              <div className="space-y-3 text-sm">
                <div className="flex items-center gap-2 text-muted-foreground mb-4">
                  <Calendar className="h-4 w-4" />
                  <span>{date}</span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Subtotal ({order.items.length} items)</span>
                  <span>${order.total.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Envío</span>
                  <span className="text-green-600">Gratis</span>
                </div>
                <div className="border-t pt-3 flex justify-between font-bold text-lg">
                  <span>Total</span>
                  <span>${order.total.toFixed(2)}</span>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t">
              {isPaymentLoading ? (
                <Skeleton className="h-10 w-full" />
              ) : payment ? (
                <div className="space-y-4">
                  <div className="p-3 bg-muted rounded-lg space-y-2">
                    <p className="text-sm font-medium">Estado del Pago</p>
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-muted-foreground">{payment.method}</span>
                      <Badge variant={payment.status === 'COMPLETED' ? 'default' : payment.status === 'FAILED' ? 'destructive' : 'secondary'} className={payment.status === 'COMPLETED' ? 'bg-green-500 hover:bg-green-600' : ''}>
                        {payment.status}
                      </Badge>
                    </div>
                  </div>
                  <Button 
                    className="w-full" 
                    size="lg"
                    onClick={() => router.push(`/payments/${payment.id}`)}
                  >
                    Ver detalles del pago
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Método de pago</label>
                    <select 
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                      value={paymentMethod}
                      onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
                      disabled={createPaymentMutation.isPending}
                    >
                      <option value="CARD">Tarjeta de Crédito / Débito</option>
                      <option value="CASH">Efectivo</option>
                      <option value="TRANSFER">Transferencia Bancaria</option>
                      <option value="PSE">PSE</option>
                    </select>
                  </div>
                  <Button 
                    className="w-full" 
                    size="lg"
                    onClick={() => createPaymentMutation.mutate()}
                    disabled={createPaymentMutation.isPending}
                  >
                    <CreditCard className="mr-2 h-5 w-5" />
                    {createPaymentMutation.isPending ? 'Procesando...' : 'Crear pago'}
                  </Button>
                </div>
              )}
            </div>
            
          </div>
        </div>
      </div>
    </div>
  );
}
