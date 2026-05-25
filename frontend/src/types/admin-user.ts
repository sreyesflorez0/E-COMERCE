export type UserRole = 'ADMIN' | 'CLIENT' | 'VENDOR';

export interface AdminUser {
  id: string;
  email: string;
  role: UserRole;
  active: boolean;
  createdAt?: string;
}

export interface RoleUpdateRequest {
  role: UserRole;
}

export interface StatusUpdateRequest {
  active: boolean;
}
