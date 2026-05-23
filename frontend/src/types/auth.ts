export type Role = "ADMIN" | "CLIENT" | "VENDOR";

export interface User {
  id: string;
  email: string;
  role: Role;
}

export interface AuthState {
  user: User | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (accessToken: string, user: User) => void;
  logout: () => void;
  setLoading: (isLoading: boolean) => void;
}

// Responses from the API
export interface LoginResponse {
  accessToken?: string;
  token?: string;
  refreshToken?: string;
  user?: any;
}

export interface MeResponse {
  id?: string;
  userId?: string;
  sub?: string;
  email?: string;
  role?: string;
}
