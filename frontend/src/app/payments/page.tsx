'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { useQuery } from '@tanstack/react-query';
import { paymentService } from '@/services/payment.service';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { CreditCard, Calendar, Receipt, ShieldAlert, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import Link from 'next/link';

export default function PaymentsPage() {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (isClient && !isAuthenticated) {
      router.push('/login');
    }
  }, [isClient, isAuthenticated, router]);

  const { data: payments, isLoading, isError } = useQuery({
    queryKey: ['payments'],
    queryFn: paymentService.getMyPayments,
    enabled: isAuthenticated,
  });

  if (!isClient || !isAuthenticated) {
    return null;
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return <Badge className="bg-green-500 hover:bg-green-600">Completado</Badge>;
      case 'FAILED':
        return <Badge variant="destructive">Fallido</Badge>;
      case 'PENDING':
      default:
        return <Badge variant="secondary">Pendiente</Badge>;
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Mis Pagos</h1>
          <p className="text-muted-foreground mt-1">Historial y estado de tus transacciones</p>
        </div>
      </div>

      {isLoading && (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-64 w-full rounded-xl" />
          ))}
        </div>
      )}

      {isError && (
        <Alert variant="destructive" className="max-w-2xl">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>
            No pudimos cargar tus pagos. Por favor, intenta nuevamente más tarde.
          </AlertDescription>
        </Alert>
      )}

      {!isLoading && !isError && payments?.length === 0 && (
        <Card className="max-w-2xl mx-auto border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-12 text-center space-y-4">
            <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center">
              <Receipt className="h-6 w-6 text-muted-foreground" />
            </div>
            <div className="space-y-1">
              <h3 className="text-xl font-medium">Aún no tienes pagos</h3>
              <p className="text-muted-foreground">
                Los pagos que realices aparecerán aquí.
              </p>
            </div>
            <Button asChild className="mt-4">
              <Link href="/orders">Ir a Mis Órdenes</Link>
            </Button>
          </CardContent>
        </Card>
      )}

      {!isLoading && !isError && payments && payments.length > 0 && (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {payments.map((payment) => (
            <Card key={payment.id} className="flex flex-col hover:border-primary/50 transition-colors">
              <CardHeader className="pb-4">
                <div className="flex justify-between items-start mb-2">
                  <Badge variant="outline" className="font-mono text-xs">
                    #{payment.id.split('-')[0]}
                  </Badge>
                  {getStatusBadge(payment.status)}
                </div>
                <CardTitle className="text-2xl font-bold">
                  ${payment.amount.toFixed(2)}
                </CardTitle>
                <CardDescription className="flex items-center gap-1 mt-2">
                  <Receipt className="h-3 w-3" />
                  Orden: <Link href={`/orders/${payment.orderId}`} className="underline hover:text-primary">{payment.orderId.split('-')[0]}</Link>
                </CardDescription>
              </CardHeader>
              <CardContent className="flex-grow">
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between items-center text-muted-foreground">
                    <span className="flex items-center gap-2"><CreditCard className="h-4 w-4" /> Método</span>
                    <span className="font-medium text-foreground">{payment.method}</span>
                  </div>
                  <div className="flex justify-between items-center text-muted-foreground">
                    <span className="flex items-center gap-2"><Calendar className="h-4 w-4" /> Fecha</span>
                    <span className="font-medium text-foreground">
                      {new Date(payment.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="border-t pt-4">
                <Button asChild variant="outline" className="w-full">
                  <Link href={`/payments/${payment.id}`}>Ver detalle</Link>
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
