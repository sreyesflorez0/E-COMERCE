import { RoleGuard } from '@/components/auth/RoleGuard';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <RoleGuard requiredRoles={['ADMIN']}>
      {children}
    </RoleGuard>
  );
}
