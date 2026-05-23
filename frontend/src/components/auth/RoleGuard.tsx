'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { Role } from '@/types/auth';
import { UnauthorizedState } from './UnauthorizedState';
import { Loader2 } from 'lucide-react';

interface RoleGuardProps {
  children: React.ReactNode;
  requiredRoles: Role[];
}

export function RoleGuard({ children, requiredRoles }: RoleGuardProps) {
  const router = useRouter();
  const { isAuthenticated, isLoading, user } = useAuthStore();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (!isMounted || isLoading) return;

    if (!isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, isLoading, isMounted, router]);

  if (!isMounted || isLoading) {
    return (
      <div className="flex h-[50vh] w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return null; // Will redirect in useEffect
  }

  if (user && !requiredRoles.includes(user.role)) {
    return <UnauthorizedState />;
  }

  return <>{children}</>;
}
