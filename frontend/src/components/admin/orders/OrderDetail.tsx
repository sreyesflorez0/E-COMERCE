'use client';

import { useQuery } from '@tanstack/react-query';
import { adminOrderService } from '@/services/admin-order.service';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Loader2, Package, CreditCard } from 'lucide-react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export function OrderDetail({ id }: { id: string }) {
  const { data: order, isLoading, isError } = useQuery({
    queryKey: ['admin-order', id],
    queryFn: () => adminOrderService.getOrderById(id)
  });

  if (isLoading) return <div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin" /></div>;
  if (isError || !order) return <div className="text-center text-red-500 py-8">Orden no encontrada o error de carga.</div>;

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      <div className="flex items-center gap-4 mb-6">
        <Link href="/admin/orders">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold">Detalle de Orden</h1>
          <p className="text-muted-foreground font-mono text-sm">{order.id}</p>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6 mb-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Información General</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div className="flex justify-between border-b pb-2">
              <span className="text-muted-foreground">Estado:</span>
              <span className="font-semibold">{order.status}</span>
            </div>
            <div className="flex justify-between border-b pb-2">
              <span className="text-muted-foreground">Fecha de creación:</span>
              <span>{new Date(order.created_at).toLocaleString()}</span>
            </div>
            <div className="flex justify-between border-b pb-2">
              <span className="text-muted-foreground">User ID:</span>
              <span className="font-mono text-xs">{order.user_id}</span>
            </div>
            <div className="flex justify-between border-b pb-2">
              <span className="text-muted-foreground">Total:</span>
              <span className="font-bold text-lg">${Number(order.total).toFixed(2)}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Envío y Pagos</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm">
            <div>
              <p className="text-muted-foreground mb-1">Dirección de envío:</p>
              <p className="font-medium p-3 bg-muted rounded-md">{order.shipping_address}</p>
            </div>
            <div className="pt-2">
              <Link href={`/admin/payments?orderId=${order.id}`}>
                <Button variant="outline" className="w-full">
                  <CreditCard className="w-4 h-4 mr-2" />
                  Ver pago asociado
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Package className="w-5 h-5" /> Artículos de la orden
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-auto border rounded-md">
            <table className="w-full text-sm text-left">
              <thead className="bg-muted text-muted-foreground border-b">
                <tr>
                  <th className="px-4 py-2 font-medium">Product ID</th>
                  <th className="px-4 py-2 font-medium text-right">Precio Unitario</th>
                  <th className="px-4 py-2 font-medium text-right">Cantidad</th>
                  <th className="px-4 py-2 font-medium text-right">Subtotal</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {order.items.map(item => (
                  <tr key={item.id} className="hover:bg-muted/50">
                    <td className="px-4 py-2 font-mono text-xs">{item.product_id}</td>
                    <td className="px-4 py-2 text-right">${Number(item.unit_price).toFixed(2)}</td>
                    <td className="px-4 py-2 text-right">{item.quantity}</td>
                    <td className="px-4 py-2 text-right font-medium">${Number(item.subtotal).toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
