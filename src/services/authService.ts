import { api } from './api';

// Interfaces para autenticação
export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  message: string;
  user: {
    id: string;
    email: string;
    nome?: string;
    funcao?: string;
    departamento?: string;
  };
  session: {
    token: string;
    expires_at: string;
  };
}

export interface RegisterRequest {
  email: string;
  password: string;
  nome?: string;
  funcao?: string;
  departamento?: string;
}

export interface RegisterResponse {
  message: string;
  user: {
    id: string;
    email: string;
    nome?: string;
    funcao?: string;
    departamento?: string;
  };
}

export interface User {
  id: string;
  email: string;
  nome?: string;
  funcao?: string;
  departamento?: string;
  created_at: string;
}

// Serviço de autenticação
export const authService = {
  // Login do usuário
  login: async (credentials: LoginRequest): Promise<LoginResponse> => {
    return api.post<LoginResponse>('/api/auth/login', credentials);
  },

  // Registro de novo usuário
  register: async (userData: RegisterRequest): Promise<RegisterResponse> => {
    return api.post<RegisterResponse>('/api/auth/register', userData);
  },

  // Obter dados do usuário atual
  me: async (): Promise<User> => {
    return api.get<User>('/api/auth/me');
  },

  // Logout do usuário
  logout: async (): Promise<{ message: string }> => {
    return api.post<{ message: string }>('/api/auth/logout');
  },

  // Solicitar recuperação de senha
  forgotPassword: async (email: string): Promise<{ message: string }> => {
    return api.post<{ message: string }>('/api/auth/forgot-password', { email });
  },

  // Redefinir senha
  resetPassword: async (token: string, password: string): Promise<{ message: string }> => {
    return api.post<{ message: string }>('/api/auth/reset-password', { token, password });
  },

  // Verificar validade do token
  verifyToken: async (): Promise<{ valid: boolean; user?: User }> => {
    try {
      const user = await api.get<User>('/api/auth/verify');
      return { valid: true, user };
    } catch {
      return { valid: false };
    }
  },
};
