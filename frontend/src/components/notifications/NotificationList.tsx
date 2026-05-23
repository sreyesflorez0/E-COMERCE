'use client';

import React, { useState } from 'react';
import { useNotifications } from '@/hooks/useNotifications';
import { NotificationCard } from './NotificationCard';
import { Button } from '@/components/ui/button';
import { Bell, Loader2, CheckCircle2 } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

export function NotificationList() {
  const [filter, setFilter] = useState<'all' | 'unread'>('all');
  const [eventType, setEventType] = useState<string>('all');

  const queryFilters = {
    ...(filter === 'unread' ? { unread: true } : {}),
    ...(eventType !== 'all' ? { event_type: eventType } : {}),
  };

  const {
    notifications,
    isLoading,
    isError,
    markAsRead,
    isMarkingAsRead,
    markAllAsRead,
    isMarkingAllAsRead,
    deleteNotification,
    isDeleting,
  } = useNotifications(queryFilters);

  const hasUnread = notifications?.some(n => !n.read) ?? false;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-card p-4 rounded-lg border shadow-sm">
        <div className="flex flex-wrap gap-4 items-center w-full sm:w-auto">
          <select 
            value={filter} 
            onChange={(e) => setFilter(e.target.value as 'all' | 'unread')}
            className="flex h-10 w-[140px] items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <option value="all">Todas</option>
            <option value="unread">No leídas</option>
          </select>

          <select 
            value={eventType} 
            onChange={(e) => setEventType(e.target.value)}
            className="flex h-10 w-[180px] items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <option value="all">Todos los eventos</option>
            <option value="cart_updated">Carrito</option>
            <option value="order_created">Orden Creada</option>
            <option value="order_confirmed">Orden Confirmada</option>
            <option value="payment_completed">Pago Exitoso</option>
            <option value="payment_failed">Pago Fallido</option>
          </select>
        </div>

        {hasUnread && (
          <Button 
            variant="outline" 
            onClick={() => markAllAsRead()}
            disabled={isMarkingAllAsRead}
            className="w-full sm:w-auto whitespace-nowrap"
          >
            {isMarkingAllAsRead ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <CheckCircle2 className="h-4 w-4 mr-2" />
            )}
            Marcar todas como leídas
          </Button>
        )}
      </div>

      <div className="space-y-4">
        {isLoading && (
          <>
            {[1, 2, 3].map((i) => (
              <div key={i} className="p-6 rounded-xl border bg-card/50 flex gap-4">
                <Skeleton className="h-12 w-12 rounded-full" />
                <div className="space-y-2 flex-1">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-4 w-full" />
                </div>
              </div>
            ))}
          </>
        )}

        {isError && (
          <div className="text-center py-12 bg-destructive/5 rounded-xl border border-destructive/20 text-destructive">
            <p>Ocurrió un error al cargar las notificaciones.</p>
          </div>
        )}

        {!isLoading && !isError && notifications?.length === 0 && (
          <div className="text-center py-16 bg-muted/30 rounded-xl border border-dashed">
            <Bell className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
            <h3 className="text-lg font-medium text-foreground">No tienes notificaciones</h3>
            <p className="text-sm text-muted-foreground mt-1">
              Aquí aparecerán las actualizaciones de tus órdenes y cuenta.
            </p>
          </div>
        )}

        {!isLoading && !isError && notifications && notifications.length > 0 && (
          <div className="space-y-3">
            {notifications.map((notification) => (
              <NotificationCard
                key={notification.id}
                notification={notification}
                onMarkAsRead={markAsRead}
                onDelete={deleteNotification}
                isMarkingAsRead={isMarkingAsRead}
                isDeleting={isDeleting}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
