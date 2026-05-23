'use client';

import Link from 'next/link';
import { useAuthStore } from '@/store/authStore';
import { Button } from '@/components/ui/button';
import { LogOut, LayoutDashboard, LogIn, UserPlus, ShoppingBag, ShoppingCart, Package, CreditCard, Bell } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useCart } from '@/hooks/useCart';
import { useNotifications } from '@/hooks/useNotifications';

export function Navbar() {
  const { isAuthenticated, logout } = useAuthStore();
  const router = useRouter();
  const { cart } = useCart();
  const { unreadCount, isUnreadCountLoading, isError } = useNotifications();

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 flex h-16 items-center justify-between">
        <div className="flex gap-2 items-center">
          <Link href="/" className="flex items-center gap-2">
            <ShoppingBag className="h-6 w-6" />
            <span className="font-bold text-xl tracking-tight">E-STORE</span>
          </Link>
        </div>
        
        <nav className="flex items-center gap-4">
          <Link href="/products">
            <Button variant="ghost" className="font-medium text-muted-foreground hover:text-primary">
              Productos
            </Button>
          </Link>
          {isAuthenticated ? (
            <>
              <Link href="/cart">
                <Button variant="ghost" className="gap-2 relative">
                  <ShoppingCart className="h-4 w-4" />
                  <span className="hidden sm:inline">Carrito</span>
                  {cart && cart.items && cart.items.length > 0 && (
                    <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
                      {cart.items.length}
                    </span>
                  )}
                </Button>
              </Link>
              <Link href="/orders">
                <Button variant="ghost" className="gap-2">
                  <Package className="h-4 w-4" />
                  <span className="hidden sm:inline">Órdenes</span>
                </Button>
              </Link>
              <Link href="/payments">
                <Button variant="ghost" className="gap-2">
                  <CreditCard className="h-4 w-4" />
                  <span className="hidden sm:inline">Pagos</span>
                </Button>
              </Link>
              <Link href="/dashboard">
                <Button variant="ghost" className="gap-2">
                  <LayoutDashboard className="h-4 w-4" />
                  <span className="hidden sm:inline">Dashboard</span>
                </Button>
              </Link>
              <Link href="/notifications">
                <Button variant="ghost" className="gap-2 relative">
                  <Bell className="h-4 w-4" />
                  <span className="hidden sm:inline">Notificaciones</span>
                  {!isUnreadCountLoading && !isError && unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-destructive text-[10px] font-bold text-destructive-foreground">
                      {unreadCount > 99 ? '99+' : unreadCount}
                    </span>
                  )}
                </Button>
              </Link>
              <Button variant="outline" onClick={handleLogout} className="gap-2">
                <LogOut className="h-4 w-4" />
                <span className="hidden sm:inline">Logout</span>
              </Button>
            </>
          ) : (
            <>
              <Link href="/login">
                <Button variant="ghost" className="gap-2">
                  <LogIn className="h-4 w-4" />
                  <span className="hidden sm:inline">Login</span>
                </Button>
              </Link>
              <Link href="/register">
                <Button className="gap-2">
                  <UserPlus className="h-4 w-4" />
                  <span className="hidden sm:inline">Register</span>
                </Button>
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
