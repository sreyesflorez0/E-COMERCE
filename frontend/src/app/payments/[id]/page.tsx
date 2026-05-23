'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { paymentService } from '@/services/payment.service';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowLeft, CreditCard, Calendar, CheckCircle2, XCircle, AlertCircle, Receipt } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { toast } from 'sonner';

export default function PaymentDetailPage() {
  const params = useParams();
  const router = useRouter();
  const paymentId = params.id as string;
  const { isAuthenticated } = useAuthStore();
  const [isClient, setIsClient] = useState(false);
  const queryClient = useQueryClient();

  const { data: payment, isLoading, isError } = useQuery({
    queryKey: ['payment', paymentId],
    queryFn: () => paymentService.getPaymentById(paymentId),
    enabled: isAuthenticated && !!paymentId,
  });

  const confirmMutation = useMutation({
    mutationFn: () => paymentService.confirmPayment(paymentId),
    onSuccess: () => {
      toast.success('Pago confirmado exitosamente');
      queryClient.invalidateQueries({ queryKey: ['payment', paymentId] });
      queryClient.invalidateQueries({ queryKey: ['payments'] });
      if (payment?.orderId) {
        queryClient.invalidateQueries({ queryKey: ['order', payment.orderId] });
        queryClient.invalidateQueries({ queryKey: ['paymentByOrder', payment.orderId] });
      }
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Error al confirmar el pago');
    }
  });

  const failMutation = useMutation({
    mutationFn: () => paymentService.failPayment(paymentId),
    onSuccess: () => {
      toast.success('Pago marcado como fallido');
      queryClient.invalidateQueries({ queryKey: ['payment', paymentId] });
      queryClient.invalidateQueries({ queryKey: ['payments'] });
      if (payment?.orderId) {
        queryClient.invalidateQueries({ queryKey: ['order', payment.orderId] });
        queryClient.invalidateQueries({ queryKey: ['paymentByOrder', payment.orderId] });
      }
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Error al fallar el pago');
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
      <div className="container mx-auto px-4 py-8 max-w-3xl space-y-6">
        <Skeleton className="h-10 w-32 mb-8" />
        <Skeleton className="h-64 w-full rounded-xl" />
      </div>
    );
  }

  if (isError || !payment) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-3xl">
        <Button variant="ghost" onClick={() => router.push('/payments')} className="mb-6">
          <ArrowLeft className="mr-2 h-4 w-4" /> Volver a mis pagos
        </Button>
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>
            No pudimos cargar los detalles de este pago.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  const handleConfirm = () => {
    if (window.confirm('¿Estás seguro de confirmar este pago?')) {
      confirmMutation.mutate();
    }
  };

  const handleFail = () => {
    if (window.confirm('¿Estás seguro de marcar este pago como fallido?')) {
      failMutation.mutate();
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return <Badge className="bg-green-500 hover:bg-green-600 text-sm py-1 px-3">Completado</Badge>;
      case 'FAILED':
        return <Badge variant="destructive" className="text-sm py-1 px-3">Fallido</Badge>;
      case 'PENDING':
      default:
        return <Badge variant="secondary" className="text-sm py-1 px-3">Pendiente</Badge>;
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl">
      <Button variant="ghost" onClick={() => router.push('/payments')} className="mb-8">
        <ArrowLeft className="mr-2 h-4 w-4" /> Volver a mis pagos
      </Button>

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Detalle de Pago</h1>
          <p className="text-muted-foreground mt-1 break-all">ID: {payment.id}</p>
        </div>
        <div className="flex gap-2">
          {getStatusBadge(payment.status)}
        </div>
      </div>
      
      <div className="border rounded-xl p-6 md:p-8 bg-card shadow-sm space-y-8">
        <div className="flex items-center justify-center py-6 border-b">
          <div className="text-center">
            <p className="text-sm text-muted-foreground mb-1">Monto Total</p>
            <p className="text-4xl md:text-5xl font-bold">${payment.amount.toFixed(2)}</p>
          </div>
        </div>

        <div className="grid gap-6 sm:grid-cols-2">
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground flex items-center gap-2">
              <Receipt className="h-4 w-4" />
              Orden ID
            </p>
            <Link href={`/orders/${payment.orderId}`} className="font-medium text-primary hover:underline break-all">
              {payment.orderId}
            </Link>
          </div>
          
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground flex items-center gap-2">
              <CreditCard className="h-4 w-4" />
              Método de Pago
            </p>
            <p className="font-medium">{payment.method}</p>
          </div>

          <div className="space-y-1">
            <p className="text-sm text-muted-foreground flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Fecha de Creación
            </p>
            <p className="font-medium">{new Date(payment.createdAt).toLocaleString()}</p>
          </div>

          {payment.paidAt && (
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-green-500" />
                Fecha de Pago
              </p>
              <p className="font-medium">{new Date(payment.paidAt).toLocaleString()}</p>
            </div>
          )}
        </div>

        {payment.status === 'PENDING' && (
          <div className="pt-6 border-t flex flex-col sm:flex-row gap-4 justify-end">
            <Button 
              variant="outline" 
              className="border-destructive text-destructive hover:bg-destructive/10"
              onClick={handleFail}
              disabled={failMutation.isPending || confirmMutation.isPending}
            >
              <XCircle className="mr-2 h-4 w-4" />
              Simular Fallo
            </Button>
            <Button 
              className="bg-green-600 hover:bg-green-700 text-white"
              onClick={handleConfirm}
              disabled={confirmMutation.isPending || failMutation.isPending}
            >
              <CheckCircle2 className="mr-2 h-4 w-4" />
              Confirmar Pago
            </Button>
          </div>
        )}

        {payment.status === 'COMPLETED' && (
          <div className="pt-6 border-t flex justify-center">
            <div className="bg-green-50 text-green-700 dark:bg-green-950/30 dark:text-green-400 px-4 py-3 rounded-lg flex items-center gap-2 w-full justify-center">
              <CheckCircle2 className="h-5 w-5" />
              <span className="font-medium">El pago se ha completado exitosamente</span>
            </div>
          </div>
        )}

        {payment.status === 'FAILED' && (
          <div className="pt-6 border-t flex justify-center">
            <div className="bg-destructive/10 text-destructive px-4 py-3 rounded-lg flex items-center gap-2 w-full justify-center">
              <XCircle className="h-5 w-5" />
              <span className="font-medium">El pago ha sido rechazado o fallido</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
