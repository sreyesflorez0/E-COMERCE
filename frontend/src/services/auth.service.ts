import { api } from '@/lib/api';
import { LoginResponse, MeResponse, Role, User } from '@/types/auth';

export const authService = {
  async login(credentials: any): Promise<{ accessToken: string; user: User }> {
    const { data } = await api.post<LoginResponse>('/auth/login', credentials);
    
    // Normalize accessToken
    const accessToken = data.accessToken || data.token;
    
    if (!accessToken) {
      throw new Error("No access token received from login");
    }

    // After login, we fetch the /me profile to have normalized user data
    // Setting the Authorization header manually here because the store isn't updated yet.
    const meResponse = await api.get<MeResponse>('/auth/me', {
      headers: {
        Authorization: `Bearer ${accessToken}`
      }
    });

    const userData = meResponse.data;

    // Normalize User
    const normalizedUser: User = {
      id: userData.id || userData.userId || userData.sub || '',
      email: userData.email || '',
      role: (userData.role?.toUpperCase() as Role) || 'CLIENT'
    };

    return { accessToken, user: normalizedUser };
  },

  async register(data: any): Promise<void> {
    await api.post('/auth/register', data);
  },

  async me(): Promise<User> {
    const { data } = await api.get<MeResponse>('/auth/me');
    
    return {
      id: data.id || data.userId || data.sub || '',
      email: data.email || '',
      role: (data.role?.toUpperCase() as Role) || 'CLIENT'
    };
  }
};
