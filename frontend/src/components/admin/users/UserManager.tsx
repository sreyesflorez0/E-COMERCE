'use client';

import { useEffect, useState } from 'react';
import { useAuthStore } from '@/store/authStore';
import { AdminUser, UserRole } from '@/types/admin-user';
import { adminUserService } from '@/services/admin-user.service';
import { UserTable } from './UserTable';
import { Input } from '@/components/ui/input';
import { Loader2, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { toast } from 'sonner';
import Link from 'next/link';
import { isAxiosError } from 'axios';

export function UserManager() {
  const { user: currentUser } = useAuthStore();
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const loadUsers = async () => {
    try {
      setLoading(true);
      const data = await adminUserService.getUsers();
      setUsers(data);
    } catch (error: any) {
      toast.error('Error al cargar la lista de usuarios');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const handleUpdateRole = async (id: string, role: UserRole) => {
    try {
      setActionLoading(true);
      await adminUserService.updateUserRole(id, role);
      toast.success('Rol actualizado exitosamente');
      await loadUsers(); // reload list
    } catch (error) {
      if (isAxiosError(error)) {
        toast.error(error.response?.data?.message || 'Error al actualizar el rol');
      } else {
        toast.error('Ocurrió un error inesperado');
      }
    } finally {
      setActionLoading(false);
    }
  };

  const handleUpdateStatus = async (id: string, active: boolean) => {
    try {
      setActionLoading(true);
      await adminUserService.updateUserStatus(id, active);
      toast.success(active ? 'Usuario activado' : 'Usuario desactivado');
      await loadUsers(); // reload list
    } catch (error) {
      if (isAxiosError(error)) {
        toast.error(error.response?.data?.message || 'Error al actualizar el estado');
      } else {
        toast.error('Ocurrió un error inesperado');
      }
    } finally {
      setActionLoading(false);
    }
  };

  const filteredUsers = users.filter(u => 
    u.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (!currentUser) return null;

  return (
    <div className="max-w-6xl mx-auto py-8 px-4">
      <div className="flex items-center gap-4 mb-6">
        <Link href="/admin">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold">Gestión de Usuarios</h1>
          <p className="text-muted-foreground">Administra los accesos y roles de la plataforma</p>
        </div>
      </div>

      <div className="mb-6 max-w-sm">
        <Input 
          placeholder="Buscar por email..." 
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : filteredUsers.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <p className="text-muted-foreground">No se encontraron usuarios.</p>
          </CardContent>
        </Card>
      ) : (
        <UserTable 
          users={filteredUsers}
          currentUserId={currentUser.id}
          onUpdateRole={handleUpdateRole}
          onUpdateStatus={handleUpdateStatus}
          isLoadingAction={actionLoading}
        />
      )}
    </div>
  );
}
