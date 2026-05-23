'use client';

import { AdminUser, UserRole } from '@/types/admin-user';
import { Button } from '@/components/ui/button';
import { Shield, ShieldAlert, Store, User as UserIcon, CheckCircle2, XCircle } from 'lucide-react';
import { toast } from 'sonner';

interface UserTableProps {
  users: AdminUser[];
  currentUserId: string;
  onUpdateRole: (id: string, role: UserRole) => Promise<void>;
  onUpdateStatus: (id: string, active: boolean) => Promise<void>;
  isLoadingAction: boolean;
}

export function UserTable({ users, currentUserId, onUpdateRole, onUpdateStatus, isLoadingAction }: UserTableProps) {
  
  const handleRoleChange = async (user: AdminUser, newRole: UserRole) => {
    if (user.id === currentUserId) {
      toast.error('No puedes cambiar tu propio rol.');
      return;
    }
    if (window.confirm(`¿Estás seguro de cambiar el rol de ${user.email} a ${newRole}?`)) {
      await onUpdateRole(user.id, newRole);
    }
  };

  const handleStatusChange = async (user: AdminUser) => {
    if (user.id === currentUserId) {
      toast.error('No puedes desactivar tu propia cuenta.');
      return;
    }
    const newStatus = !user.active;
    const action = newStatus ? 'activar' : 'desactivar';
    if (window.confirm(`¿Estás seguro de ${action} a ${user.email}?`)) {
      await onUpdateStatus(user.id, newStatus);
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'ADMIN': return <ShieldAlert className="h-4 w-4 text-destructive" />;
      case 'VENDOR': return <Store className="h-4 w-4 text-blue-500" />;
      default: return <UserIcon className="h-4 w-4 text-muted-foreground" />;
    }
  };

  return (
    <div className="w-full overflow-auto rounded-md border">
      <table className="w-full text-sm text-left">
        <thead className="bg-muted text-muted-foreground border-b">
          <tr>
            <th className="px-4 py-3 font-medium">ID</th>
            <th className="px-4 py-3 font-medium">Email</th>
            <th className="px-4 py-3 font-medium">Rol</th>
            <th className="px-4 py-3 font-medium">Estado</th>
            <th className="px-4 py-3 font-medium text-right">Acciones</th>
          </tr>
        </thead>
        <tbody className="divide-y">
          {users.map((user) => {
            const isCurrentUser = user.id === currentUserId;
            
            return (
              <tr key={user.id} className="hover:bg-muted/50 transition-colors">
                <td className="px-4 py-3 font-mono text-xs" title={user.id}>
                  {user.id.split('-')[0]}...
                </td>
                <td className="px-4 py-3 font-medium">
                  {user.email}
                  {isCurrentUser && <span className="ml-2 text-xs text-primary font-bold">(Tú)</span>}
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    {getRoleIcon(user.role)}
                    <span className="font-semibold">{user.role}</span>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    {user.active ? (
                      <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
                        <CheckCircle2 className="h-3 w-3" /> Activo
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400">
                        <XCircle className="h-3 w-3" /> Inactivo
                      </span>
                    )}
                  </div>
                </td>
                <td className="px-4 py-3 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <select
                      className="h-8 w-24 rounded-md border border-input bg-background px-2 py-1 text-xs disabled:opacity-50"
                      value={user.role}
                      onChange={(e) => handleRoleChange(user, e.target.value as UserRole)}
                      disabled={isCurrentUser || isLoadingAction}
                    >
                      <option value="CLIENT">CLIENT</option>
                      <option value="VENDOR">VENDOR</option>
                      <option value="ADMIN">ADMIN</option>
                    </select>
                    
                    <Button
                      variant={user.active ? 'destructive' : 'default'}
                      size="sm"
                      className="h-8 text-xs w-24"
                      onClick={() => handleStatusChange(user)}
                      disabled={isCurrentUser || isLoadingAction}
                    >
                      {user.active ? 'Desactivar' : 'Activar'}
                    </Button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
