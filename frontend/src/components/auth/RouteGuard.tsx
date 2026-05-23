'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';

const publicPaths = ['/login', '/register'];

export function RouteGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { isAuthenticated, isLoading, setLoading } = useAuthStore();

  useEffect(() => {
    // Basic hydration check to prevent UI flashing
    setLoading(false);
  }, [setLoading]);

  useEffect(() => {
    if (isLoading) return;

    const pathIsProtected = !publicPaths.includes(pathname) && pathname !== '/';

    if (!isAuthenticated && pathIsProtected) {
      router.push('/login');
    } else if (isAuthenticated && publicPaths.includes(pathname)) {
      router.push('/dashboard');
    }
  }, [isAuthenticated, isLoading, pathname, router]);

  // If loading and trying to access protected routes, could return a spinner
  // Here we just render children, they will be hidden or redirected shortly if unauthorized.
  
  return <>{children}</>;
}
