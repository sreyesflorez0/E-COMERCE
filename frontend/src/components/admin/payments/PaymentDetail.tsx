'use client';

import { useQuery } from '@tanstack/react-query';
import { adminPaymentService } from '@/services/admin-payment.service';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Loader2, ShoppingBag } from 'lucide-react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export function PaymentDetail({ id }: { id: string }) {
  const { data: payment, isLoading, isError } = useQuery({
    queryKey: ['admin-payment', id],
    queryFn: () => adminPaymentService.getPaymentById(id)
  });

  if (isLoading) return <div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin" /></div>;
  if (isError || !payment) return <div className="text-center text-red-500 py-8">Pago no encontrado o error de carga.</div>;

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      <div className="flex items-center gap-4 mb-6">
        <Link href="/admin/payments">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold">Detalle de Pago</h1>
          <p className="text-muted-foreground font-mono text-sm">{payment.id}</p>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Transacción</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="flex justify-between border-b pb-2">
              <span className="text-muted-foreground">Estado:</span>
              <span className={`font-semibold ${payment.status === 'COMPLETED' ? 'text-green-600' : payment.status === 'FAILED' ? 'text-red-600' : 'text-yellow-600'}`}>
                {payment.status}
              </span>
            </div>
            <div className="flex justify-between border-b pb-2">
              <span className="text-muted-foreground">Monto:</span>
              <span className="font-bold text-lg">${Number(payment.amount).toFixed(2)}</span>
            </div>
            <div className="flex justify-between border-b pb-2">
              <span className="text-muted-foreground">Método:</span>
              <span>{payment.method}</span>
            </div>
            <div className="flex justify-between border-b pb-2">
              <span className="text-muted-foreground">Iniciado el:</span>
              <span>{new Date(payment.created_at).toLocaleString()}</span>
            </div>
            {payment.paid_at && (
              <div className="flex justify-between border-b pb-2">
                <span className="text-muted-foreground">Pagado el:</span>
                <span>{new Date(payment.paid_at).toLocaleString()}</span>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Relaciones</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm">
            <div>
              <p className="text-muted-foreground mb-1">Usuario (User ID):</p>
              <p className="font-mono text-xs p-2 bg-muted rounded-md">{payment.user_id}</p>
            </div>
            <div>
              <p className="text-muted-foreground mb-1">Orden (Order ID):</p>
              <p className="font-mono text-xs p-2 bg-muted rounded-md mb-3">{payment.order_id}</p>
              
              <Link href={`/admin/orders/${payment.order_id}`}>
                <Button variant="default" className="w-full">
                  <ShoppingBag className="w-4 h-4 mr-2" />
                  Ir al Detalle de la Orden
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
