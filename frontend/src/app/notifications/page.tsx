'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { NotificationList } from '@/components/notifications/NotificationList';
import { Bell } from 'lucide-react';

export default function NotificationsPage() {
  const { isAuthenticated } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    // Basic redirect if not authenticated
    // Note: if you have a global RouteGuard this might be redundant
    if (!isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, router]);

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl min-h-[calc(100vh-4rem)]">
      <div className="mb-8 flex items-center gap-3">
        <div className="p-3 bg-primary/10 rounded-full text-primary">
          <Bell className="h-6 w-6" />
        </div>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Centro de Notificaciones</h1>
          <p className="text-muted-foreground mt-1">
            Gestiona tus alertas y actualizaciones
          </p>
        </div>
      </div>
      
      <NotificationList />
    </div>
  );
}
