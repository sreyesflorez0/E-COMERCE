import { RoleGuard } from '@/components/auth/RoleGuard';

export default function VendorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <RoleGuard requiredRoles={['VENDOR']}>
      {children}
    </RoleGuard>
  );
}
