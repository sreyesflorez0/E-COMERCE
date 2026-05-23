import React, { useState } from 'react';
import { Notification } from '@/types/notification';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Trash2, CheckCircle, Bell, ShoppingCart, Package, CreditCard, XCircle, Beaker } from 'lucide-react';

interface NotificationCardProps {
  notification: Notification;
  onMarkAsRead: (id: string) => void;
  onDelete: (id: string) => void;
  isMarkingAsRead: boolean;
  isDeleting: boolean;
}

const getEventConfig = (eventType: string) => {
  switch (eventType) {
    case 'cart_updated':
      return { icon: ShoppingCart, color: 'bg-blue-100 text-blue-800 border-blue-200', label: 'Carrito' };
    case 'order_created':
      return { icon: Package, color: 'bg-indigo-100 text-indigo-800 border-indigo-200', label: 'Orden Creada' };
    case 'order_confirmed':
      return { icon: CheckCircle, color: 'bg-green-100 text-green-800 border-green-200', label: 'Orden Confirmada' };
    case 'payment_completed':
      return { icon: CreditCard, color: 'bg-emerald-100 text-emerald-800 border-emerald-200', label: 'Pago Exitoso' };
    case 'payment_failed':
      return { icon: XCircle, color: 'bg-red-100 text-red-800 border-red-200', label: 'Pago Fallido' };
    case 'manual_test':
      return { icon: Beaker, color: 'bg-purple-100 text-purple-800 border-purple-200', label: 'Test' };
    case 'notification_sent':
      return { icon: Bell, color: 'bg-gray-100 text-gray-800 border-gray-200', label: 'Notificación' };
    default:
      return { icon: Bell, color: 'bg-slate-100 text-slate-800 border-slate-200', label: 'Desconocido' };
  }
};

export function NotificationCard({
  notification,
  onMarkAsRead,
  onDelete,
  isMarkingAsRead,
  isDeleting,
}: NotificationCardProps) {
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  const config = getEventConfig(notification.eventType);
  const Icon = config.icon;

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return new Intl.DateTimeFormat('es-ES', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }).format(date);
    } catch {
      return dateString;
    }
  };

  return (
    <Card className={`relative overflow-hidden transition-all duration-200 hover:shadow-md ${!notification.read ? 'border-l-4 border-l-primary bg-primary/5' : ''}`}>
      <CardContent className="p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row gap-4 items-start">
          <div className={`p-3 rounded-full shrink-0 ${config.color}`}>
            <Icon className="h-6 w-6" />
          </div>
          
          <div className="flex-1 space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="outline" className={config.color}>
                {config.label}
              </Badge>
              {!notification.read && (
                <Badge className="bg-primary hover:bg-primary text-[10px]">
                  Nueva
                </Badge>
              )}
              <span className="text-xs text-muted-foreground ml-auto">
                {formatDate(notification.createdAt)}
              </span>
            </div>
            
            <p className={`text-sm sm:text-base ${!notification.read ? 'font-medium' : 'text-muted-foreground'}`}>
              {notification.message}
            </p>
          </div>

          <div className="flex flex-row sm:flex-col gap-2 shrink-0 w-full sm:w-auto justify-end sm:justify-start mt-4 sm:mt-0">
            {!notification.read && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onMarkAsRead(notification.id)}
                disabled={isMarkingAsRead}
                className="text-xs h-8"
              >
                <CheckCircle className="h-4 w-4 mr-1" />
                Marcar leída
              </Button>
            )}
            
            {!showConfirmDelete ? (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowConfirmDelete(true)}
                disabled={isDeleting}
                className="text-xs h-8 text-destructive hover:text-destructive hover:bg-destructive/10"
              >
                <Trash2 className="h-4 w-4 mr-1" />
                Eliminar
              </Button>
            ) : (
              <div className="flex gap-2 items-center bg-destructive/10 p-1 rounded-md">
                <span className="text-xs font-medium text-destructive px-2">¿Seguro?</span>
                <Button
                  variant="destructive"
                  size="sm"
                  className="h-6 text-[10px] px-2"
                  onClick={() => onDelete(notification.id)}
                  disabled={isDeleting}
                >
                  Sí
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 text-[10px] px-2"
                  onClick={() => setShowConfirmDelete(false)}
                  disabled={isDeleting}
                >
                  No
                </Button>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
