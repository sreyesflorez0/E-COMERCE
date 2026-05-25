import { api } from '@/lib/api';
import { AdminUser, RoleUpdateRequest, StatusUpdateRequest } from '@/types/admin-user';

export const adminUserService = {
  async getUsers(): Promise<AdminUser[]> {
    const response = await api.get<AdminUser[]>('/auth/admin/users');
    return response.data;
  },

  async getUserById(id: string): Promise<AdminUser> {
    const response = await api.get<AdminUser>(`/auth/admin/users/${id}`);
    return response.data;
  },

  async updateUserRole(id: string, role: string): Promise<AdminUser> {
    const payload: RoleUpdateRequest = { role: role as any };
    const response = await api.patch<AdminUser>(`/auth/admin/users/${id}/role`, payload);
    return response.data;
  },

  async updateUserStatus(id: string, active: boolean): Promise<AdminUser> {
    const payload: StatusUpdateRequest = { active };
    const response = await api.patch<AdminUser>(`/auth/admin/users/${id}/status`, payload);
    return response.data;
  }
};
