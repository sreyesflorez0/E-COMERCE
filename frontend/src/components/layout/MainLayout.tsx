'use client';

import { Navbar } from './Navbar';
import { RouteGuard } from '@/components/auth/RouteGuard';

export function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <RouteGuard>
      <div className="flex min-h-screen flex-col bg-background">
        <Navbar />
        <main className="flex-1 container mx-auto px-4 py-8">
          {children}
        </main>
      </div>
    </RouteGuard>
  );
}
