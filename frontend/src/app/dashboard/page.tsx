'use client';

import { useAuthStore } from '@/store/authStore';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { User, Mail, ShieldAlert, Bell, Shield, Store } from 'lucide-react';
import Link from 'next/link';

export default function DashboardPage() {
  const { user } = useAuthStore();

  if (!user) {
    return null; // RouteGuard handles redirection
  }

  return (
    <div className="max-w-4xl mx-auto py-8">
      <h1 className="text-3xl font-bold mb-8">Dashboard</h1>
      
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              User ID
            </CardTitle>
            <User className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold truncate" title={user.id}>{user.id}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Your unique identifier
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Email
            </CardTitle>
            <Mail className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold truncate" title={user.email}>{user.email}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Registered email address
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Role
            </CardTitle>
            <ShieldAlert className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{user.role}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Current access level
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="mt-12">
        <h2 className="text-2xl font-bold mb-6">Accesos Rápidos</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {user?.role === 'ADMIN' && (
            <Link href="/admin" className="block group">
              <Card className="hover:border-primary transition-colors h-full border-primary/50 bg-primary/5">
                <CardHeader>
                  <CardTitle className="text-lg group-hover:text-primary transition-colors flex items-center gap-2">
                    <Shield className="h-5 w-5" />
                    Panel Administrador
                  </CardTitle>
                  <CardDescription>Gestión centralizada</CardDescription>
                </CardHeader>
              </Card>
            </Link>
          )}
          {user?.role === 'VENDOR' && (
            <Link href="/vendor" className="block group">
              <Card className="hover:border-primary transition-colors h-full border-primary/50 bg-primary/5">
                <CardHeader>
                  <CardTitle className="text-lg group-hover:text-primary transition-colors flex items-center gap-2">
                    <Store className="h-5 w-5" />
                    Panel Vendedor
                  </CardTitle>
                  <CardDescription>Gestión de tienda</CardDescription>
                </CardHeader>
              </Card>
            </Link>
          )}
          <Link href="/products" className="block group">
            <Card className="hover:border-primary transition-colors h-full">
              <CardHeader>
                <CardTitle className="text-lg group-hover:text-primary transition-colors">Catálogo</CardTitle>
                <CardDescription>Explora nuestra tienda</CardDescription>
              </CardHeader>
            </Card>
          </Link>
          <Link href="/cart" className="block group">
            <Card className="hover:border-primary transition-colors h-full">
              <CardHeader>
                <CardTitle className="text-lg group-hover:text-primary transition-colors">Mi Carrito</CardTitle>
                <CardDescription>Revisa tus items</CardDescription>
              </CardHeader>
            </Card>
          </Link>
          <Link href="/orders" className="block group">
            <Card className="hover:border-primary transition-colors h-full">
              <CardHeader>
                <CardTitle className="text-lg group-hover:text-primary transition-colors">Mis Órdenes</CardTitle>
                <CardDescription>Historial y seguimiento</CardDescription>
              </CardHeader>
            </Card>
          </Link>
          <Link href="/payments" className="block group">
            <Card className="hover:border-primary transition-colors h-full">
              <CardHeader>
                <CardTitle className="text-lg group-hover:text-primary transition-colors">Mis Pagos</CardTitle>
                <CardDescription>Gestión de transacciones</CardDescription>
              </CardHeader>
            </Card>
          </Link>
          <Link href="/notifications" className="block group">
            <Card className="hover:border-primary transition-colors h-full">
              <CardHeader>
                <CardTitle className="text-lg group-hover:text-primary transition-colors flex items-center gap-2">
                  Mis Notificaciones
                  <Bell className="h-4 w-4" />
                </CardTitle>
                <CardDescription>Alertas y actualizaciones</CardDescription>
              </CardHeader>
            </Card>
          </Link>
        </div>
      </div>
    </div>
  );
}
