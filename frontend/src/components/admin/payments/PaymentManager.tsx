'use client';

import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { adminPaymentService } from '@/services/admin-payment.service';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Loader2, Eye } from 'lucide-react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';

export function PaymentManager() {
  const searchParams = useSearchParams();
  const initialOrderId = searchParams.get('orderId') || '';
  
  const [searchTerm, setSearchTerm] = useState(initialOrderId);
  const [statusFilter, setStatusFilter] = useState('ALL');

  const { data: payments, isLoading, isError } = useQuery({
    queryKey: ['admin-payments'],
    queryFn: adminPaymentService.getPayments
  });

  const filteredPayments = payments?.filter(payment => {
    const matchesSearch = 
      payment.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.order_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.user_id.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'ALL' || payment.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  }) || [];

  return (
    <div className="max-w-7xl mx-auto py-8 px-4">
      <div className="flex items-center gap-4 mb-6">
        <Link href="/admin">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold">Gestión de Pagos</h1>
          <p className="text-muted-foreground">Revisión general de transacciones (Sólo lectura)</p>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <Input 
          placeholder="Buscar por Payment ID, Order ID o User ID..." 
          className="max-w-md"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <select 
          className="h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="ALL">Todos los estados</option>
          <option value="PENDING">PENDING</option>
          <option value="COMPLETED">COMPLETED</option>
          <option value="FAILED">FAILED</option>
        </select>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin" /></div>
      ) : isError ? (
        <div className="text-center text-red-500 py-8">Error al cargar los pagos</div>
      ) : filteredPayments.length === 0 ? (
        <div className="text-center text-muted-foreground py-12 border rounded-md">No se encontraron pagos</div>
      ) : (
        <div className="w-full overflow-auto rounded-md border">
          <table className="w-full text-sm text-left">
            <thead className="bg-muted text-muted-foreground border-b">
              <tr>
                <th className="px-4 py-3 font-medium">Payment ID</th>
                <th className="px-4 py-3 font-medium">Order ID</th>
                <th className="px-4 py-3 font-medium">Monto</th>
                <th className="px-4 py-3 font-medium">Método</th>
                <th className="px-4 py-3 font-medium">Estado</th>
                <th className="px-4 py-3 font-medium text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {filteredPayments.map((payment) => (
                <tr key={payment.id} className="hover:bg-muted/50">
                  <td className="px-4 py-3 font-mono text-xs truncate max-w-[120px]" title={payment.id}>
                    {payment.id}
                  </td>
                  <td className="px-4 py-3 font-mono text-xs truncate max-w-[120px]">
                    <Link href={`/admin/orders/${payment.order_id}`} className="text-blue-500 hover:underline" title={payment.order_id}>
                      {payment.order_id.substring(0,8)}...
                    </Link>
                  </td>
                  <td className="px-4 py-3 font-semibold">
                    ${Number(payment.amount).toFixed(2)}
                  </td>
                  <td className="px-4 py-3">
                    <span className="bg-gray-100 text-gray-800 text-xs px-2 py-1 rounded-md">{payment.method}</span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-xs font-semibold px-2 py-1 rounded-md ${
                      payment.status === 'COMPLETED' ? 'bg-green-100 text-green-800' :
                      payment.status === 'FAILED' ? 'bg-red-100 text-red-800' :
                      'bg-yellow-100 text-yellow-800'
                    }`}>
                      {payment.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Link href={`/admin/payments/${payment.id}`}>
                      <Button variant="outline" size="sm" className="h-8">
                        <Eye className="h-4 w-4 mr-2" />
                        Ver
                      </Button>
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
